import { Routes, Route, Navigate } from 'react-router-dom'
import MainLayout from '../layouts/MainLayout'
import Dashboard from '../pages/dashboard/Dashboard'
import MemberList from '../pages/members/MemberList'
import AddMember from '../pages/members/AddMember'
import EditMember from '../pages/members/EditMember'
import LoanList from '../pages/loans/LoanList'
import AddLoan from '../pages/loans/AddLoan'
import LoanReport from '../pages/reports/LoanReport'
import SubscriptionReport from '../pages/reports/SubscriptionReport'

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<MainLayout />}>
        <Route path="/" element={<Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/members" element={<MemberList />} />
        <Route path="/members/add" element={<AddMember />} />
        <Route path="/members/edit/:emp" element={<EditMember />} />
        <Route path="/loans" element={<LoanList />} />
        <Route path="/loans/add" element={<AddLoan />} />
        <Route path="/reports/loans" element={<LoanReport />} />
        <Route path="/reports/subscriptions" element={<SubscriptionReport />} />
      </Route>
    </Routes>
  )
}
