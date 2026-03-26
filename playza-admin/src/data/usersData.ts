import type { UserStat } from '../components/users/UsersStats';

export interface UserRecord {
  id: string;
  username: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  avatar: string;
  status: 'Active' | 'Banned' | 'Suspended' | 'Pending';
  kycStatus: 'Verified' | 'Pending' | 'Rejected';
  walletBalance: number;
  pzaPoints: number;
  totalGames: number;
  totalWinnings: number;
  joinedDate: string; // MM DD, YYYY
  joinedTimestamp: number;
  level: number;
  referrals: number;
  referralCode?: string;
  lastActive: string;
}

export interface MatchRecord {
  id: string;
  game: string;
  score: string;
  position: string;
  winnings: number;
  date: string;
  status: string;
}

export interface TransactionRecord {
  id: string;
  type: string;
  amount: number;
  method: string;
  date: string;
  status: string;
  username: string;
}

export interface ReferralRecord {
  id: string;
  username: string;
  date: string;
  reward: number;
  status: string;
}

export const usersData: UserRecord[] = [
  {
    id: 'USR001',
    username: 'olanrewaju_77',
    fullName: 'Olanrewaju Adebayo',
    email: 'olan.adebayo@playza.ng',
    phoneNumber: '+234 803 123 4567',
    avatar: 'https://i.pravatar.cc/150?u=USR001',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 125400,
    pzaPoints: 8400,
    totalGames: 142,
    totalWinnings: 450000,
    joinedDate: 'Oct 12, 2023',
    joinedTimestamp: new Date('2023-10-12').getTime(),
    level: 42,
    referrals: 12,
    lastActive: '2 mins ago'
  },
  {
    id: 'USR002',
    username: 'chidimma_ox',
    fullName: 'Chidimma Okafor',
    email: 'chidi_ox@gmail.com',
    phoneNumber: '+234 812 987 6543',
    avatar: 'https://i.pravatar.cc/150?u=USR002',
    status: 'Active',
    kycStatus: 'Pending',
    walletBalance: 85200,
    pzaPoints: 24150,
    totalGames: 892,
    totalWinnings: 320000,
    joinedDate: 'Mar 24, 2024',
    joinedTimestamp: new Date('2024-03-24').getTime(),
    level: 85,
    referrals: 45,
    lastActive: '15 mins ago'
  },
  {
    id: 'USR003',
    username: 'musa_king',
    fullName: 'Ibrahim Musa',
    email: 'musa_king@outlook.com',
    phoneNumber: '+234 701 555 0101',
    avatar: 'https://i.pravatar.cc/150?u=USR003',
    status: 'Banned',
    kycStatus: 'Rejected',
    walletBalance: 0,
    pzaPoints: 15,
    totalGames: 12,
    totalWinnings: 500,
    joinedDate: 'Nov 22, 2023',
    joinedTimestamp: new Date('2023-11-22').getTime(),
    level: 3,
    referrals: 0,
    lastActive: '4 months ago'
  },
  {
    id: 'USR004',
    username: 'amaka_p',
    fullName: 'Amaka Peters',
    email: 'peters.a@playza.com',
    phoneNumber: '+234 905 222 3344',
    avatar: 'https://i.pravatar.cc/150?u=USR004',
    status: 'Suspended',
    kycStatus: 'Verified',
    walletBalance: 5320,
    pzaPoints: 1200,
    totalGames: 45,
    totalWinnings: 12500,
    joinedDate: 'Feb 28, 2024',
    joinedTimestamp: new Date('2024-02-28').getTime(),
    level: 12,
    referrals: 5,
    lastActive: '2 days ago'
  },
  {
    id: 'USR005',
    username: 'tunde_dev',
    fullName: 'Tunde Babalola',
    email: 'tunde@dev.co',
    phoneNumber: '+234 802 444 5566',
    avatar: 'https://i.pravatar.cc/150?u=USR005',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 25000,
    pzaPoints: 5000,
    totalGames: 210,
    totalWinnings: 75000,
    joinedDate: 'Mar 10, 2024',
    joinedTimestamp: new Date('2024-03-10').getTime(),
    level: 25,
    referrals: 8,
    lastActive: '1 hour ago'
  },
  {
    id: 'USR006',
    username: 'zainab_y',
    fullName: 'Zainab Yusuf',
    email: 'z.yusuf@yahoo.com',
    phoneNumber: '+234 703 666 7788',
    avatar: 'https://i.pravatar.cc/150?u=USR006',
    status: 'Pending',
    kycStatus: 'Pending',
    walletBalance: 0,
    pzaPoints: 100,
    totalGames: 5,
    totalWinnings: 0,
    joinedDate: 'Mar 20, 2024',
    joinedTimestamp: new Date('2024-03-20').getTime(),
    level: 1,
    referrals: 0,
    lastActive: 'Just now'
  },
  {
    id: 'USR007',
    username: 'emeka_n',
    fullName: 'Emeka Nwosu',
    email: 'emeka.n@playza.ng',
    phoneNumber: '+234 814 888 9900',
    avatar: 'https://i.pravatar.cc/150?u=USR007',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 500000,
    pzaPoints: 100000,
    totalGames: 1540,
    totalWinnings: 2500000,
    joinedDate: 'Aug 15, 2023',
    joinedTimestamp: new Date('2023-08-15').getTime(),
    level: 120,
    referrals: 85,
    lastActive: '5 mins ago'
  },
  {
    id: 'USR008',
    username: 'bolanle_s',
    fullName: 'Bolanle Shonubi',
    email: 'bola.s@gmail.com',
    phoneNumber: '+234 901 000 1122',
    avatar: 'https://i.pravatar.cc/150?u=USR008',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 12000,
    pzaPoints: 2000,
    totalGames: 85,
    totalWinnings: 45000,
    joinedDate: 'Dec 12, 2023',
    joinedTimestamp: new Date('2023-12-12').getTime(),
    level: 18,
    referrals: 3,
    lastActive: '1 day ago'
  },
  {
    id: 'USR009',
    username: 'femi_x',
    fullName: 'Femi Otedola',
    email: 'femi@billionaire.ng',
    phoneNumber: '+234 805 333 4455',
    avatar: 'https://i.pravatar.cc/150?u=USR009',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 1500000,
    pzaPoints: 50000,
    totalGames: 450,
    totalWinnings: 5000000,
    joinedDate: 'Jul 01, 2023',
    joinedTimestamp: new Date('2023-07-01').getTime(),
    level: 95,
    referrals: 120,
    lastActive: '10 mins ago'
  },
  {
    id: 'USR010',
    username: 'ngozi_p',
    fullName: 'Ngozi Paul',
    email: 'ngozi.p@outlook.com',
    phoneNumber: '+234 706 555 6677',
    avatar: 'https://i.pravatar.cc/150?u=USR010',
    status: 'Banned',
    kycStatus: 'Rejected',
    walletBalance: 450,
    pzaPoints: 10,
    totalGames: 22,
    totalWinnings: 1500,
    joinedDate: 'Jan 15, 2024',
    joinedTimestamp: new Date('2024-01-15').getTime(),
    level: 5,
    referrals: 1,
    lastActive: '1 month ago'
  },
  {
    id: 'USR011',
    username: 'osita_i',
    fullName: 'Osita Iheme',
    email: 'osita.i@movie.ng',
    phoneNumber: '+234 810 777 8899',
    avatar: 'https://i.pravatar.cc/150?u=USR011',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 45000,
    pzaPoints: 8000,
    totalGames: 340,
    totalWinnings: 120000,
    joinedDate: 'Sep 20, 2023',
    joinedTimestamp: new Date('2023-09-20').getTime(),
    level: 55,
    referrals: 15,
    lastActive: '3 mins ago'
  },
  {
    id: 'USR012',
    username: 'simi_s',
    fullName: 'Simi Sogbesan',
    email: 'simi@music.ng',
    phoneNumber: '+234 902 999 0011',
    avatar: 'https://i.pravatar.cc/150?u=USR012',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 88000,
    pzaPoints: 12000,
    totalGames: 560,
    totalWinnings: 180000,
    joinedDate: 'Nov 05, 2023',
    joinedTimestamp: new Date('2023-11-05').getTime(),
    level: 72,
    referrals: 22,
    lastActive: '1 hour ago'
  },
  {
    id: 'USR013',
    username: 'davido_f',
    fullName: 'David Adeleke',
    email: 'davido@obob.ng',
    phoneNumber: '+234 803 111 2233',
    avatar: 'https://i.pravatar.cc/150?u=USR013',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 2000000,
    pzaPoints: 150000,
    totalGames: 1200,
    totalWinnings: 10000000,
    joinedDate: 'Jun 10, 2023',
    joinedTimestamp: new Date('2023-06-10').getTime(),
    level: 150,
    referrals: 500,
    lastActive: 'Just now'
  },
  {
    id: 'USR014',
    username: 'funke_a',
    fullName: 'Funke Akindele',
    email: 'funke@cinema.ng',
    phoneNumber: '+234 812 333 4455',
    avatar: 'https://i.pravatar.cc/150?u=USR014',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 65000,
    pzaPoints: 9500,
    totalGames: 280,
    totalWinnings: 95000,
    joinedDate: 'Dec 01, 2023',
    joinedTimestamp: new Date('2023-12-01').getTime(),
    level: 45,
    referrals: 10,
    lastActive: '2 days ago'
  },
  {
    id: 'USR015',
    username: 'wizkid_s',
    fullName: 'Ayo Balogun',
    email: 'wizzy@starboy.ng',
    phoneNumber: '+234 905 555 6677',
    avatar: 'https://i.pravatar.cc/150?u=USR015',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 1800000,
    pzaPoints: 120000,
    totalGames: 950,
    totalWinnings: 8500000,
    joinedDate: 'May 15, 2023',
    joinedTimestamp: new Date('2023-05-15').getTime(),
    level: 140,
    referrals: 450,
    lastActive: '5 mins ago'
  },
  {
    id: 'USR016',
    username: 'burna_b',
    fullName: 'Damini Ogulu',
    email: 'burna@giant.ng',
    phoneNumber: '+234 703 777 8899',
    avatar: 'https://i.pravatar.cc/150?u=USR016',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 1600000,
    pzaPoints: 110000,
    totalGames: 880,
    totalWinnings: 7500000,
    joinedDate: 'Apr 20, 2023',
    joinedTimestamp: new Date('2023-04-20').getTime(),
    level: 135,
    referrals: 400,
    lastActive: '12 mins ago'
  },
  {
    id: 'USR017',
    username: 'tiwa_s',
    fullName: 'Tiwa Savage',
    email: 'tiwa@queen.ng',
    phoneNumber: '+234 814 999 0011',
    avatar: 'https://i.pravatar.cc/150?u=USR017',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 75000,
    pzaPoints: 15000,
    totalGames: 420,
    totalWinnings: 250000,
    joinedDate: 'Aug 05, 2023',
    joinedTimestamp: new Date('2023-08-05').getTime(),
    level: 68,
    referrals: 35,
    lastActive: '30 mins ago'
  },
  {
    id: 'USR018',
    username: 'donjazzy_m',
    fullName: 'Michael Collins',
    email: 'don@mavin.ng',
    phoneNumber: '+234 901 222 3344',
    avatar: 'https://i.pravatar.cc/150?u=USR018',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 5000000,
    pzaPoints: 300000,
    totalGames: 5000,
    totalWinnings: 50000000,
    joinedDate: 'Jan 01, 2023',
    joinedTimestamp: new Date('2023-01-01').getTime(),
    level: 250,
    referrals: 2500,
    lastActive: 'Just now'
  },
  {
    id: 'USR019',
    username: 'yemi_a',
    fullName: 'Yemi Alade',
    email: 'yemi@mama.ng',
    phoneNumber: '+234 802 555 6677',
    avatar: 'https://i.pravatar.cc/150?u=USR019',
    status: 'Suspended',
    kycStatus: 'Verified',
    walletBalance: 42000,
    pzaPoints: 5500,
    totalGames: 180,
    totalWinnings: 65000,
    joinedDate: 'Oct 20, 2023',
    joinedTimestamp: new Date('2023-10-20').getTime(),
    level: 32,
    referrals: 12,
    lastActive: '5 days ago'
  },
  {
    id: 'USR020',
    username: 'olamide_b',
    fullName: 'Olamide Badoo',
    email: 'olamide@ybnl.ng',
    phoneNumber: '+234 810 888 9900',
    avatar: 'https://i.pravatar.cc/150?u=USR020',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 1200000,
    pzaPoints: 85000,
    totalGames: 720,
    totalWinnings: 4500000,
    joinedDate: 'Feb 15, 2023',
    joinedTimestamp: new Date('2023-02-15').getTime(),
    level: 110,
    referrals: 320,
    lastActive: '15 mins ago'
  },
  {
    id: 'USR021',
    username: 'newbie_01',
    fullName: 'Kola Abiola',
    email: 'kola@new.io',
    phoneNumber: '+234 809 111 2222',
    avatar: 'https://i.pravatar.cc/150?u=USR021',
    status: 'Active',
    kycStatus: 'Pending',
    walletBalance: 5000,
    pzaPoints: 100,
    totalGames: 2,
    totalWinnings: 0,
    joinedDate: 'Mar 25, 2024',
    joinedTimestamp: new Date('2024-03-25').getTime(),
    level: 1,
    referrals: 0,
    lastActive: 'Just now'
  },
  {
    id: 'USR022',
    username: 'gamer_pro',
    fullName: 'Sani Bello',
    email: 'sani@pro.ng',
    phoneNumber: '+234 813 444 5555',
    avatar: 'https://i.pravatar.cc/150?u=USR022',
    status: 'Active',
    kycStatus: 'Verified',
    walletBalance: 15000,
    pzaPoints: 450,
    totalGames: 12,
    totalWinnings: 3000,
    joinedDate: 'Mar 24, 2024',
    joinedTimestamp: new Date('2024-03-24').getTime(),
    level: 5,
    referrals: 2,
    lastActive: '1 hr ago'
  }
];


