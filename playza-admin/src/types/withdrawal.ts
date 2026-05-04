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
