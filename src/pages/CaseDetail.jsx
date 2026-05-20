import { Link, useNavigate, useParams } from "react-router-dom";
import { useApp } from "../context/AppContext.jsx";
import { Card, CardBody } from "../components/ui/Card.jsx";
import { Button } from "../components/ui/Button.jsx";
import { LockIcon } from "../components/ui/LockIcon.jsx";
import { CaseHeader } from "../components/case/CaseHeader.jsx";
import { IntakeDetails } from "../components/case/IntakeDetails.jsx";
import { RiceScoring } from "../components/case/RiceScoring.jsx";
import { RelatedCases } from "../components/case/RelatedCases.jsx";
import { PmNotes } from "../components/case/PmNotes.jsx";
import { ActivityLog } from "../components/case/ActivityLog.jsx";
import { RevisionHistory } from "../components/case/RevisionHistory.jsx";
import { AccessControl } from "../components/case/AccessControl.jsx";
import { StatusControls } from "../components/case/StatusControls.jsx";

// Full case detail page — the workhorse of the app.

export default function CaseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const {
    cases,
    riceConfig,
    isPM,
    userName,
    updateCase,
    appendActivity,
    appendRevision,
    canViewCase,
  } = useApp();

  const caseObj = cases.find((c) => c.id === id);

  if (!caseObj) {
    return (
      <div className="space-y-4">
        <div className="inline-flex">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            &larr; Back
          </Button>
        </div>
        <Card>
          <CardBody>
            <p className="text-sm text-slate-600">
              That case doesn't exist (or has been removed). Head back to the dashboard to find what you're looking for.
            </p>
          </CardBody>
        </Card>
      </div>
    );
  }

  const allowed = canViewCase(caseObj);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="inline-flex">
          <Button variant="ghost" onClick={() => navigate(-1)}>
            &larr; Back
          </Button>
        </div>
        <Link to="/dashboard">
          <span className="text-xs text-slate-400">All cases</span>
        </Link>
      </div>

      <CaseHeader caseObj={caseObj} />

      {!allowed ? (
        <Card>
          <CardBody className="flex items-start gap-3">
            <span className="mt-0.5 text-slate-400">
              <LockIcon className="h-4 w-4" />
            </span>
            <div>
              <p className="text-sm font-semibold text-slate-800">This case is restricted.</p>
              <p className="mt-1 text-sm text-slate-600">
                You can see the case number and name, but the rest of the details are limited
                to the original requestor, the Product team, and a small list of authorized
                viewers.
              </p>
            </div>
          </CardBody>
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <IntakeDetails
              caseObj={caseObj}
              isPM={isPM}
              userName={userName}
              updateCase={updateCase}
              appendActivity={appendActivity}
              appendRevision={appendRevision}
            />
            <RiceScoring
              caseObj={caseObj}
              riceConfig={riceConfig}
              isPM={isPM}
              userName={userName}
              updateCase={updateCase}
              appendActivity={appendActivity}
              appendRevision={appendRevision}
            />
            <RelatedCases
              caseObj={caseObj}
              allCases={cases}
              isPM={isPM}
              userName={userName}
              updateCase={updateCase}
              appendActivity={appendActivity}
            />
            <PmNotes
              caseObj={caseObj}
              isPM={isPM}
              userName={userName}
              updateCase={updateCase}
              appendActivity={appendActivity}
            />
            <ActivityLog caseObj={caseObj} />
            <RevisionHistory caseObj={caseObj} />
          </div>

          <div className="space-y-6">
            {isPM ? (
              <>
                <StatusControls
                  caseObj={caseObj}
                  userName={userName}
                  updateCase={updateCase}
                  appendActivity={appendActivity}
                />
                <AccessControl
                  caseObj={caseObj}
                  userName={userName}
                  updateCase={updateCase}
                  appendActivity={appendActivity}
                />
              </>
            ) : (
              <Card>
                <CardBody className="text-sm text-slate-600">
                  <p className="font-medium text-slate-800">PM tools</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Status changes, lifecycle, and access control are available when you switch to the PM role.
                  </p>
                </CardBody>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