export const userStats: UserStat[] = [
  { label: 'Total Players', value: '128.4k', change: '+12%', trend: 'up' },
  { label: 'Active Today', value: '94.2k', change: '+5%', trend: 'up' },
  { label: 'Banned Users', value: '1.2k', change: '-2%', trend: 'down' },
  { label: 'KYC Pending', value: '450', change: 'Priority', trend: 'up' }
];

export const matchHistory: MatchRecord[] = [
  { id: 'M1', game: 'Whiz Trivia Pro', score: '4,820', position: '1st / 50', winnings: 5000, date: 'Oct 24, 14:22', status: 'COMPLETED' },
  { id: 'M2', game: 'Penalty Shootout Elite', score: '12', position: '3rd / 10', winnings: 1200, date: 'Oct 24, 11:05', status: 'COMPLETED' },
  { id: 'M3', game: 'Playza Arena: Survival', score: '--', position: 'DNF', winnings: 0, date: 'Oct 23, 22:45', status: 'LOST' },
  { id: 'M4', game: 'Speed Solver 500', score: '850', position: '12th / 100', winnings: 200, date: 'Oct 22, 18:30', status: 'COMPLETED' },
  { id: 'M5', game: 'Word Wizard', score: '1200', position: '5th / 80', winnings: 1500, date: 'Oct 21, 09:15', status: 'COMPLETED' },
  { id: 'M6', game: 'Math Mayhem', score: '45', position: '2nd / 20', winnings: 800, date: 'Oct 20, 14:45', status: 'COMPLETED' },
  { id: 'M7', game: 'Trivia Titan', score: '3200', position: '25th / 200', winnings: 0, date: 'Oct 19, 21:00', status: 'LOST' }
];

