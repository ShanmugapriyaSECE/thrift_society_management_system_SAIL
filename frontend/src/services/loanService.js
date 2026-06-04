import axios from 'axios'

export const getLoans = () => axios.get('/api/loans')
export const addLoan = (data) => axios.post('/api/loans', data)
