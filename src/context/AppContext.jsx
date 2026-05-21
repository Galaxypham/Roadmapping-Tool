import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  ACTION_TYPE,
  DEFAULT_APP_SETTINGS,
  DEFAULT_RICE_CONFIG,
  LIFECYCLE_STATUS,
  ROLES,
  isOnRoadmap,
  migrateCaseNumber,
  migratePipelineStatus,
  migratePriority,
} from "../lib/constants.js";
import { uuid } from "../lib/format.js";
import { calculateRice, isValidRiceScores } from "../lib/rice.js";
import { migrateLegacyRice } from "../lib/riceMigration.js";
import { buildSeedData } from "../lib/seed.js";
import * as storage from "../lib/storage.js";

const AppContext = createContext(null);

// Assigns roadmap_rank values to any roadmapped case missing one. Existing
// rankings are preserved. New cases get appended in RICE-descending order
// (highest RICE goes first; nulls go to the bottom). This makes the migration
// idempotent and means the first-time migration matches what users would
// expect from the prior auto-sorted view.
function ensureRoadmapRanks(cases) {
  const ranked = cases.filter(
    (c) => isOnRoadmap(c) && Number.isFinite(c.roadmap_rank),
  );
  let nextRank =
    ranked.length > 0
      ? Math.max(...ranked.map((c) => c.roadmap_rank)) + 1
      : 0;

  const unranked = cases
    .filter((c) => isOnRoadmap(c) && !Number.isFinite(c.roadmap_rank))
    .sort((a, b) => {
      const ar = a.rice?.weighted_total ?? -Infinity;
      const br = b.rice?.weighted_total ?? -Infinity;
      if (br !== ar) return br - ar;
      return new Date(b.created_at) - new Date(a.created_at);
    });

  if (unranked.length === 0) return cases;

  const assigned = new Map();
  for (const c of unranked) {
    assigned.set(c.id, nextRank++);
  }

  return cases.map((c) =>
    assigned.has(c.id) ? { ...c, roadmap_rank: assigned.get(c.id) } : c,
  );
}

// Backfills `lifecycle_status` for any roadmapped case that doesn't have
// one yet. New roadmapped work always starts in Discovery; existing data
// without a stage is treated the same way.
function ensureLifecycleStarted(cases) {
  return cases.map((c) =>
    isOnRoadmap(c) && !c.lifecycle_status
      ? { ...c, lifecycle_status: LIFECYCLE_STATUS.DISCOVERY }
      : c,
  );
}

function normalizeCaseRice(caseObj, riceConfig) {
  if (!caseObj.rice || caseObj.rice.reach == null) return caseObj;

  // Old saved data used a 1–5 scale for every dimension. Detect that
  // shape and lift it onto the new industry-standard scales before
  // computing the score.
  const migrated = migrateLegacyRice(caseObj.rice);

  if (!isValidRiceScores(migrated)) {
    return {
      ...caseObj,
      rice: { ...migrated, weighted_total: null },
    };
  }

  const weighted_total = calculateRice(migrated, riceConfig);
  return {
    ...caseObj,
    rice: { ...migrated, weighted_total },
  };
}

function bootstrapState() {
  if (storage.isStorageEmpty()) {
    const seed = buildSeedData();
    storage.setCases(seed.cases);
    storage.setCounter(seed.counter);
    storage.setRiceConfig({ ...DEFAULT_RICE_CONFIG });
  }
  const riceConfig = { ...DEFAULT_RICE_CONFIG, ...storage.getRiceConfig() };
  const appSettings = { ...DEFAULT_APP_SETTINGS, ...storage.getAppSettings() };
  const migratedCases = storage.getCases().map((c) =>
    normalizeCaseRice(
      {
        ...c,
        priority: migratePriority(c.priority),
        pipeline_status: migratePipelineStatus(c.pipeline_status),
        case_number: migrateCaseNumber(c.case_number),
        roadmap_rank: Number.isFinite(c.roadmap_rank) ? c.roadmap_rank : null,
      },
      riceConfig,
    ),
  );
  return {
    cases: ensureLifecycleStarted(ensureRoadmapRanks(migratedCases)),
    counter: storage.getCounter(),
    riceConfig,
    appSettings,
    role: storage.getRole(),
    userName: storage.getUserName(),
  };
}

