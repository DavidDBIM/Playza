import React from 'react';
import { MdSearch, MdFilterList, MdFileDownload, MdClear } from 'react-icons/md';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
  DropdownMenuLabel,
  DropdownMenuSeparator
} from '../ui/dropdown-menu';

interface GamesToolbarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  categoryFilter: string;
  setCategoryFilter: (filter: string) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  clearFilters: () => void;
}

export const GamesToolbar: React.FC<GamesToolbarProps> = ({
  searchQuery,
  setSearchQuery,
  categoryFilter,
  setCategoryFilter,
  statusFilter,
  setStatusFilter,
  clearFilters
}) => {
  const categories = ['All Categories', 'Arcade', 'Action', 'Strategy', 'Puzzle', 'Trivia'];
  const statuses = ['All Status', 'Active', 'Inactive'];

  return (
    <div className="p-4 md:p-5 space-y-3 border-b border-border/50">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="relative group w-full lg:max-w-md">
          <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors text-lg" />
          <Input 
            placeholder="Search game titles or IDs..." 
            className="pl-10 h-11 bg-muted/20 border-border/50 focus:border-primary/50 focus:ring-primary/20 rounded-xl transition-all"
            value={searchQuery}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Category Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-border/50 rounded-xl px-4 hover:bg-muted/50 gap-2 font-bold text-xs">
                <MdFilterList className="text-lg text-primary" />
                {categoryFilter}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Category Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={categoryFilter} onValueChange={setCategoryFilter}>
                {categories.map(cat => (
                  <DropdownMenuRadioItem key={cat} value={cat} className="rounded-xl font-bold">{cat}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Status Filter */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="h-10 border-border/50 rounded-xl px-4 hover:bg-muted/50 gap-2 font-bold text-xs">
                <MdFilterList className="text-lg text-primary" />
                {statusFilter === 'Active' ? 'Only Active' : statusFilter === 'Inactive' ? 'Only Inactive' : 'All Status'}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 rounded-xl p-2">
              <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-muted-foreground">Status Filter</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuRadioGroup value={statusFilter} onValueChange={setStatusFilter}>
                {statuses.map(status => (
                  <DropdownMenuRadioItem key={status} value={status} className="rounded-xl font-bold">{status}</DropdownMenuRadioItem>
                ))}
              </DropdownMenuRadioGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          {(searchQuery || categoryFilter !== 'All Categories' || statusFilter !== 'All Status') && (
            <Button 
              variant="ghost" 
              onClick={clearFilters}
              className="h-10 rounded-xl text-muted-foreground hover:text-primary hover:bg-primary/5 px-3 font-bold flex items-center gap-2"
            >
              <MdClear />
              Reset
            </Button>
          )}

          <div className="h-10 w-px bg-border/30 mx-2 hidden sm:block"></div>

          <Button variant="outline" className="h-10 border-border/50 rounded-xl px-4 hover:bg-primary/5 hover:text-primary gap-2 font-bold text-xs transition-all group">
            <MdFileDownload className="text-lg group-hover:scale-110 transition-transform" />
            Export Data
          </Button>
        </div>
      </div>
    </div>
  );
};
