import { useEffect, useState } from "react";
import type { User, SubscriptionGroup } from "../../types";
import type { Withdrawal } from "../../services/api";
import { listUsers, listGroups, listWithdrawals } from "../../services/admin";

export default function AdminDashboard() {
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<SubscriptionGroup[]>([]);
  const [wd, setWd] = useState<Withdrawal[]>([]);

  useEffect(() => {
    (async () => {
      const [u, g, w] = await Promise.all([listUsers(), listGroups(), listWithdrawals()]);
      setUsers(u);
      setGroups(g);
      setWd(w);
    })();
  }, []);

  const activeUsers = users.filter(u => u.isActive).length;

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Overview</h1>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border p-5 shadow-sm">
          <div className="text-sm opacity-70">Total Users</div>
          <div className="text-3xl font-semibold">{users.length}</div>
          <div className="text-xs opacity-60">{activeUsers} active</div>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <div className="text-sm opacity-70">Groups</div>
          <div className="text-3xl font-semibold">{groups.length}</div>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <div className="text-sm opacity-70">Pending Withdrawals</div>
          <div className="text-3xl font-semibold">
            {wd.filter(x => x.status === "pending").length}
          </div>
        </div>

        <div className="rounded-2xl border p-5 shadow-sm">
          <div className="text-sm opacity-70">Active Groups</div>
          <div className="text-3xl font-semibold">
            {groups.filter(g => g.status === "active").length}
          </div>
        </div>
      </div>
    </div>
  );
}
