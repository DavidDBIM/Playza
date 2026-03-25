export interface WithdrawalRecord {
  id: string;
  userId: string;
  username: string;
  fullName: string;
  amount: number;
  method: string;
  accountDetails: string;
  status: 'Pending' | 'Successful' | 'Failed' | 'Processing';
  requestedDate: string;
  processedDate?: string;
  transactionHash?: string;
}

export const withdrawalsData: WithdrawalRecord[] = [
  {
    id: 'WD001',
    userId: 'USR001',
    username: 'olanrewaju_77',
    fullName: 'Olanrewaju Adebayo',
    amount: 25000,
    method: 'Bank Transfer',
    accountDetails: 'GTBANK - 0123456789',
    status: 'Pending',
    requestedDate: 'Mar 25, 2024, 05:30 AM'
  },
  {
    id: 'WD002',
    userId: 'USR002',
    username: 'chidimma_ox',
    fullName: 'Chidimma Okafor',
    amount: 12000,
    method: 'USDT (TRC20)',
    accountDetails: 'T9yD...xWp1',
    status: 'Successful',
    requestedDate: 'Mar 24, 2024, 10:15 PM',
    processedDate: 'Mar 25, 2024, 12:05 AM',
    transactionHash: '0xabc123...def'
  },
  {
    id: 'WD003',
    userId: 'USR005',
    username: 'tunde_dev',
    fullName: 'Tunde Babalola',
    amount: 50000,
    method: 'PalmPay',
    accountDetails: '08123456789',
    status: 'Processing',
    requestedDate: 'Mar 25, 2024, 02:20 AM'
  },
  {
    id: 'WD004',
    userId: 'USR007',
    username: 'emeka_n',
    fullName: 'Emeka Nwosu',
    amount: 150000,
    method: 'Bank Transfer',
    accountDetails: 'Zenith Bank - 1122334455',
    status: 'Failed',
    requestedDate: 'Mar 23, 2024, 08:45 AM',
    processedDate: 'Mar 23, 2024, 09:10 AM'
  },
  {
    id: 'WD005',
    userId: 'USR009',
    username: 'femi_x',
    fullName: 'Femi Otedola',
    amount: 250000,
    method: 'Bank Transfer',
    accountDetails: 'First Bank - 0011223344',
    status: 'Pending',
    requestedDate: 'Mar 25, 2024, 06:15 AM'
  }
];

export const withdrawalsStats = [
  { label: 'Pending Requests', value: '18', change: '+5', trend: 'up' },
  { label: 'Total Volume (24h)', value: '₦1,250,000', change: '+12%', trend: 'up' },
  { label: 'Avg Process Time', value: '42m', change: '-5m', trend: 'down' },
  { label: 'Success Rate', value: '96.5%', change: '+1.2%', trend: 'up' }
];
