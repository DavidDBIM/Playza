import React from 'react';
import { 
  MdFiberManualRecord, 
  MdVerified, 
  MdPending, 
  MdCancel, 
  MdSearch,
  MdContentCopy 
} from 'react-icons/md';
import { useNavigate } from 'react-router';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Button } from '../ui/button';
import type { UserRecord } from '../../data/usersData';

interface UsersTableProps {
  users: UserRecord[];
  clearFilters: () => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({ users, clearFilters }) => {
  const navigate = useNavigate();

  return (
    <div className="overflow-x-auto no-scrollbar min-h-100">
      <Table>
        <TableHeader className="bg-muted/30">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">Citizen Identity</TableHead>
            <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">Marketing Intel</TableHead>
            <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 text-center">Status</TableHead>
            <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 text-right">Wallet Capital</TableHead>
            <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 text-center">Citizenship</TableHead>
            <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60">Enlistment</TableHead>
            <TableHead className="px-5 py-3 text-[10px] uppercase tracking-[0.2em] font-black text-muted-foreground/60 text-right">Operation</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.length > 0 ? (
            users.map((user) => (
              <TableRow 
                key={user.id} 
                className="group hover:bg-primary/5 transition-all border-border/20 cursor-pointer relative overflow-hidden"
                onClick={() => navigate(`/users/${user.id}`)}
              >
                <TableCell className="px-5 py-3.5 relative z-10 transition-transform group-hover:translate-x-1">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl overflow-hidden border-2 border-primary/10 group-hover:border-primary/40 transition-all shadow-md">
                      <img src={user.avatar} alt={user.username} className="w-full h-full object-cover grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500 scale-110 group-hover:scale-100 font-bold" />
                    </div>
                    <div className="space-y-0.5">
                      <p className="font-black text-sm text-foreground group-hover:text-primary transition-colors">{user.fullName}</p>
                      <p className="text-[10px] font-black uppercase text-muted-foreground/60 tracking-widest">@{user.username}</p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <div className="flex flex-col gap-1 group/email relative">
                    <div className="flex items-center gap-2">
                       <span className="text-xs font-bold text-foreground/80">{user.email}</span>
                       <button 
                         onClick={(e) => {
                           e.stopPropagation();
                           navigator.clipboard.writeText(user.email);
                         }}
                         className="opacity-0 group-hover/email:opacity-100 p-1 hover:bg-primary/10 rounded transition-all text-primary"
                         title="Copy Email"
                       >
                         <MdContentCopy className="text-xs" />
                       </button>
                    </div>
                    <span className="text-[9px] font-black text-primary uppercase tracking-widest">{user.phoneNumber || 'NO PHONE'}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <div className="flex justify-center">
                    <span className={`px-4 py-1.5 rounded-full text-[9px] font-black flex items-center gap-2 shadow-sm border ${
                      user.status === 'Active' ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' : 
                      user.status === 'Banned' ? 'bg-destructive/10 text-destructive border-destructive/20' : 
                      user.status === 'Suspended' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' :
                      'bg-blue-500/10 text-blue-600 border-blue-500/20'
                    }`}>
                      <MdFiberManualRecord className={`text-[8px] ${user.status === 'Active' ? 'animate-pulse' : ''}`} />
                      {user.status.toUpperCase()}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right">
                   <div className="flex flex-col items-end">
                     <span className="font-headline font-black text-primary text-base">₦{user.walletBalance.toLocaleString()}</span>
                     <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Available Credit</span>
                   </div>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <div className={`flex flex-col items-center gap-1 font-black text-[9px] tracking-widest ${
                    user.kycStatus === 'Verified' ? 'text-emerald-600 dark:text-emerald-400' : 
                    user.kycStatus === 'Pending' ? 'text-amber-500' : 
                    'text-destructive'
                  }`}>
                    <div className="p-1 px-3 rounded-lg bg-current/10 border border-current/10 flex items-center gap-2">
                      {user.kycStatus === 'Verified' ? <MdVerified className="text-sm" /> : 
                       user.kycStatus === 'Pending' ? <MdPending className="text-sm" /> : 
                       <MdCancel className="text-sm" />}
                      {user.kycStatus.toUpperCase()}
                    </div>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5">
                  <div className="flex flex-col">
                    <span className="text-xs font-bold text-foreground/80">{user.joinedDate}</span>
                    <span className="text-[9px] font-black text-muted-foreground/40 uppercase tracking-widest">Active {user.lastActive}</span>
                  </div>
                </TableCell>
                <TableCell className="px-5 py-3.5 text-right">
                  <Button 
                    variant="ghost" 
                    className="group-hover:bg-primary group-hover:text-primary-foreground transition-all px-6 h-9 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] border border-primary/10 hover:border-primary/40 shadow-sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/users/${user.username}`);
                    }}
                  >
                    Profile
                  </Button>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-64 text-center">
                <div className="flex flex-col items-center justify-center space-y-4 opacity-30">
                  <MdSearch className="text-6xl" />
                  <div>
                    <p className="text-xl font-headline font-black">No Citizens Found</p>
                    <p className="text-sm font-body">Your search protocols yielded no results from the registry.</p>
                  </div>
                  <Button onClick={clearFilters} variant="outline" className="mt-4 rounded-xl border-primary/30 text-primary uppercase font-black tracking-widest text-[10px]">Reset Systems</Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
