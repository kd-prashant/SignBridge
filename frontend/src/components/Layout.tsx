import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/AuthContext";

const navLinks = [
  { to: "/", label: "Home", end: true },
  { to: "/recognize", label: "Recognize" },
  { to: "/learn", label: "Learn" },
  { to: "/understand", label: "Understand" },
  { to: "/about", label: "About" },
];

export default function Layout() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <div className="flex items-center gap-8">
            <NavLink to="/" className="flex items-center gap-3 text-xl font-bold text-brand-700">
              <img src="/logo.png" alt="SignBridge Logo" className="h-10 w-10 sm:h-12 sm:w-12 object-contain" />
              SignBridge
            </NavLink>
            <nav className="hidden md:flex gap-1" aria-label="Main navigation">
              {navLinks.map(({ to, label, end }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                      isActive
                        ? "bg-brand-100 text-brand-700"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }`
                  }
                >
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>
          
          <div className="flex items-center gap-4 text-sm">
            {isAuthenticated ? (
              <>
                <NavLink 
                  to="/profile"
                  className="hidden sm:inline-block font-medium text-brand-600 hover:text-brand-700 hover:underline"
                >
                  {user?.email}
                </NavLink>
                <button 
                  onClick={handleLogout}
                  className="px-4 py-2 font-medium text-slate-600 hover:text-slate-900 transition-colors"
                >
                  Log Out
                </button>
              </>
            ) : (
              <NavLink 
                to="/login"
                className="rounded-lg bg-brand-600 px-4 py-2 font-semibold text-white hover:bg-brand-700 transition-colors"
              >
                Log In
              </NavLink>
            )}
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">
        <Outlet />
      </main>

      <footer className="border-t border-slate-200 bg-white">
        <div className="mx-auto max-w-6xl px-4 py-4 text-center text-xs text-slate-500">
          SignBridge recognizes <strong>ASL only</strong>. This tool is a learning aid — not a
          replacement for certified interpreters in medical, legal, or emergency contexts.
        </div>
      </footer>
    </div>
  );
}
