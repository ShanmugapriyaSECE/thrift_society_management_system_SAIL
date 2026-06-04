import axios from 'axios'

export const getMembers = () => axios.get('/api/members')
export const getMember = (emp) => axios.get(`/api/members/${emp}`)
export const addMember = (data) => axios.post('/api/members', data)
export const updateMember = (emp, data) => axios.put(`/api/members/${emp}`, data)
export const deleteMember = (emp) => axios.delete(`/api/members/${emp}`)
