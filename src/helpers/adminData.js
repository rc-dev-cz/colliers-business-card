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

export const MOCK_REPORTING = {
  monthlySpend: [
    { month: 'Feb', amount: 280 },
    { month: 'Mar', amount: 420 },
    { month: 'Apr', amount: 315 },
    { month: 'May', amount: 504 },
    { month: 'Jun', amount: 378 },
    { month: 'Jul', amount: 567 },
    { month: 'Aug', amount: 441 },
  ],
  recentActivity: [
    {
      name: 'Sarah Jenkins',
      action: 'Ordered Standard Cards',
      department: 'Marketing',
      when: '2 hours ago',
    },
    {
      name: 'Michael Chang',
      action: 'Approved Order #492',
      department: 'Operations',
      when: '5 hours ago',
    },
    {
      name: 'Elena Rodriguez',
      action: 'Ordered Premium Cards',
      department: 'Executive',
      when: '1 day ago',
    },
    {
      name: 'David Kim',
      action: 'Updated Shipping Address',
      department: 'Sales',
      when: '2 days ago',
    },
  ],
  spendByDepartment: [
    { department: 'Marketing', amount: 4250 },
    { department: 'Sales', amount: 2840 },
    { department: 'Executive', amount: 1420 },
    { department: 'Operations', amount: 945 },
  ],
}
