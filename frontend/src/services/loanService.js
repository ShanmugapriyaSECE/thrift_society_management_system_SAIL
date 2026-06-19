import axios from 'axios'

export const getLoans = () => axios.get('/api/loans')
export const addLoan = (data) => axios.post('/api/loans', data)

export const processMonthlyLoans = (data) =>
  axios.post('/api/loans/process-monthly', data)

