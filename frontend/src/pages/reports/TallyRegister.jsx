import { useEffect, useState } from 'react'
import { getTallyRegister } from '../../services/tallyService'
import '../members/Members.css'

export default function TallyRegister() {
  const [data, setData] = useState([])

  useEffect(() => {
    getTallyRegister().then(r => setData(r.data)).catch(() => {})
  }, [])

  const totalSub = data.reduce((s, m) => s + Number(m.ects_sub || 0), 0)
  const totalCumulative = data.reduce((s, m) => s + Number(m.cect_subs || 0), 0)
  const totalLoanBal = data.reduce((s, m) => s + Number(m.ects_loan_bal || 0), 0)

  return (
    <div>
      <h2 className="page-title">Tally Register</h2>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Emp No</th><th>Name</th><th>Member No</th><th>Month</th><th>Monthly Sub</th><th>Cumulative Sub</th><th>Loan Balance</th>
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
                <td>₹{Number(m.ects_loan_bal || 0).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={4}><strong>Total</strong></td>
              <td><strong>₹{totalSub.toLocaleString()}</strong></td>
              <td><strong>₹{totalCumulative.toLocaleString()}</strong></td>
              <td><strong>₹{totalLoanBal.toLocaleString()}</strong></td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
