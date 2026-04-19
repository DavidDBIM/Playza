import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  MdInfo, 
  MdCalendarMonth, 
  MdAdd, 
  MdClose, 
  MdRocketLaunch,
} from 'react-icons/md';
import { Input } from '../components/ui/input';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue,
  SelectGroup,
  SelectLabel,
  SelectSeparator
} from '../components/ui/select';

const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);

  const categories = [
    { label: "Competitive", items: ["Battle Royale", "MOBA", "Strategy", "Shooter (FPS/TPS)", "Fighting"] },
    { label: "Racing & Sports", items: ["Racing", "Sports", "Simulation"] },
    { label: "Casual & Arcade", items: ["Arcade", "Retro", "Puzzle", "Trivia", "Card Games"] },
    { label: "Adventure", items: ["Adventure", "Role Playing (RPG)"] }
  ];

  const difficulties = ["Beginner", "Intermediate", "Advanced", "Pro Circuit", "Legendary"];

  return (
    <main className="p-4 space-y-4">
      <div className="space-y-8">
        {/* Page Header */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-primary to-orange-500 flex items-center justify-center shadow-md shadow-primary/30">
              <MdRocketLaunch className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-foreground tracking-tight">Publish Game</h1>
              <p className="text-sm text-muted-foreground font-medium">Define a new game listing and configure mechanics</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/games')} 
              className="px-6 py-2 bg-muted hover:bg-muted/80 rounded-xl text-sm font-bold text-foreground transition-all"
            >
              Cancel
            </button>
            <button className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all">
              Initialize Game
            </button>
          </div>
        </div>

        <form className="space-y-8 pb-20">
          {/* Section 1: Game Details */}
          <section className="bg-card border border-border rounded-xl shadow-sm p-4 space-y-4">
            <div className="flex items-center gap-2 border-b border-border pb-3">
              <MdInfo className="text-primary text-lg" />
              <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Core Metadata</h3>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Title <span className="text-rose-500">*</span></label>
                  <Input required className="h-11 bg-muted border-border rounded-xl font-bold font-heading" placeholder="e.g. Cyber Strikers" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Identifier Slug <span className="text-rose-500">*</span></label>
                  <Input required className="h-11 bg-muted border-border rounded-xl font-bold lowercase" placeholder="velocity-gl" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Category <span className="text-rose-500">*</span></label>
                  <Select>
                    <SelectTrigger className="h-11 bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Select Category" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {categories.map((group, i) => (
                        <React.Fragment key={group.label}>
                          <SelectGroup>
                            <SelectLabel className="text-[9px] font-black uppercase tracking-widest text-muted-foreground px-2 py-1">{group.label}</SelectLabel>
                            {group.items.map(item => (
                              <SelectItem key={item} value={item} className="text-xs font-bold">{item}</SelectItem>
                            ))}
                          </SelectGroup>
                          {i < categories.length - 1 && <SelectSeparator />}
                        </React.Fragment>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Difficulty</label>
                  <Select>
                    <SelectTrigger className="h-11 bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Select Difficulty" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      {difficulties.map(item => (
                        <SelectItem key={item} value={item} className="text-xs font-bold">{item}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Mode</label>
                  <Select>
                    <SelectTrigger className="h-11 bg-muted border-border rounded-xl">
                      <SelectValue placeholder="Tournament / Quick Match" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="Tournament" className="text-xs font-bold">Tournament</SelectItem>
                      <SelectItem value="Quick Match" className="text-xs font-bold">Quick Match</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Duration (Seconds) <span className="text-rose-500">*</span></label>
                  <Input type="number" required className="h-11 bg-muted border-border rounded-xl font-bold font-number" defaultValue={300} />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Platform Fee (%) <span className="text-rose-500">*</span></label>
                  <Input type="number" required className="h-11 bg-muted border-border rounded-xl font-bold font-number" defaultValue={10} />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Iframe URL <span className="text-rose-500">*</span></label>
                  <Input required className="h-11 bg-muted border-border rounded-xl font-bold text-xs" placeholder="https://cdn.playza.com/gameLib/VelocityGL/index.html" />
                </div>
              </div>

              {/* Side Column: Media & Toggle */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Thumbnail URL</label>
                  <Input className="h-11 bg-muted border-border rounded-xl" placeholder="https://cdn.playza.com/games/velocity-gl.png" />
                </div>
                <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-wider text-foreground font-heading">Active Status</span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase mt-0.5">Visible to Users</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-primary' : 'bg-muted-foreground/30'}`}
                  >
                    <span className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-5' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>
            </div>

            {/* How To Play */}
            <div className="border-t border-border pt-6 grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { label: "Controls", placeholder: "Use WASD or Arrow Keys..." },
                { label: "Rules", placeholder: "Win conditions, disqualifications..." },
                { label: "Scoring", placeholder: "How points are awarded..." },
              ].map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">{item.label}</label>
                  <textarea 
                    required 
                    rows={3} 
                    className="w-full bg-muted border border-border rounded-xl p-3 font-medium text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 resize-none text-foreground" 
                    placeholder={item.placeholder}
                  />
                </div>
              ))}
            </div>
          </section>

          {/* Section 2: Sessions Setup */}
          <section className="space-y-4">
            <div className="flex items-center justify-between px-1">
              <div className="flex items-center gap-2">
                <MdCalendarMonth className="text-primary text-xl" />
                <h3 className="text-sm font-black text-foreground uppercase tracking-wider">Match Sessions</h3>
              </div>
              <button type="button" className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border">
                <MdAdd className="text-lg mr-1 inline" /> Add Session
              </button>
            </div>

            {/* Session Block 1 */}
            <div className="bg-card border border-border rounded-2xl p-6 shadow-sm relative">
              <button className="absolute -top-2 -right-2 h-8 w-8 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-rose-600 transition-all z-10" type="button">
                <MdClose className="text-lg" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                <div className="md:col-span-4 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Session Title</label>
                  <Input className="h-11 bg-muted border-border rounded-xl font-bold uppercase tracking-tight" placeholder="Elite Tournament #1" defaultValue="Elite Tournament #1" />
                </div>
                <div className="col-span-12 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Type</label>
                  <Select defaultValue="tournament">
                    <SelectTrigger className="h-11 bg-muted border-border rounded-xl font-bold text-xs uppercase" >
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent className="bg-card border-border">
                      <SelectItem value="tournament" className="text-xs font-bold">Tournament</SelectItem>
                      <SelectItem value="daily" className="text-xs font-bold">Daily</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="col-span-12 md:col-span-2 space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Entry Fee</label>
                  <Input type="number" className="h-11 bg-muted border-border rounded-xl font-black text-emerald-600 font-number" defaultValue={1500} />
                </div>
                <div className="md:col-span-12 lg:col-span-4 grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Max Players</label>
                    <Input type="number" className="h-11 bg-muted border-border rounded-xl font-black font-number" defaultValue={200} />
                  </div>
                   <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Winners</label>
                    <Input type="number" className="h-11 bg-muted border-border rounded-xl font-black font-number" defaultValue={20} />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Start</label>
                    <Input type="datetime-local" defaultValue="2026-04-16T13:00" className="h-11 bg-muted border-border rounded-xl font-bold text-[10px] uppercase" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">End</label>
                    <Input type="datetime-local" defaultValue="2026-04-16T16:00" className="h-11 bg-muted border-border rounded-xl font-bold text-[10px] uppercase" />
                  </div>
                </div>
              </div>
              {/* Prize Logic Footer */}
              <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex flex-wrap gap-6">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">Gross Expected</span>
                    <span className="text-lg font-black text-foreground font-number tracking-tight">300,000</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">Platform Fee (10%)</span>
                    <span className="text-lg font-black text-primary font-number tracking-tight">30,000</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">Prize Pool (Net)</span>
                    <span className="text-lg font-black text-emerald-500 font-number tracking-tight">270,000</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
            <div className="flex flex-col w-full lg:w-auto">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">Expected Max Profit</span>
              <span className="text-2xl font-black text-emerald-500 tracking-tight uppercase font-number">₦320 Estimated</span>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button type="button" className="flex-1 lg:flex-none px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border border-border bg-card text-foreground hover:bg-muted transition-all">
                Save Draft
              </button>
              <button 
                onClick={() => navigate('/games')} 
                className="flex-1 lg:flex-none px-10 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group"
              >
                <MdRocketLaunch className="text-lg" />
                Publish Game
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateGame;
