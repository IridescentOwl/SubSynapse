import { useEffect, useState } from "react";
import type { SubscriptionGroup } from "../../types";
import { listGroups, setGroupStatus } from "../../services/admin";

export default function GroupsPage() {
  const [rows, setRows] = useState<SubscriptionGroup[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setRows(await listGroups());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Groups</h1>

      {loading ? <p>Loading...</p> : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="p-2 text-left">Name</th>
              <th className="p-2 text-left">Category</th>
              <th className="p-2 text-left">Price</th>
              <th className="p-2 text-left">Slots</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>

          <tbody>
            {rows.map(g => (
              <tr className="border-b" key={g.id}>
                <td className="p-2">{g.name}</td>
                <td className="p-2">{g.category}</td>
                <td className="p-2">₹{g.totalPrice}</td>
                <td className="p-2">{g.slotsFilled}/{g.slotsTotal}</td>
                <td className="p-2">{g.status}</td>
                <td className="p-2 text-right">
                  <select
                    className="border p-1 rounded"
                    value={g.status}
                    onChange={(e) => setGroupStatus(g.id, e.target.value as any).then(load)}
                  >
                    <option value="pending_review">pending_review</option>
                    <option value="active">active</option>
                    <option value="full">full</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      )}
    </div>
  );
}
