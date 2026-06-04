import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addLoan } from '../../services/loanService'
import '../members/Members.css'

export default function AddLoan() {
  const navigate = useNavigate()
  const [form, setForm] = useState({
    empno: '', empname: '', desig: '', memno: '',
    loan_amt: '', inst_amt: '', tot_nstalments: '', mnyr: ''
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
    { key: 'empno', label: 'Employee No' },
    { key: 'empname', label: 'Employee Name' },
    { key: 'desig', label: 'Designation' },
    { key: 'memno', label: 'Member No' },
    { key: 'loan_amt', label: 'Loan Amount' },
    { key: 'inst_amt', label: 'Installment Amount' },
    { key: 'tot_nstalments', label: 'Total Installments' },
    { key: 'mnyr', label: 'Month/Year (e.g. 0125)' },
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
