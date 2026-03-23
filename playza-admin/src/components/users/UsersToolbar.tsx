import React from 'react';
import { 
  MdSearch, 
  MdClose, 
  MdKeyboardArrowDown, 
  MdFilterList, 
  MdFileDownload 
} from 'react-icons/md';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';

interface UsersToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  statusFilter: string;
  setStatusFilter: (status: string) => void;
  clearFilters: () => void;
}

export const UsersToolbar: React.FC<UsersToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  statusFilter,
  setStatusFilter,
  clearFilters
}) => {
  return (
    <div className="p-4 md:p-6 border-b border-border/30 flex flex-wrap items-center justify-between gap-4 bg-muted/20 backdrop-blur-md">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-4 flex-1">
        <div className="relative flex-1 max-w-md">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 text-xl" />
          <input 
            type="text" 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, username or ID..." 
            className="w-full bg-background border border-border/50 rounded-2xl py-3.5 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 text-foreground outline-none transition-all shadow-inner placeholder:text-muted-foreground/30 font-medium"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-full hover:bg-accent/20 transition-all font-bold"
            >
              <MdClose />
            </button>
          )}
        </div>
        <div className="flex gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex-1 md:flex-none bg-background border-border/50 rounded-2xl text-xs font-black py-3.5 pl-4 pr-3 h-12 focus:ring-2 focus:ring-primary/20 text-foreground outline-none cursor-pointer hover:bg-accent/10 transition-all flex items-center gap-4 uppercase tracking-widest min-w-[140px] justify-between shadow-sm">
                {statusFilter}
                <MdKeyboardArrowDown className="text-lg text-primary" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-card/95 backdrop-blur-xl border-border/50 shadow-2xl rounded-2xl min-w-[180px] p-2 z-50">
              <DropdownMenuItem onClick={() => setStatusFilter('All Status')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer hover:bg-primary/5 transition-colors">All Status</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Active')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer text-emerald-500 hover:bg-emerald-500/5 transition-colors">Active Citizens</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Banned')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer text-destructive hover:bg-destructive/5 transition-colors">Banned Users</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Suspended')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer text-amber-500 hover:bg-amber-500/5 transition-colors">Suspended</DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('Pending')} className="text-[10px] font-black uppercase tracking-widest py-3 px-4 rounded-xl cursor-pointer text-blue-500 hover:bg-blue-500/5 transition-colors">Pending Review</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <div className="flex gap-3 w-full md:w-auto">
        {(searchQuery || statusFilter !== 'All Status') && (
          <Button 
            onClick={clearFilters}
            variant="ghost" 
            className="text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors flex items-center gap-2"
          >
            <MdClose />
            Clear
          </Button>
        )}
        <Button variant="outline" className="flex-1 md:flex-none bg-background hover:bg-accent/10 border-border/50 text-foreground h-11 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm">
          <MdFilterList className="text-primary text-base" />
          Advanced
        </Button>
        <Button variant="outline" className="flex-1 md:flex-none bg-background hover:bg-accent/10 border-border/50 text-foreground h-11 px-5 rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-sm">
          <MdFileDownload className="text-primary text-base" />
          Export
        </Button>
      </div>
    </div>
  );
};