export function AppProvider({ children }) {
  const [state, setState] = useState(() => bootstrapState());

  useEffect(() => storage.setCases(state.cases), [state.cases]);
  useEffect(() => storage.setCounter(state.counter), [state.counter]);
  useEffect(() => storage.setRiceConfig(state.riceConfig), [state.riceConfig]);
  useEffect(() => {
    if (state.appSettings) storage.setAppSettings(state.appSettings);
  }, [state.appSettings]);
  useEffect(() => {
    if (state.role) storage.setRole(state.role);
  }, [state.role]);
  useEffect(() => {
    if (state.userName) storage.setUserName(state.userName);
  }, [state.userName]);

  const setRole = useCallback((role) => {
    setState((s) => ({ ...s, role }));
  }, []);

  const setUserName = useCallback((name) => {
    setState((s) => ({ ...s, userName: name }));
  }, []);

  const addCase = useCallback((newCase) => {
    setState((s) => ({
      ...s,
      cases: [newCase, ...s.cases],
    }));
  }, []);

  const bumpCounter = useCallback(() => {
    let nextValue = storage.getCounter() + 1;
    setState((s) => {
      nextValue = s.counter + 1;
      return { ...s, counter: nextValue };
    });
    return nextValue;
  }, []);

  const updateCase = useCallback((caseId, updater) => {
    setState((s) => {
      const now = new Date().toISOString();
      const nextCases = s.cases.map((c) => {
        if (c.id !== caseId) return c;
        const updated = updater(c);
        const wasOnRoadmap = isOnRoadmap(c);
        const nowOnRoadmap = isOnRoadmap(updated);

        // Newly roadmapped: assign rank (append to bottom) and start the
        // product lifecycle in Discovery if no stage was set explicitly.
        // Existing rank/lifecycle are preserved on subsequent saves.
        const justEntered = nowOnRoadmap && !wasOnRoadmap;
        let next = { ...updated };
        if (nowOnRoadmap && !Number.isFinite(next.roadmap_rank)) {
          const ranks = s.cases
            .filter((other) => other.id !== caseId && isOnRoadmap(other))
            .map((other) => other.roadmap_rank)
            .filter((r) => Number.isFinite(r));
          next.roadmap_rank = ranks.length > 0 ? Math.max(...ranks) + 1 : 0;
        }
        if (justEntered && !next.lifecycle_status) {
          next.lifecycle_status = LIFECYCLE_STATUS.DISCOVERY;
        }
        return { ...next, updated_at: now };
      });
      return { ...s, cases: nextCases };
    });
  }, []);

  const reorderRoadmap = useCallback((orderedCaseIds, performedBy) => {
    setState((s) => {
      const now = new Date().toISOString();
      const indexById = new Map(orderedCaseIds.map((id, i) => [id, i]));
      const nextCases = s.cases.map((c) => {
        if (!indexById.has(c.id)) return c;
        const newRank = indexById.get(c.id);
        if (c.roadmap_rank === newRank) return c;
        return {
          ...c,
          roadmap_rank: newRank,
          updated_at: now,
          activity_log: [
            ...c.activity_log,
            {
              id: uuid(),
              action_type: ACTION_TYPE.ROADMAP_REORDERED,
              action_detail: `Roadmap position set to ${newRank + 1}`,
              reason: "",
              performed_by: performedBy || "PM",
              created_at: now,
            },
          ],
        };
      });
      return { ...s, cases: nextCases };
    });
  }, []);

  const appendActivity = useCallback(
    (caseId, entry) => {
      updateCase(caseId, (c) => ({
        ...c,
        activity_log: [
          ...c.activity_log,
          {
            id: uuid(),
            created_at: new Date().toISOString(),
            ...entry,
          },
        ],
      }));
    },
    [updateCase],
  );

  const appendRevision = useCallback(
    (caseId, entry) => {
      updateCase(caseId, (c) => ({
        ...c,
        revision_history: [
          ...c.revision_history,
          {
            id: uuid(),
            created_at: new Date().toISOString(),
            ...entry,
          },
        ],
      }));
    },
    [updateCase],
  );

  const updateRiceConfig = useCallback(
    (nextConfig, performedBy, reason) => {
      const summary =
        "Roadmap threshold updated to above " + nextConfig.roadmap_threshold + ".";
      const now = new Date().toISOString();
      setState((s) => {
        const recomputed = s.cases.map((c) => {
          if (c.rice && c.rice.reach != null) {
            const newTotal = calculateRice(c.rice, nextConfig);
            return {
              ...c,
              rice: { ...c.rice, weighted_total: newTotal },
              activity_log: [
                ...c.activity_log,
                {
                  id: uuid(),
                  action_type: ACTION_TYPE.RICE_CONFIG_CHANGED,
                  action_detail: summary,
                  reason: reason || "",
                  performed_by: performedBy || "System",
                  created_at: now,
                },
              ],
            };
          }
          return c;
        });
        return { ...s, riceConfig: nextConfig, cases: recomputed };
      });
    },
    [],
  );

  const updateAppSettings = useCallback((patch) => {
    setState((s) => ({
      ...s,
      appSettings: { ...DEFAULT_APP_SETTINGS, ...s.appSettings, ...patch },
    }));
  }, []);

  const clearAllData = useCallback(() => {
    storage.clearAll();
    setState({
      cases: [],
      counter: 0,
      riceConfig: { ...DEFAULT_RICE_CONFIG },
      appSettings: { ...DEFAULT_APP_SETTINGS },
      role: null,
      userName: null,
    });
  }, []);

  const reloadSeedData = useCallback(() => {
    const seed = buildSeedData();
    setState((s) => ({
      ...s,
      cases: seed.cases,
      counter: seed.counter,
      riceConfig: { ...DEFAULT_RICE_CONFIG },
    }));
  }, []);

  const isPM = state.role === ROLES.PM;
  const isBR = state.role === ROLES.BR;
  const isLeadership = state.role === ROLES.LEADERSHIP;

  const canViewCase = useCallback(
    (caseObj) => {
      if (!caseObj) return false;
      if (!caseObj.restricted) return true;
      if (isPM || isLeadership) return true;
      if (
        isBR &&
        caseObj.requestor_name &&
        state.userName &&
        caseObj.requestor_name.toLowerCase() === state.userName.toLowerCase()
      ) {
        return true;
      }
      const derivedEmail = state.userName
        ? state.userName.toLowerCase().replace(/\s+/g, ".") + "@example.com"
        : null;
      if (derivedEmail && caseObj.allowed_emails.includes(derivedEmail)) {
        return true;
      }
      return false;
    },
    [isPM, isBR, isLeadership, state.userName],
  );

  const value = useMemo(
    () => ({
      cases: state.cases,
      counter: state.counter,
      riceConfig: state.riceConfig,
      appSettings: state.appSettings || { ...DEFAULT_APP_SETTINGS },
      role: state.role,
      userName: state.userName,
      isPM,
      isBR,
      isLeadership,
      setRole,
      setUserName,
      addCase,
      updateCase,
      reorderRoadmap,
      bumpCounter,
      appendActivity,
      appendRevision,
      updateRiceConfig,
      updateAppSettings,
      clearAllData,
      reloadSeedData,
      canViewCase,
    }),
    [
      state,
      isPM,
      isBR,
      isLeadership,
      setRole,
      setUserName,
      addCase,
      updateCase,
      reorderRoadmap,
      bumpCounter,
      appendActivity,
      appendRevision,
      updateRiceConfig,
      updateAppSettings,
      clearAllData,
      reloadSeedData,
      canViewCase,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error("useApp must be used inside an AppProvider");
  return ctx;
}
