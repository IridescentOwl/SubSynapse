import { useEffect, useState } from "react";
import type { User } from "../../types";
import { listUsers, updateUser, deleteUser } from "../../services/admin";

export default function UsersPage() {
  const [rows, setRows] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setRows(await listUsers());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Users</h1>

      {loading ? <p>Loading...</p> : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Email</th>
              <th className="p-2 text-left">Role</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2 text-right"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map(u => (
              <tr className="border-b" key={u.id}>
                <td className="p-2">{u.name}</td>
                <td className="p-2">{u.email}</td>
                <td className="p-2">{u.role}</td>
                <td className="p-2">{u.isActive ? "Active" : "Disabled"}</td>
                <td className="p-2 text-right space-x-3">
                  <button className="underline" onClick={() =>
                    updateUser(u.id, { isActive: !u.isActive }).then(load)
                  }>
                    {u.isActive ? "Disable" : "Activate"}
                  </button>

                  <button className="underline" onClick={() =>
                    updateUser(u.id, { role: u.role === "admin" ? "user" : "admin" }).then(load)
                  }>
                    {u.role === "admin" ? "Demote" : "Promote"}
                  </button>

                  <button className="underline" onClick={() =>
                    deleteUser(u.id).then(load)
                  }>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
}
