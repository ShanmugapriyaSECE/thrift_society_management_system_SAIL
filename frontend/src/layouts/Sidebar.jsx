import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const links = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { to: '/members', label: '👥 View Members' },
  { to: '/members/add', label: '➕ Add Member' },
  { to: '/loans', label: '💰 View Loans' },
  { to: '/loans/add', label: '➕ Add Loan' },
  { to: '/reports/loans', label: '📄 Loan Report' },
  { to: '/reports/subscriptions', label: '📄 Subscription Report' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">🏦 Thrift Society</div>
      <nav>
        {links.map((l) => (
          <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
            {l.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
