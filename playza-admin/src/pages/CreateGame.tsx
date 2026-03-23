import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  MdInfo, 
  MdCalendarMonth, 
  MdAdd, 
  MdClose, 
  MdRocketLaunch 
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);

  return (
    <main className="p-4 md:p-10 min-h-screen bg-background text-foreground transition-colors duration-300">
      <div className="max-w-6xl mx-auto space-y-12">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-border/50">
          <div className="space-y-4">
            <h2 className="text-3xl md:text-5xl font-black font-headline tracking-tighter text-primary uppercase">Matrix Initialization</h2>
            <p className="text-muted-foreground font-body max-w-lg">Define the parameters of a new virtual battlefield. Configure core mechanics and schedule the inaugural sessions.</p>
          </div>
          <div className="flex items-center gap-4 w-full lg:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/games')} 
              className="flex-1 lg:flex-none h-14 rounded-xl font-black uppercase tracking-widest text-xs"
            >
              Abort Mission
            </Button>
            <Button className="flex-1 lg:flex-none h-14 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black shadow-2xl uppercase tracking-widest text-xs">
              Generate Simulation
            </Button>
          </div>
        </div>

        <form className="space-y-12 pb-20">
          {/* Section 1: Game Details */}
          <section className="glass-card bg-card p-8 rounded-3xl border border-border/50 shadow-xl space-y-8">
            <div className="flex items-center gap-3 border-b border-border/30 pb-4">
              <MdInfo className="text-primary text-2xl" />
              <h3 className="text-xl font-black font-headline uppercase tracking-tight">Core Metadata</h3>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Title</label>
                  <Input className="h-14 bg-muted/20 border-border/50 rounded-2xl font-bold" placeholder="e.g. Cyber Strikers" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Identifier Slug</label>
                  <Input className="h-14 bg-muted/20 border-border/50 rounded-2xl font-bold" placeholder="cyber-strikers-pro" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Category</label>
                  <select title="Category Select" className="flex h-14 w-full rounded-2xl border border-border/50 bg-muted/20 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option>Battle Royale</option>
                    <option>MOBA</option>
                    <option>Strategy</option>
                    <option>Sports</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Difficulty Rating</label>
                  <select title="Difficulty Select" className="flex h-14 w-full rounded-2xl border border-border/50 bg-muted/20 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Pro Circuit</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Entry Fee (₦)</label>
                  <Input type="number" className="h-14 bg-muted/20 border-border/50 rounded-2xl font-bold" defaultValue={1000} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Platform Tax (%)</label>
                  <Input type="number" className="h-14 bg-muted/20 border-border/50 rounded-2xl font-bold" defaultValue={5} />
                </div>
              </div>

              {/* Side Column: Media & Toggle */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground pl-1">Visual Asset (Thumbnail)</label>
                  <div className="aspect-video rounded-3xl bg-muted/10 border-2 border-dashed border-border/50 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 transition-all overflow-hidden group">
                    <div className="text-center group-hover:scale-110 transition-transform duration-500">
                      <MdRocketLaunch className="text-4xl text-primary/40 mb-2 mx-auto" />
                      <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest px-4">Upload 4K Matrix Asset</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-muted/10 rounded-3xl border border-border/30">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-foreground">Global Availability</span>
                    <span className="text-[10px] font-black text-muted-foreground uppercase mt-1 opacity-50">Visible to Users</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Sessions Setup */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <MdCalendarMonth className="text-primary text-2xl" />
                <h3 className="text-xl font-black font-headline uppercase tracking-tight">Deployment Schedule</h3>
              </div>
              <Button type="button" variant="outline" className="h-12 border-primary/20 text-primary hover:bg-primary/5 rounded-xl font-black uppercase tracking-widest text-[10px]">
                <MdAdd className="text-lg" /> Add Session
              </Button>
            </div>

            {/* Session Block 1 */}
            <div className="glass-card bg-card p-8 rounded-3xl border border-border/50 relative shadow-lg group">
              <button className="absolute -top-3 -right-3 h-10 w-10 bg-rose-500 text-white rounded-xl flex items-center justify-center shadow-lg hover:scale-110 active:scale-95 transition-all z-10" type="button">
                <MdClose className="text-lg" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-end">
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Session Title</label>
                  <Input className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold" placeholder="Qualifier Alpha" />
                </div>
                <div className="col-span-12 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Entry Toll (₦)</label>
                  <Input type="number" className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold" defaultValue={100} />
                </div>
                <div className="col-span-12 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Limit</label>
                  <Input type="number" className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold" defaultValue={64} />
                </div>
                <div className="md:col-span-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Start Epoch</label>
                    <Input type="datetime-local" className="h-12 bg-muted/20 border-border/50 rounded-xl font-bold text-[10px]" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Arena Type</label>
                    <select title="Arena Type" className="flex h-12 w-full rounded-xl border border-border/50 bg-muted/20 px-3 py-2 text-xs font-bold focus:outline-none appearance-none">
                      <option>Daily</option>
                      <option>Tournament</option>
                    </select>
                  </div>
                </div>
              </div>
              {/* Prize Logic Footer */}
              <div className="mt-8 pt-6 border-t border-border/30 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex gap-10">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Projected Prize Pool</span>
                    <span className="text-xl font-black text-emerald-500 tracking-tight">₦608,000</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-widest mb-1">Imperial Yield (5%)</span>
                    <span className="text-xl font-black text-primary tracking-tight">₦32,000</span>
                  </div>
                </div>
                <p className="text-[10px] italic font-black text-muted-foreground uppercase tracking-widest opacity-40">System calculates ₦50 yield per entry based on 5% platform directive.</p>
              </div>
            </div>
          </section>

          {/* Final Actions */}
          <div className="flex flex-col md:flex-row items-center justify-end gap-10 pt-12 border-t border-border/50">
            <div className="flex flex-col text-right w-full md:w-auto">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-widest mb-1 opacity-50">Matrix Revenue Forecast</span>
              <span className="text-2xl md:text-3xl font-black text-primary tracking-tighter uppercase font-headline">₦1.8M Expected Yield</span>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
              <Button type="button" variant="outline" className="flex-1 md:flex-none h-16 px-8 rounded-2xl font-black uppercase tracking-widest text-xs">
                Draft Only
              </Button>
              <Button className="flex-1 md:flex-none h-16 px-10 bg-primary text-primary-foreground hover:bg-primary/90 rounded-2xl font-black shadow-2xl uppercase tracking-widest text-xs flex items-center gap-3">
                <MdRocketLaunch className="text-xl animate-pulse" />
                Initialize Simulation
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateGame;