export const transactionHistory: TransactionRecord[] = [
  { id: 'T1', type: 'Deposit', amount: 10000, method: 'Paystack', date: 'Oct 22, 10:30', status: 'Successful', username: 'olanrewaju_77' },
  { id: 'T2', type: 'Withdrawal', amount: 5000, method: 'Bank Transfer', date: 'Oct 21, 15:45', status: 'Successful', username: 'chidimma_ox' },
  { id: 'T3', type: 'Game Entry', amount: 500, method: 'Wallet', date: 'Oct 20, 12:00', status: 'Successful', username: 'musa_king' },
  { id: 'T4', type: 'Winnings', amount: 1500, method: 'Wallet', date: 'Oct 19, 16:20', status: 'Successful', username: 'amaka_p' },
  { id: 'T5', type: 'Deposit', amount: 20000, method: 'Flutterwave', date: 'Oct 18, 11:10', status: 'Successful', username: 'tunde_dev' },
  { id: 'T6', type: 'Withdrawal', amount: 15000, method: 'Bank Transfer', date: 'Oct 17, 14:30', status: 'Pending', username: 'zainab_y' }
];

export const referralHistory: ReferralRecord[] = [
  { id: 'R1', username: 'john_doe', date: 'Oct 15, 2023', reward: 500, status: 'Qualified' },
  { id: 'R2', username: 'jane_smith', date: 'Oct 12, 2023', reward: 500, status: 'Qualified' },
  { id: 'R3', username: 'benson_x', date: 'Oct 10, 2023', reward: 0, status: 'Pending' },
  { id: 'R4', username: 'alex_g', date: 'Oct 08, 2023', reward: 500, status: 'Qualified' },
  { id: 'R5', username: 'mary_k', date: 'Oct 05, 2023', reward: 0, status: 'Pending' }
];
