import { NavLink } from 'react-router-dom'
import './Sidebar.css'

const links = [
  { to: '/dashboard', label: '📊 Dashboard' },
  { section: 'Members' },
  { to: '/members', label: '👥 View Members' },
  { to: '/members/add', label: '➕ Add Member' },
  { section: 'Loans' },
  { to: '/loans', label: '💰 View Loans' },
  { to: '/loans/add', label: '➕ Add Loan' },
  { section: 'Subscriptions' },
  { to: '/subscriptions', label: '🔔 View Subscriptions' },
  { to: '/subscriptions/add', label: '➕ Add Subscription' },
  { section: 'Shares' },
  { to: '/shares', label: '📈 View Shares' },
  { section: 'Reports' },
  { to: '/reports/loans', label: '📄 Loan Report' },
  { to: '/reports/subscriptions', label: '📄 Subscription Report' },
  { to: '/reports/tally', label: '📄 Tally Register' },
  { section: 'Administration' },
  { to: '/administration', label: '⚙️ Administration' },
]

export default function Sidebar() {
  return (
    <aside className="sidebar">
      <div className="sidebar-title">🏦 Salem Steel Plant Thrift Society</div>
      <nav>
        {links.map((l, i) => {
          if (l.section) return <div key={i} className="nav-section">{l.section}</div>
          return (
            <NavLink key={l.to} to={l.to} className={({ isActive }) => isActive ? 'nav-link active' : 'nav-link'}>
              {l.label}
            </NavLink>
          )
        })}
      </nav>
    </aside>
  )
}
