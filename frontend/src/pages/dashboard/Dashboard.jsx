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

  const totalLoanAmt = loans.reduce((s, l) => s + Number(l.loan_amt || 0), 0)
  const totalSubs = subs.reduce((s, m) => s + Number(m.cect_subs || 0), 0)

  const chartData = [...loans]
    .sort((a, b) => Number(b.loan_no) - Number(a.loan_no))
    .slice(0, 10)
    .map(l => ({
      name: l.empname || l.empno,
      empno: l.empno,
      amount: Number(l.loan_amt || 0)
    }))

  const formatYAxis = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(val % 100000 === 0 ? 0 : 1)}L`
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`
    return `₹${val}`
  }

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null
    return (
      <div style={{ background: '#fff', border: '1px solid #dde1e7', borderRadius: 8, padding: '10px 14px', fontSize: '0.88rem' }}>
        <p style={{ marginBottom: 4, color: '#555' }}><strong>Employee:</strong> {label}</p>
        <p style={{ color: '#0066cc' }}><strong>Loan Amount:</strong> ₹{Number(payload[0].value).toLocaleString('en-IN')}</p>
      </div>
    )
  }

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
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tickFormatter={formatYAxis} tick={{ fontSize: 11 }} width={60} />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="amount" fill="#1e2a40" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
