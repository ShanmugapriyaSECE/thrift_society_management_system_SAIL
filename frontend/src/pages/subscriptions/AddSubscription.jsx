import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addMonthlySubscription } from '../../services/subscriptionService'
import '../members/Members.css'

export default function AddSubscription() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ emp: '', amount: '', month: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addMonthlySubscription(form.emp, { amount: form.amount, month: form.month })
      navigate('/subscriptions')
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding subscription')
    }
  }

  return (
    <div>
      <h2 className="page-title">Add Monthly Subscription</h2>
      <div className="form-box">
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Employee No</label>
            <input value={form.emp} onChange={e => setForm({ ...form, emp: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input type="number" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Month (e.g. Jan-25)</label>
            <input value={form.month} onChange={e => setForm({ ...form, month: e.target.value })} required />
          </div>
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/subscriptions')}>Cancel</button>
            <button type="submit" className="btn-primary">Add Subscription</button>
          </div>
        </form>
      </div>
    </div>
  )
}
