import { NavLink, Outlet } from "react-router-dom";
import { useAuth } from "../../AuthContext";

const linkClass = ({ isActive }: any) =>
  "px-2 py-1 rounded hover:underline " + (isActive ? "font-semibold underline" : "");

export default function AdminLayout() {
  const { logout } = useAuth();

  return (
    <div className="flex min-h-screen">
      <aside className="w-64 border-r p-4 space-y-4">
        <h2 className="text-xl font-semibold">Admin</h2>
        <nav className="flex flex-col gap-2">
          <NavLink to="/admin" end className={linkClass}>Overview</NavLink>
          <NavLink to="/admin/users" className={linkClass}>Users</NavLink>
          <NavLink to="/admin/groups" className={linkClass}>Groups</NavLink>
          <NavLink to="/admin/withdrawals" className={linkClass}>Withdrawals</NavLink>
        </nav>
        <button className="mt-6 text-sm underline" onClick={logout}>Logout</button>
      </aside>
      <main className="flex-1 p-6"><Outlet /></main>
    </div>
  );
}
