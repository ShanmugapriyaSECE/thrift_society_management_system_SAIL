import axios from 'axios'

export const getSubscriptions = () => axios.get('/api/subscriptions')
export const getSubscription = (emp) => axios.get(`/api/subscriptions/${emp}`)
export const addMonthlySubscription = (emp, data) => axios.put(`/api/subscriptions/${emp}`, data)
export const getYearlyReport = () => axios.get('/api/subscriptions/report/yearly')
