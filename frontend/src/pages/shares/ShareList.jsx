import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAllShares } from "../../services/shareService";
import "../members/Members.css";

export default function ShareList() {
  const [shares, setShares] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    loadShares();
  }, []);

  const loadShares = async () => {
    try {
      setLoading(true);
      const data = await getAllShares();
      setShares(data);
    } catch (err) {
      console.error(err);
      setError("Failed to load share data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">View Shares</h2>
      </div>

      {error && <div className="error">{error}</div>}

      <div className="table-box">
        {loading ? (
          <p>Loading share balances...</p>
        ) : shares.length === 0 ? (
          <p>No member share balances found.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Employee No</th>
                <th>Member Name</th>
                <th>Share Balance</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {shares.map((share) => (
                <tr key={share.id}>
                  <td>{share.employee_no}</td>
                  <td>{share.member_name}</td>
                  <td>₹{Number(share.share_balance).toLocaleString()}</td>
                  <td>
                    <button
                      className="btn-primary"
                      onClick={() => navigate(`/shares/${share.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}