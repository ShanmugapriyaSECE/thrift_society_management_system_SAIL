import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getSubscriptions } from '../../services/subscriptionService'
import '../members/Members.css'

export default function SubscriptionList() {
  const [subs, setSubs] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    getSubscriptions().then(r => setSubs(r.data)).catch(() => {})
  }, [])

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Subscriptions</h2>
        <button className="btn-primary" onClick={() => navigate('/subscriptions/add')}>+ Add Subscription</button>
      </div>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Emp No</th><th>Name</th><th>Member No</th><th>Month</th><th>Monthly Sub</th><th>Cumulative</th><th>Loan Balance</th>
            </tr>
          </thead>
          <tbody>
            {subs.map((s, i) => (
              <tr key={i}>
                <td>{s.emp}</td>
                <td>{s.name}</td>
                <td>{s.ects_memno}</td>
                <td>{s.mth}</td>
                <td>₹{Number(s.ects_sub || 0).toLocaleString()}</td>
                <td>₹{Number(s.cect_subs || 0).toLocaleString()}</td>
                <td>₹{Number(s.ects_loan_bal || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
