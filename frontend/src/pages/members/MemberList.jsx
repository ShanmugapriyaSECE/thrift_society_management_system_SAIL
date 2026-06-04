import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMembers, deleteMember } from '../../services/memberService'
import './Members.css'

export default function MemberList() {
  const [members, setMembers] = useState([])
  const navigate = useNavigate()

  const load = () => getMembers().then(r => setMembers(r.data)).catch(() => {})

  useEffect(() => { load() }, [])

  const handleDelete = async (emp) => {
    if (!confirm('Delete this member?')) return
    await deleteMember(emp)
    load()
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="page-title">Members</h2>
        <button className="btn-primary" onClick={() => navigate('/members/add')}>+ Add Member</button>
      </div>
      <div className="table-box">
        <table>
          <thead>
            <tr>
              <th>Emp No</th><th>Name</th><th>Father Name</th><th>Address</th><th>Aadhar</th><th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map(m => (
              <tr key={m.emp}>
                <td>{m.emp}</td>
                <td>{m.name}</td>
                <td>{m.father_name}</td>
                <td>{m.address}</td>
                <td>{m.aadhar}</td>
                <td>
                  <button className="btn-edit" onClick={() => navigate(`/members/edit/${m.emp}`)}>Edit</button>
                  <button className="btn-delete" onClick={() => handleDelete(m.emp)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
