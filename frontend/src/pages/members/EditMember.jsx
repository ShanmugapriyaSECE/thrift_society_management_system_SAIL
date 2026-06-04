import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getMember, updateMember } from '../../services/memberService'
import './Members.css'

export default function EditMember() {
  const { emp } = useParams()
  const navigate = useNavigate()
  const [form, setForm] = useState({ name: '', father_name: '', address: '', aadhar: '' })
  const [error, setError] = useState('')

  useEffect(() => {
    getMember(emp).then(r => setForm({
      name: r.data.name,
      father_name: r.data.father_name,
      address: r.data.address,
      aadhar: r.data.aadhar
    })).catch(() => setError('Member not found'))
  }, [emp])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateMember(emp, form)
      navigate('/members')
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating member')
    }
  }

  return (
    <div>
      <h2 className="page-title">Edit Member — {emp}</h2>
      <div className="form-box">
        {error && <p className="error">{error}</p>}
        <form onSubmit={handleSubmit}>
          {['name', 'father_name', 'address', 'aadhar'].map(field => (
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
            <button type="submit" className="btn-primary">Update Member</button>
          </div>
        </form>
      </div>
    </div>
  )
}
