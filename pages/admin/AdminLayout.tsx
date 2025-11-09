import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext";
import { AuroraBackground } from "../../components/ui/aurora-background";

const linkClass = ({ isActive }: any) =>
  "px-2 py-1 rounded hover:underline " + (isActive ? "font-semibold underline" : "");

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <AuroraBackground>
      <div className="flex min-h-screen text-white">
        <aside className="w-64 border-r border-white/10 p-4 space-y-4 bg-black/20">
          <h2 className="text-xl font-semibold">Admin</h2>
          <nav className="flex flex-col gap-2">
            <NavLink to="/admin" end className={linkClass}>Overview</NavLink>
            <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
            <NavLink to="/admin/groups" className={linkClass}>Groups</NavLink>
            <NavLink to="/admin/withdrawals" className={linkClass}>Withdrawals</NavLink>
          </nav>
          <div className="flex-grow" />
          <NavLink to="/" className="text-sm underline">← Back to Main Site</NavLink>
          <button className="text-sm underline" onClick={logout}>Logout</button>
        </aside>
        <main className="flex-1 p-6"><Outlet /></main>
      </div>
    </AuroraBackground>
  );
}
