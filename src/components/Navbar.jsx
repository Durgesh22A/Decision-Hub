import { useNavigate, Link } from "react-router-dom";
import useAuth from "../hooks/useAuth";

export default function Navbar() {
  const { user, userName, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/", { replace: true });
  };

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/85 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        
        <button
          type="button"
          className="text-xl font-bold text-slate-900 transition hover:scale-[1.01] hover:text-indigo-700"
          onClick={() => navigate("/dashboard")}
        >
          DecisionHub
        </button>

        <div className="flex items-center gap-3">

          <span className="hidden text-sm text-slate-600 sm:block">
            {userName || user?.email}
          </span>

          <Link to="/profile">
            <button
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-indigo-500 hover:shadow-md"
            >
              Profile
            </button>
          </Link>

          <button
            type="button"
            onClick={handleLogout}
            className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition duration-300 hover:-translate-y-0.5 hover:bg-slate-700 hover:shadow-md"
          >
            Logout
          </button>

        </div>
      </div>
    </header>
  );
}