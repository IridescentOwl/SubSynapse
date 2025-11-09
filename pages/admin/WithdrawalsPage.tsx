import { useEffect, useState } from "react";
import type { Withdrawal } from "../../services/api";
import { listWithdrawals, setWithdrawalStatus } from "../../services/admin";

export default function WithdrawalsPage() {
  const [rows, setRows] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    setRows(await listWithdrawals());
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  return (
    <div>
      <h1 className="text-2xl font-semibold mb-4">Withdrawal Requests</h1>

      {loading ? (
        <p>Loading…</p>
      ) : rows.length === 0 ? (
        <p>No requests found.</p>
      ) : (
        <table className="w-full text-sm">
          <thead className="border-b">
            <tr>
              <th className="p-2 text-left">User</th>
              <th className="p-2 text-left">Amount</th>
              <th className="p-2 text-left">UPI</th>
              <th className="p-2 text-left">Date</th>
              <th className="p-2 text-left">Status</th>
              <th className="p-2"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map(w => (
              <tr className="border-b" key={w.id}>
                <td className="p-2">{w.userName}</td>
                <td className="p-2">₹{w.amount}</td>
                <td className="p-2">{w.upiId}</td>
                <td className="p-2">{new Date(w.date).toLocaleString()}</td>
                <td className="p-2">{w.status}</td>
                <td className="p-2 text-right space-x-3">
                  <button
                    className="underline"
                    disabled={w.status !== "pending"}
                    onClick={() => setWithdrawalStatus(w.id, "approved").then(load)}
                  >
                    Approve
                  </button>
                  <button
                    className="underline"
                    disabled={w.status !== "pending"}
                    onClick={() => setWithdrawalStatus(w.id, "rejected").then(load)}
                  >
                    Reject
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
