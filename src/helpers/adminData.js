import { loadOrderHistory } from '../adapters/profileStorage'
import { cloneHistoryRecord } from './orderHistory'

const PORTAL_USERS = ['demo', 'admin']

export function loadAllPortalOrders() {
  const rows = []
  PORTAL_USERS.forEach(function (email) {
    loadOrderHistory(email).forEach(function (order) {
      rows.push(
        Object.assign(cloneHistoryRecord(order), {
          ownerEmail: email,
        }),
      )
    })
  })
  return rows.sort(function (a, b) {
    return new Date(b.date).getTime() - new Date(a.date).getTime()
  })
}

export const MOCK_INVOICES = [
  { id: 'INV-2026-0142', date: '2026-08-12', customer: 'Demo Partner', amount: 126.0, status: 'Paid' },
  { id: 'INV-2026-0138', date: '2026-07-28', customer: 'Admin User', amount: 63.0, status: 'Paid' },
  { id: 'INV-2026-0125', date: '2026-07-05', customer: 'Demo Partner', amount: 189.0, status: 'Paid' },
  { id: 'INV-2026-0110', date: '2026-06-18', customer: 'Demo Partner', amount: 63.0, status: 'Paid' },
]

export const MOCK_REPORTING = {
  monthlySpend: [
    { month: 'Mar', amount: 420 },
    { month: 'Apr', amount: 315 },
    { month: 'May', amount: 504 },
    { month: 'Jun', amount: 378 },
    { month: 'Jul', amount: 567 },
    { month: 'Aug', amount: 441 },
  ],
  recentActivity: [
    { text: 'Order ORD-1042 confirmed — Demo Partner', when: '2 days ago' },
    { text: 'Office address updated — Toronto Bay Street', when: '5 days ago' },
    { text: 'Order ORD-1038 confirmed — Admin User', when: '1 week ago' },
  ],
  spendByDepartment: [
    { department: 'Capital Markets', amount: 1260 },
    { department: 'Property Management', amount: 945 },
    { department: 'Corporate', amount: 630 },
  ],
}
