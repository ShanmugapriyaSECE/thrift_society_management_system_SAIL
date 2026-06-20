import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getShareDetails,
  getShareTransactions,
} from "../../services/shareService";
import "../members/Members.css";

export default function ShareDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [member, setMember] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadShareDetails();
  }, [id]);

  const loadShareDetails = async () => {
    try {
      setLoading(true);
      const memberData = await getShareDetails(id);
      const transactionData = await getShareTransactions(id);

      setMember(memberData);
      setTransactions(transactionData);
    } catch (err) {
      console.error(err);
      setError("Failed to load share details.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Share Details</h2>
        <button
          className="btn-secondary"
          onClick={() => navigate("/shares")}
        >
          Back to Share List
        </button>
      </div>

      {error && <div className="error">{error}</div>}

      {loading ? (
        <div className="table-box">
          <p>Loading share details...</p>
        </div>
      ) : (
        <>
          {member && (
            <div
              className="table-box"
              style={{
                marginBottom: "20px",
                padding: "24px",
              }}
            >
              <h3 style={{ fontSize: "1.3rem", color: "#1e2a40", marginBottom: "15px" }}>
                {member.member_name}
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px" }}>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  <strong>Employee No:</strong> {member.employee_no}
                </p>
                <p style={{ margin: 0, fontSize: "0.95rem" }}>
                  <strong>Total Share Balance:</strong> ₹{Number(member.share_balance).toLocaleString()}
                </p>
              </div>
            </div>
          )}

          <div className="table-box">
            <h3 style={{ fontSize: "1.1rem", color: "#1e2a40", marginBottom: "15px" }}>
              Share Transactions History
            </h3>
            {transactions.length === 0 ? (
              <p>No transactions found for this member.</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Amount</th>
                    <th>Remarks</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((txn) => (
                    <tr key={txn.id}>
                      <td>
                        {new Date(txn.transaction_date).toLocaleDateString("en-IN", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </td>
                      <td>₹{Number(txn.amount).toLocaleString()}</td>
                      <td>{txn.remarks || "-"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </>
      )}
    </div>
  );
}
