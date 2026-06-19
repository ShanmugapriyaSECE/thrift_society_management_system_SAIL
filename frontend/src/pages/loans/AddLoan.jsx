import { useState } from 'react'
import { addLoan } from '../../services/loanService'
import './AddLoan.css'

export default function AddLoan() {
  const [form, setForm] = useState({
    empno: '',
    empname: '',
    desig: '',
    memno: '',
    loan_amt: '',
    inst_amt: '',
    tot_nstalments: '',
    mnyr: ''
  })
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setResult(null)
    setError('')
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setResult(null)
    try {
      const res = await addLoan(form)
      setResult(res.data)
      setForm({
        empno: '', empname: '', desig: '', memno: '',
        loan_amt: '', inst_amt: '', tot_nstalments: '', mnyr: ''
      })
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add loan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="form-page">
      <h2 className="page-title">Add Loan</h2>

      <form className="styled-form" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Employee No</label>
            <input name="empno" value={form.empno} onChange={handleChange} required placeholder="e.g. EMP001" />
          </div>
          <div className="form-group">
            <label>Employee Name</label>
            <input name="empname" value={form.empname} onChange={handleChange} required placeholder="Full name" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Designation</label>
            <input name="desig" value={form.desig} onChange={handleChange} required placeholder="e.g. Engineer" />
          </div>
          <div className="form-group">
            <label>Member No</label>
            <input name="memno" value={form.memno} onChange={handleChange} required placeholder="e.g. MEM001" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Loan Amount (₹)</label>
            <input type="number" name="loan_amt" value={form.loan_amt} onChange={handleChange} required min="1" placeholder="0.00" />
          </div>
          <div className="form-group">
            <label>Instalment Amount (₹)</label>
            <input type="number" name="inst_amt" value={form.inst_amt} onChange={handleChange} required min="1" placeholder="0.00" />
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Total Instalments</label>
            <input type="number" name="tot_nstalments" value={form.tot_nstalments} onChange={handleChange} required min="1" placeholder="e.g. 12" />
          </div>
          <div className="form-group">
            <label>Month/Year (MMYYYY)</label>
            <input name="mnyr" value={form.mnyr} onChange={handleChange} required placeholder="e.g. 062026" maxLength={6} />
          </div>
        </div>

        <button type="submit" className="btn-primary" disabled={loading}>
          {loading ? 'Saving...' : 'Add Loan'}
        </button>
      </form>

      {result && (
        <div className="result-box success">
          <p>✅ Loan added successfully!</p>
        </div>
      )}

      {error && (
        <div className="result-box error">
          <p>❌ {error}</p>
        </div>
      )}
    </div>
  )
}