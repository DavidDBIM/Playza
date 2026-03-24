import React, { useState } from 'react';
import { useNavigate } from 'react-router';
import { 
  MdInfo, 
  MdCalendarMonth, 
  MdAdd, 
  MdClose, 
  MdRocketLaunch,
  MdImage,
  MdArticle
} from 'react-icons/md';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';

const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);

  return (
    <main className="flex-1 mx-auto w-full pb-10 p-4 md:p-10 max-w-350">
      <div className="mx-auto space-y-12 border-b-none">
        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-200 dark:border-white/10">
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5 px-3 py-1 bg-primary/10 text-primary text-[10px] font-black tracking-widest uppercase rounded-full border border-primary/20 shadow-sm">
                 Studio Setup
              </span>
            </div>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Publish Game</h2>
            <p className="text-slate-500 dark:text-slate-400 font-bold max-w-lg text-sm md:text-base">Define a new game listing. Configure core mechanics, descriptions, rules, and schedule initial match sessions.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <Button 
              variant="outline" 
              onClick={() => navigate('/games')} 
              className="flex-1 lg:flex-none h-12 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-700 dark:text-slate-300"
            >
              Cancel
            </Button>
            <Button className="flex-1 lg:flex-none h-12 px-8 bg-primary text-white hover:bg-primary/90 rounded-xl font-black shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px] transition-all">
              Initialize Game
            </Button>
          </div>
        </div>

        <form className="space-y-12 pb-20">
          {/* Section 1: Game Details */}
          <section className="glass-card p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 shadow-sm space-y-8 bg-white/50 dark:bg-transparent">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
              <MdInfo className="text-primary text-2xl" />
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Core Metadata</h3>
            </div>
            
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
              <div className="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] items-center flex gap-1 font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Title <span className="text-rose-500">*</span></label>
                  <Input required className="h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold uppercase" placeholder="e.g. Cyber Strikers" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] items-center flex gap-1 font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Identifier Slug <span className="text-rose-500">*</span></label>
                  <Input required className="h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold lowercase" placeholder="cyber-strikers-pro" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] items-center flex gap-1 font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Category <span className="text-rose-500">*</span></label>
                  <select title="Category Select" required className="flex h-14 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none uppercase tracking-widest text-slate-900 dark:text-white">
                    <option>Battle Royale</option>
                    <option>MOBA</option>
                    <option>Strategy</option>
                    <option>Racing</option>
                    <option>Retro</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] items-center flex gap-1 font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Difficulty</label>
                  <select title="Difficulty Select" className="flex h-14 w-full rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 px-4 py-2 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-primary/20 appearance-none uppercase tracking-widest text-slate-900 dark:text-white">
                    <option>Beginner</option>
                    <option>Intermediate</option>
                    <option>Advanced</option>
                    <option>Pro Circuit</option>
                  </select>
                </div>
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[10px] items-center flex gap-1 font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Tags / Features (Comma separated)</label>
                  <Input className="h-14 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-2xl font-bold uppercase tracking-widest text-xs" placeholder="Multiplayer, Cross-Platform, PvP" />
                </div>
              </div>

              {/* Side Column: Media & Toggle */}
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Cover Asset (Hero Banner)</label>
                  <div className="aspect-21/9 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden group">
                    <div className="text-center group-hover:scale-110 transition-transform duration-500">
                      <MdImage className="text-4xl text-slate-400 dark:text-slate-500 mb-2 mx-auto group-hover:text-primary transition-colors" />
                      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:text-primary uppercase tracking-widest px-4 transition-colors">Upload 1920x1080</p>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">Thumbnail (Square)</label>
                  <div className="aspect-square w-1/2 rounded-2xl bg-slate-50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/10 flex flex-col items-center justify-center cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all overflow-hidden group">
                    <div className="text-center group-hover:scale-110 transition-transform duration-500">
                      <MdImage className="text-4xl text-slate-400 dark:text-slate-500 mb-2 mx-auto group-hover:text-primary transition-colors" />
                      <p className="text-[10px] font-black text-slate-500 dark:text-slate-400 group-hover:text-primary uppercase tracking-widest px-4 transition-colors">Upload 512x512</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center justify-between p-6 bg-slate-50 dark:bg-white/5 rounded-2xl border border-slate-200 dark:border-white/10">
                  <div className="flex flex-col">
                    <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Active Status</span>
                    <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 uppercase mt-1">Visible to Users</span>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setIsActive(!isActive)}
                    className={`relative inline-flex h-8 w-14 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${isActive ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-700'}`}
                  >
                    <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${isActive ? 'translate-x-6' : 'translate-x-0'}`}></span>
                  </button>
                </div>
              </div>
            </div>

            {/* Description & Rules Segment */}
            <div className="border-t border-slate-200 dark:border-white/10 pt-8 mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-2">
                <label className="text-[10px] items-center flex gap-2 font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                  <MdArticle className="text-lg text-primary" /> About / Description
                </label>
                <textarea 
                  required 
                  rows={6} 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-slate-900 dark:text-white" 
                  placeholder="Describe the game's premise, mechanics, and objectives..." 
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] items-center flex gap-2 font-black uppercase tracking-widest text-slate-500 dark:text-slate-400 pl-1">
                  <MdInfo className="text-lg text-rose-500" /> Rules & Conduct
                </label>
                <textarea 
                  required 
                  rows={6} 
                  className="w-full bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-4 font-bold text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none text-slate-900 dark:text-white" 
                  placeholder="Win conditions, disqualification criteria, match duration..." 
                />
              </div>
            </div>
          </section>

          {/* Section 2: Sessions Setup */}
          <section className="space-y-6">
            <div className="flex items-center justify-between mb-4 px-2">
              <div className="flex items-center gap-3">
                <MdCalendarMonth className="text-primary text-2xl" />
                <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Match Sessions</h3>
              </div>
              <Button type="button" variant="outline" className="h-10 px-6 border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-900 dark:text-white rounded-xl font-black uppercase tracking-widest text-[10px] transition-all">
                <MdAdd className="text-lg mr-1.5" /> Add Session
              </Button>
            </div>

            {/* Session Block 1 */}
            <div className="glass-card p-8 rounded-[2rem] border border-slate-200 dark:border-white/10 relative shadow-sm group bg-white/50 dark:bg-transparent">
              <button className="absolute -top-3 -right-3 h-10 w-10 bg-rose-600 text-white rounded-xl flex items-center justify-center shadow-lg hover:bg-rose-700 active:scale-95 transition-all z-10" type="button">
                <MdClose className="text-lg" />
              </button>
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 xl:gap-8 items-end">
                <div className="md:col-span-4 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Session Name</label>
                  <Input className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-bold uppercase tracking-tight" placeholder="Pro Circuit Finals" />
                </div>
                <div className="col-span-12 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Entry Fee (₦)</label>
                  <Input type="number" className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-black text-emerald-600 dark:text-emerald-400" defaultValue={100} />
                </div>
                <div className="col-span-12 md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Platform Tax (%)</label>
                  <Input type="number" className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-black text-primary" defaultValue={5} />
                </div>
                <div className="md:col-span-12 lg:col-span-4 grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Player Limit</label>
                    <Input type="number" className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-black" defaultValue={64} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">Start Time</label>
                    <Input type="datetime-local" defaultValue={new Date().toISOString().slice(0, 16)} className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-bold text-[10px] uppercase" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">End Time</label>
                    <Input type="datetime-local" className="h-12 bg-slate-50 dark:bg-white/5 border-slate-200 dark:border-white/10 rounded-xl font-bold text-[10px] uppercase" />
                  </div>
                </div>
              </div>
              {/* Prize Logic Footer */}
              <div className="mt-8 pt-6 border-t border-slate-200 dark:border-white/10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
                <div className="flex flex-wrap gap-8 xl:gap-12 w-full xl:w-auto">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-1.5 underline underline-offset-4 decoration-emerald-500/30">Total Gross</span>
                    <span className="text-xl font-black text-slate-900 dark:text-white tracking-tighter drop-shadow-sm">₦6,400</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-1.5 underline underline-offset-4 decoration-primary/30">Platform Fee (5%)</span>
                    <span className="text-xl font-black text-primary tracking-tighter drop-shadow-sm">₦320</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-1.5 underline underline-offset-4 decoration-emerald-500/30">Prize Pool (Net)</span>
                    <span className="text-xl font-black text-emerald-500 tracking-tighter drop-shadow-sm">₦6,080</span>
                  </div>
                </div>
                <p className="text-[9px] font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest w-full xl:w-auto xl:text-right mt-2 xl:mt-0 opacity-70">
                  Estimates assume 100% capacity (64 players).
                </p>
              </div>
            </div>
          </section>

          {/* Final Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-10 pt-12">
            <div className="flex flex-col w-full lg:w-auto">
              <span className="text-[10px] font-black uppercase text-slate-500 dark:text-slate-400 tracking-widest mb-1">Expected Max Profit</span>
              <span className="text-2xl lg:text-3xl font-black text-emerald-500 tracking-tighter uppercase drop-shadow-sm">₦320 Estimated</span>
            </div>
            <div className="flex flex-wrap gap-4 w-full lg:w-auto">
              <Button type="button" variant="outline" className="flex-1 lg:flex-none h-14 px-8 rounded-xl font-black uppercase tracking-widest text-[10px] border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 text-slate-900 dark:text-white transition-all shadow-sm">
                Save Draft
              </Button>
              <Button onClick={() => navigate('/games')} className="flex-1 lg:flex-none h-14 px-10 bg-linear-to-r from-primary via-emerald-500 to-sky-500 text-white hover:from-primary hover:to-emerald-400 rounded-xl font-black shadow-xl shadow-primary/30 uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 group">
                <MdRocketLaunch className="text-lg animate-pulse" />
                Publish Game
              </Button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateGame;
