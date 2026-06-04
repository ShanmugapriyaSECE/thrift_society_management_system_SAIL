import { useEffect, useState } from 'react'
import { getYearlyReport } from '../../services/subscriptionService'
import '../members/Members.css'

export default function SubscriptionReport() {
  const [data, setData] = useState([])

  useEffect(() => {
    getYearlyReport().then(r => setData(r.data)).catch(() => {})
  }, [])

  const total = data.reduce((s, m) => s + Number(m.cect_subs || 0), 0)

  return (
    <div>
      <h2 className="page-title">Subscription Report</h2>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Emp No</th><th>Name</th><th>Member No</th><th>Month</th><th>Monthly Sub</th><th>Cumulative</th>
            </tr>
          </thead>
          <tbody>
            {data.map((m, i) => (
              <tr key={i}>
                <td>{m.emp}</td>
                <td>{m.name}</td>
                <td>{m.ects_memno}</td>
                <td>{m.mth}</td>
                <td>₹{Number(m.ects_sub || 0).toLocaleString()}</td>
                <td>₹{Number(m.cect_subs || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={5}><strong>Total Cumulative</strong></td>
              <td><strong>₹{total.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
