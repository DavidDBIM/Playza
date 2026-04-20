import React, { useState } from 'react';
import { 
  MdArrowBack, 
  MdSend, 
  MdSave, 
  MdPhoneIphone, 
  MdTabletMac, 
  MdCheckCircle, 
  MdInfo, 
  MdStars, 
  MdMonetizationOn, 
  MdPersonOff, 
  MdLeaderboard,
  MdBolt,
  MdCalendarToday,
  MdExpandMore
} from 'react-icons/md';

const SendNoti: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [priority, setPriority] = useState('High');

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button 
            onClick={onBack}
            className="w-10 h-10 rounded-full flex items-center justify-center bg-muted/50 dark:bg-muted text-primary hover:bg-primary/10 transition-all group active:scale-95 shadow-lg border border-border dark:border-white/5"
          >
            <MdArrowBack className="text-xl group-hover:-translate-x-1 transition-transform" />
          </button>
          <div>
            <h2 className="text-2xl font-black text-foreground tracking-tighter">Send Notification</h2>
            <p className="text-muted-foreground mt-1 font-bold text-xs uppercase tracking-widest">Compose and target messages for your global player base</p>
          </div>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Left: Form */}
        <div className="col-span-12 lg:col-span-7 space-y-5">
          {/* Basic Info & Type */}
          <div className="glass-card rounded-xl p-5 space-y-5 border border-border dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl">
            <div className="grid grid-cols-2 gap-5">
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Notification Type</label>
                <div className="relative group">
                  <select 
                    title="Notification Type"
                    className="w-full bg-muted/50 dark:bg-background border border-border dark:border-white/5 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-primary transition-all appearance-none font-black text-xs uppercase tracking-widest cursor-pointer shadow-inner"
                  >
                    <option>System Update</option>
                    <option>Transactional</option>
                    <option>Promotional Offer</option>
                    <option>Maintenance Alert</option>
                  </select>
                  <MdExpandMore className="absolute right-5 top-4 text-muted-foreground text-xl pointer-events-none" />
                </div>
              </div>
              <div className="col-span-1">
                <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Priority Level</label>
                <div className="flex gap-3">
                  <button 
                    onClick={() => setPriority('Normal')}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest shadow-lg ${priority === 'Normal' ? 'bg-foreground dark:bg-primary text-white dark:text-black border-transparent' : 'bg-muted/30 dark:bg-white/5 text-muted-foreground/70 border-border dark:border-white/5 hover:border-primary/50'}`}
                  >
                    Normal
                  </button>
                  <button 
                    onClick={() => setPriority('High')}
                    className={`flex-1 py-3 px-4 rounded-xl border transition-all font-black text-[10px] uppercase tracking-widest shadow-lg ${priority === 'High' ? 'bg-foreground dark:bg-primary text-white dark:text-black border-transparent shadow-primary/20' : 'bg-muted/30 dark:bg-white/5 text-muted-foreground/70 border-border dark:border-white/5 hover:border-primary/50'}`}
                  >
                    High Priority
                  </button>
                </div>
              </div>
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Notification Title</label>
              <input 
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-muted/50 dark:bg-background border border-border dark:border-white/5 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-primary placeholder:text-muted-foreground/40 dark:placeholder-white/20 transition-all font-black text-base tracking-tight shadow-inner" 
                placeholder="e.g. Rare Chest Unlocked!" 
              />
            </div>
            
            <div>
              <label className="block text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3 ml-2">Message Content</label>
              <textarea 
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full bg-muted/50 dark:bg-background border border-border dark:border-white/5 text-foreground rounded-xl px-4 py-3 focus:outline-none focus:border-primary placeholder:text-muted-foreground/40 dark:placeholder-white/20 transition-all resize-none min-h-32 font-bold text-sm leading-relaxed shadow-inner" 
                placeholder="Enter the message detail here..."
              />
            </div>
          </div>

          {/* Audience Targeting */}
          <div className="glass-card rounded-xl p-5 border border-border dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl">
            <h3 className="text-foreground font-black mb-5 uppercase tracking-widest text-xs">Audience Targeting</h3>
            <div className="grid grid-cols-2 gap-4">
              {[
                { label: 'Active Players', sub: '12,450 Users', icon: MdStars, color: 'text-emerald-500' },
                { label: 'High Spenders', sub: '1,204 Users', icon: MdMonetizationOn, color: 'text-amber-500' },
                { label: 'Inactive (30d)', sub: '5,670 Users', icon: MdPersonOff, color: 'text-muted-foreground/70' },
                { label: 'Top Ranked', sub: '500 Users', icon: MdLeaderboard, color: 'text-indigo-500' },
              ].map((seg, i) => (
                <div key={i} className="p-4 rounded-xl border border-border dark:border-white/5 bg-muted/30 dark:bg-white/5 flex items-center justify-between cursor-pointer hover:border-primary/50 group transition-all shadow-md">
                  <div className="flex items-center gap-4">
                    <seg.icon className={`${seg.color} text-2xl group-hover:scale-110 transition-transform`} />
                    <div>
                      <span className="font-black text-foreground text-xs uppercase tracking-widest">{seg.label}</span>
                      <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mt-0.5">{seg.sub}</p>
                    </div>
                  </div>
                  <div className="w-4 h-4 rounded-full border-2 border-border dark:border-white/20 group-hover:border-primary transition-colors"></div>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Timing */}
          <div className="glass-card rounded-[2rem] p-8 border border-border dark:border-white/5 bg-white/30 dark:bg-white/5 shadow-xl">
            <h3 className="text-foreground font-black  mb-8 uppercase tracking-widest text-xs">Delivery Schedule</h3>
            <div className="grid grid-cols-2 gap-4">
              <label className="flex items-center gap-4 p-5 rounded-2xl border-2 border-primary bg-primary/5 cursor-pointer shadow-lg shadow-primary/5 group">
                <div className="w-5 h-5 rounded-full border-4 border-primary bg-white"></div>
                <div className="flex-1">
                  <p className="font-black text-foreground text-xs uppercase tracking-widest">Send Now</p>
                  <p className="text-[9px] font-bold text-muted-foreground uppercase tracking-widest mt-1">Immediate delivery</p>
                </div>
                <MdBolt className="text-primary font-black text-xs uppercase tracking-widest group-hover:animate-bounce" />
              </label>
              <label className="flex items-center gap-4 p-5 rounded-2xl border-2 border-border dark:border-white/5 bg-muted/30 dark:bg-white/5 cursor-pointer opacity-60 hover:opacity-100 transition-all group">
                <div className="w-5 h-5 rounded-full border-2 border-muted-foreground/40 dark:border-white/10 bg-white dark:bg-muted"></div>
                <div className="flex-1">
                  <p className="font-black text-muted-foreground/70 dark:text-white/60 text-xs uppercase tracking-widest">Schedule</p>
                  <p className="text-[9px] font-bold text-muted-foreground/70 uppercase tracking-widest mt-1">Automated delivery</p>
                </div>
                <MdCalendarToday className="text-muted-foreground text-xl" />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4">
            <button className="flex-1 bg-primary text-white dark:text-black font-black uppercase tracking-widest py-5 rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all shadow-xl shadow-primary/20 flex items-center justify-center gap-3 text-xs">
              <MdSend className="text-lg" />
              Send Notification
            </button>
            <button className="flex-1 bg-muted/30 dark:bg-white/5 border border-border dark:border-white/5 text-foreground font-black uppercase tracking-widest py-5 rounded-2xl hover:bg-muted dark:hover:bg-white/10 active:scale-[0.98] transition-all flex items-center justify-center gap-3 text-xs">
              <MdSave className="text-lg" />
              Save Template
            </button>
          </div>
        </div>

        {/* Right: Preview */}
        <div className="col-span-12 lg:col-span-5 hidden lg:block">
          <div className="sticky top-28 space-y-8 animate-in slide-in-from-right-10 duration-700">
            <div className="glass-card rounded-[2.5rem] p-10 flex flex-col items-center border border-border dark:border-white/5 bg-white/50 dark:bg-white/5 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 blur-3xl -z-10 rounded-full"></div>
              
              <div className="mb-8 flex items-center justify-between w-full">
                <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Live Preview</h3>
                <div className="flex gap-3">
                  <MdPhoneIphone className="text-primary text-xl" />
                  <MdTabletMac className="text-muted-foreground/50 dark:text-white/20 text-xl cursor-not-allowed" />
                </div>
              </div>

              {/* Phone Frame */}
              <div className="relative w-70 h-145 bg-muted/50 dark:bg-muted rounded-[3rem] border-10 border-foreground dark:border-background shadow-2xl overflow-hidden ring-8 ring-border/30 dark:ring-white/5">
                <div className="absolute inset-0 bg-linear-to-br from-indigo-500/20 via-purple-500/20 to-pink-500/20"></div>
                
                {/* Screen Content */}
                <div className="relative z-10 px-6 pt-12">
                  <div className="text-center mb-36 mt-10">
                    <p className="text-5xl font-black font-headline text-foreground/90 tracking-tighter">09:41</p>
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mt-1">Monday, October 24</p>
                  </div>

                  {/* Notification Card */}
                  <div className="bg-white/90 dark:bg-background/95 backdrop-blur-2xl p-4 rounded-2xl shadow-2xl border border-border transform transition-all duration-300 scale-100 animate-pulse-subtle">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="w-5 h-5 bg-primary rounded flex items-center justify-center text-[10px] text-white font-black">P</div>
                      <span className="text-[10px] font-black text-foreground/70 uppercase tracking-widest">Playza</span>
                      <span className="text-[10px] font-bold text-muted-foreground/70 ml-auto lowercase">now</span>
                    </div>
                    <h4 className="text-sm font-black text-foreground mb-1 line-clamp-1">{title || 'Your Title'}</h4>
                    <p className="text-[10px] leading-relaxed text-muted-foreground font-bold line-clamp-3">
                      {content || 'Enter message content to see live preview on this device...'}
                    </p>
                  </div>
                </div>

                {/* Notch */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-background dark:bg-background rounded-b-2xl z-20"></div>
                {/* Home Bar */}
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-foreground/10 dark:bg-white/10 rounded-full z-20"></div>
              </div>

              <div className="mt-8 w-full space-y-4">
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <MdCheckCircle className="text-emerald-500 text-lg" />
                  <span>Optimized for iOS and Android</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                  <MdInfo className="text-primary text-lg" />
                  <span>Emojis supported in text body</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SendNoti;
