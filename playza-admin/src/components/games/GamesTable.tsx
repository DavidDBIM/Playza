import React from 'react';
import { useNavigate } from 'react-router';
import { 
  MdEdit, 
  MdDeleteForever, 
  MdRemoveRedEye, 
  MdCheckCircle, 
  MdCancel, 
  MdErrorOutline,
  MdGamepad,
  MdShield
} from 'react-icons/md';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Button } from '../ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from '../ui/dropdown-menu';
import type { Game } from '../../data/gamesData';

interface GamesTableProps {
  games: Game[];
  clearFilters: () => void;
}

export const GamesTable: React.FC<GamesTableProps> = ({ games, clearFilters }) => {
  const navigate = useNavigate();
  return (
    <div className="overflow-x-auto relative">
      <Table className="border-collapse w-full">
        <TableHeader className="bg-muted/30 border-b border-border/30">
          <TableRow className="hover:bg-transparent border-none">
            <TableHead className="py-6 px-4 md:px-8 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/70">Game Details</TableHead>
            <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/70">Category</TableHead>
            <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/70 text-right">Entry Fee</TableHead>
            <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/70 text-center">Difficulty</TableHead>
            <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/70 text-center">Status</TableHead>
            <TableHead className="py-6 px-4 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/70 text-center">Players</TableHead>
            <TableHead className="py-6 px-4 md:px-8 font-black uppercase text-[10px] tracking-[0.2em] text-muted-foreground/70 text-right"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {games.length > 0 ? (
            games.map((game) => (
              <TableRow 
                key={game.id} 
                className="group border-b border-border/20 hover:bg-muted/10 transition-colors duration-200 cursor-pointer"
                onClick={() => navigate(`/games/${game.slug}`)}
              >
                <TableCell className="py-5 px-4 md:px-8">
                  <div className="flex items-center gap-4">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-border/40 shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-300">
                      <img 
                        src={game.thumbnail} 
                        alt={game.title} 
                        className="w-full h-full object-cover"
                      />
                      {game.badge && (
                        <div className="absolute top-0 right-0 bg-primary text-[8px] font-black px-1.5 py-0.5 rounded-bl-lg shadow-lg">
                          {game.badge}
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="font-headline font-black text-sm text-foreground group-hover:text-primary transition-colors uppercase tracking-tight">
                        {game.title}
                      </h3>
                      <p className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest mt-1">
                        ID: {game.id} • {game.mode}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell className="py-5 px-4 font-body font-bold text-sm">
                  <span className="px-4 py-2 rounded-2xl bg-primary/10 text-primary font-black text-[11px] uppercase border border-primary/20 tracking-widest shadow-[0_0_15px_rgba(var(--primary-rgb),0.1)] group-hover:bg-primary group-hover:text-white transition-all duration-300 flex items-center gap-2 w-max">
                    <MdShield className="text-xs opacity-60" />
                    {game.category}
                  </span>
                </TableCell>
                <TableCell className="py-5 px-4 text-right font-headline font-black text-sm text-foreground">
                  ₦{game.entryFee.toLocaleString()}
                </TableCell>
                <TableCell className="py-5 px-4 text-center">
                  <div className={`text-[10px] font-black px-3 py-1 rounded-full border inline-block tracking-widest ${
                    game.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/10' :
                    game.difficulty === 'Medium' ? 'bg-amber-500/10 text-amber-500 border-amber-500/10' :
                    'bg-rose-500/10 text-rose-500 border-rose-500/10'
                  }`}>
                    {game.difficulty.toUpperCase()}
                  </div>
                </TableCell>
                <TableCell className="py-5 px-4 text-center">
                  <div className="flex items-center justify-center gap-2">
                    {game.isActive ? (
                      <MdCheckCircle className="text-emerald-500 text-lg" title="Live" />
                    ) : (
                      <MdCancel className="text-muted-foreground/40 text-lg" title="Disabled" />
                    )}
                    <span className={`text-[10px] font-black uppercase tracking-widest ${game.isActive ? 'text-emerald-500' : 'text-muted-foreground/40'}`}>
                      {game.isActive ? 'Live' : 'Off'}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="py-5 px-4 text-center">
                  <div className="flex flex-col items-center">
                    <span className="font-headline font-black text-sm text-primary">{game.activePlayers}</span>
                    <span className="text-[9px] text-muted-foreground/50 font-black uppercase tracking-tighter">ActiveNow</span>
                  </div>
                </TableCell>
                <TableCell className="py-5 px-4 md:px-8 text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-10 w-10 rounded-xl hover:bg-primary/5 hover:text-primary transition-all group"
                        onClick={(e) => {
                          e.stopPropagation(); // prevent row click from triggering twice
                          navigate(`/games/${game.slug}`);
                        }}
                      >
                        <MdEdit className="text-lg group-hover:rotate-12 transition-transform" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 bg-popover/95 backdrop-blur-xl border-border/50">
                      <DropdownMenuItem 
                        className="rounded-xl px-4 py-3 font-bold text-sm cursor-pointer gap-3"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/games/${game.slug}`);
                        }}
                      >
                        <MdRemoveRedEye className="text-lg text-primary" /> View Details
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl px-4 py-3 font-bold text-sm cursor-pointer gap-3">
                        <MdEdit className="text-lg text-amber-500" /> Edit Metadata
                      </DropdownMenuItem>
                      <DropdownMenuItem className="rounded-xl px-4 py-3 font-bold text-sm cursor-pointer gap-3 text-rose-500 focus:text-rose-600 focus:bg-rose-500/5">
                        <MdDeleteForever className="text-lg" /> Retire Game
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={7} className="h-96 text-center">
                <div className="flex flex-col items-center justify-center space-y-4 opacity-30 grayscale pointer-events-none">
                  <div className="p-8 rounded-full bg-muted shadow-inner relative">
                    <MdGamepad className="text-8xl" />
                    <MdErrorOutline className="absolute -top-2 -right-2 text-4xl text-rose-500 animate-bounce" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-black font-headline uppercase tracking-widest">No Matches Detected</h3>
                    <p className="font-body text-sm font-bold opacity-60">The simulation returned 0 results for your current query.</p>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    className="mt-4 pointer-events-auto border-primary/50 text-primary hover:bg-primary/5 h-12 px-8 rounded-xl font-black uppercase tracking-[0.2em]"
                  >
                    Reset Grid
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
};
