import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getSubscriptions } from "../../services/subscriptionService";
import "../members/Members.css";

export default function SubscriptionList() {
  const [subs, setSubs] = useState([]);
  const months = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const currentDate = new Date();

const defaultMonth =
  `${months[currentDate.getMonth()]}-${currentDate.getFullYear()}`;

const [month, setMonth] = useState(defaultMonth);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const loadSubscriptions = async () => {
    try {
      const res = await getSubscriptions();
      setSubs(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const handleProcess = async () => {
    try {
      setLoading(true);

      const res = await axios.post(
  "/api/subscriptions/process",
  {
    month,
  }
);

      alert(
        `Success!\nProcessed: ${res.data.processed} members\nMonth: ${res.data.month}`
      );

      loadSubscriptions();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Failed to process subscriptions"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Subscriptions</h2>

        <div
          style={{
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <select
  value={month}
  onChange={(e) => setMonth(e.target.value)}
>
  {Array.from({ length: 5 }, (_, yearIndex) => {
    const year = new Date().getFullYear() + yearIndex;

    return months.map((m) => (
      <option
        key={`${m}-${year}`}
        value={`${m}-${year}`}
      >
        {m}-{year}
      </option>
    ));
  })}
</select>

          <button
            className="btn-primary"
            onClick={handleProcess}
            disabled={loading}
          >
            {loading
              ? "Processing..."
              : "Process Subscription"}
          </button>

          <button
            className="btn-primary"
            onClick={() => navigate("/subscriptions/add")}
          >
            + Add Subscription
          </button>
        </div>
      </div>

      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Emp No</th>
              <th>Name</th>
              <th>Member No</th>
              <th>Month</th>
              <th>Monthly Sub</th>
              <th>Cumulative</th>
              <th>Loan Balance</th>
            </tr>
          </thead>

          <tbody>
            {subs.map((s, i) => (
              <tr key={i}>
                <td>{s.emp}</td>
                <td>{s.name}</td>
                <td>{s.ects_memno}</td>
                <td>{s.mth}</td>
                <td>
                  ₹
                  {Number(
                    s.ects_sub || 0
                  ).toLocaleString()}
                </td>
                <td>
                  ₹
                  {Number(
                    s.cect_subs || 0
                  ).toLocaleString()}
                </td>
                <td>
                  ₹
                  {Number(
                    s.ects_loan_bal || 0
                  ).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}