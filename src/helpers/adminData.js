import { seedAdminOrderHistory } from './orderHistory'

export function loadAllPortalOrders() {
  return seedAdminOrderHistory()
}

export const MOCK_INVOICES = [
  {
    id: 'INV-2026-0842',
    date: '2026-08-10',
    department: 'Marketing',
    amount: 1240.0,
    status: 'Paid',
  },
  {
    id: 'INV-2026-0839',
    date: '2026-08-05',
    department: 'Engineering',
    amount: 850.5,
    status: 'Pending',
  },
  {
    id: 'INV-2026-0821',
    date: '2026-07-28',
    department: 'Human Resources',
    amount: 420.0,
    status: 'Paid',
  },
  {
    id: 'INV-2026-0795',
    date: '2026-07-15',
    department: 'Sales',
    amount: 2100.0,
    status: 'Paid',
  },
  {
    id: 'INV-2026-0782',
    date: '2026-07-02',
    department: 'Legal',
    amount: 350.0,
    status: 'Overdue',
  },
]
