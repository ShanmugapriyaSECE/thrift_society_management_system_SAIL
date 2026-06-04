import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addMember } from '../../services/memberService'
import './Members.css'

export default function AddMember() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ emp: '', name: '', father_name: '', address: '', aadhar: '' })
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await addMember(form)
      navigate('/members')
    } catch (err) {
      setError(err.response?.data?.message || 'Error adding member')
    }
  }

  return (
    <div>
      <h2 className="page-title">Add Member</h2>
      <div className="form-box">
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {['emp', 'name', 'father_name', 'address', 'aadhar'].map(field => (
            <div className="form-group" key={field}>
              <label>{field.replace('_', ' ').toUpperCase()}</label>
              <input
                value={form[field]}
                onChange={e => setForm({ ...form, [field]: e.target.value })}
                required
              />
            </div>
          ))}
          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={() => navigate('/members')}>Cancel</button>
            <button type="submit" className="btn-primary">Add Member</button>
          </div>
        </form>
      </div>
    </div>
  )
}
