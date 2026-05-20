import { NavLink, useNavigate } from "react-router-dom";
import { useApp } from "../../context/AppContext.jsx";
import { RoleBadge } from "../ui/Badge.jsx";

function NavItem({ to, children }) {
  return (
    <NavLink
      to={to}
      end={to === "/dashboard" || to === "/pm"}
      className={({ isActive }) =>
        "rounded-md px-3 py-1.5 text-sm transition-colors " +
        (isActive
          ? "bg-accent-500 text-white font-semibold shadow-sm"
          : "text-slate-300 hover:text-white hover:bg-slate-800")
      }
    >
      {children}
    </NavLink>
  );
}

function RoleNavLinks() {
  const { isPM } = useApp();

  return (
    <>
      <NavItem to="/dashboard">Cases</NavItem>
      {isPM ? (
        <>
          <NavItem to="/pm">Roadmap</NavItem>
          <NavItem to="/pm/lifecycle">Lifecycle</NavItem>
        </>
      ) : null}
      <NavItem to="/leadership">Insights</NavItem>
      <NavItem to="/settings">Settings</NavItem>
    </>
  );
}

export function Navigation() {
  const { role, userName } = useApp();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 border-b-2 border-accent-500 bg-slate-900 shadow-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => navigate("/welcome")}
            className="flex items-center gap-2 rounded-md bg-slate-800 px-2 py-1 ring-1 ring-inset ring-slate-700 transition-colors hover:bg-slate-700"
            title="Switch portal or role"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-500 text-xs font-bold text-white">
              RT
            </span>
            <span className="hidden text-sm font-semibold text-white sm:inline">
              Roadmapping Tool Template
            </span>
            <span className="text-sm font-semibold text-white sm:hidden">Roadmapping</span>
          </button>

          <nav className="hidden items-center gap-1 md:flex">
            <RoleNavLinks />
          </nav>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-xs text-slate-400 lg:block">
            {userName ? (
              <>
                Signed in as{" "}
                <span className="font-semibold text-white">{userName}</span>
              </>
            ) : null}
          </div>
          <RoleBadge role={role} />
        </div>
      </div>

      <nav className="flex items-center gap-1 overflow-x-auto border-t border-slate-800 px-2 py-2 md:hidden">
        <RoleNavLinks />
      </nav>
    </header>
  );
}
