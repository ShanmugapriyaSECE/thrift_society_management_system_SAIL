import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addLoan } from '../../services/loanService'
import '../members/Members.css'

export default function AddLoan() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    employee_no: '', member_no: '', loan_amount: '',
    installment_amount: '', total_installments: ''
  })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addLoan(form)
      navigate('/loans')
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding loan')
    }
  }

  const fields = [
    { key: 'employee_no', label: 'Employee No' },
    { key: 'member_no', label: 'Member No' },
    { key: 'loan_amount', label: 'Loan Amount' },
    { key: 'installment_amount', label: 'Installment Amount' },
    { key: 'total_installments', label: 'Total Installments' },
  ]

  return (
    <div>
      <h2 className="page-title">Add Loan</h2>
      <div className="form-box">
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {fields.map(f => (
            <div className="form-group" key={f.key}>
              <label>{f.label}</label>
              <input
                type={f.key.includes('amount') || f.key.includes('no') || f.key.includes('installments') ? 'number' : 'text'}
                value={form[f.key]}
                onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                required
              />
            </div>
          ))}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/loans')}>Cancel</button>
            <button type="submit" className="btn-primary">Add Loan</button>
          </div>
        </form>
      </div>
    </div>
  )
}
