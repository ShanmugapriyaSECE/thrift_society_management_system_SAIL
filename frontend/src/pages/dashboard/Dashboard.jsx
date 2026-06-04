import { useEffect, useState } from 'react'
import { getMembers } from '../../services/memberService'
import { getLoans } from '../../services/loanService'
import { getSubscriptions } from '../../services/subscriptionService'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import './Dashboard.css'

export default function Dashboard() {
  const [members, setMembers] = useState([])
  const [loans, setLoans] = useState([])
  const [subs, setSubs] = useState([])

  useEffect(() => {
    getMembers().then(r => setMembers(r.data)).catch(() => {})
    getLoans().then(r => setLoans(r.data)).catch(() => {})
    getSubscriptions().then(r => setSubs(r.data)).catch(() => {})
  }, [])

  const totalLoanAmt = loans.reduce((s, l) => s + Number(l.inst_no || 0), 0)
  const totalSubs = subs.reduce((s, m) => s + Number(m.cect_subs || 0), 0)

  const chartData = loans.slice(0, 6).map(l => ({
    name: l.empno,
    amount: Number(l.inst_no || 0)
  }))

  return (
    <div>
      <h2 className="page-title">Dashboard</h2>
      <div className="cards">
        <div className="card blue">
          <p>Total Members</p>
          <h3>{members.length}</h3>
        </div>
        <div className="card green">
          <p>Total Loans</p>
          <h3>{loans.length}</h3>
        </div>
        <div className="card orange">
          <p>Loan Amount</p>
          <h3>₹{totalLoanAmt.toLocaleString()}</h3>
        </div>
        <div className="card purple">
          <p>Total Subscriptions</p>
          <h3>₹{totalSubs.toLocaleString()}</h3>
        </div>
      </div>

      <div className="chart-box">
        <h3>Recent Loans</h3>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart data={chartData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="amount" fill="#1e2a40" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
