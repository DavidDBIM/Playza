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
import { gameSessionService } from '../services/gamesession.service';
import { toast } from 'sonner';

interface SessionInput {
  title: string;
  type: string;
  entryFee: number;
  maxPlayers: number;
  winnersCount: number;
  startTime: string;
  endTime: string;
}

interface GameFormData {
  title: string;
  slug: string;
  category: string;
  difficulty: string;
  mode: string;
  thumbnailUrl: string;
  iframeUrl: string;
  durationInSeconds: number;
  platformFeePercentage: number;
  controls: string;
  rules: string;
  scoring: string;
}


const CreateGame: React.FC = () => {
  const navigate = useNavigate();
  const [isActive, setIsActive] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState<GameFormData>({

    title: '',
    slug: '',
    category: 'Puzzle',
    difficulty: 'Intermediate',
    mode: 'Tournament',
    durationInSeconds: 300,
    platformFeePercentage: 10,
    iframeUrl: '',
    thumbnailUrl: '',
    controls: '',
    rules: '',
    scoring: ''
  });

  const [sessions, setSessions] = useState<SessionInput[]>([

    {
      title: 'Elite Tournament #1',
      type: 'tournament',
      entryFee: 1500,
      maxPlayers: 200,
      winnersCount: 20,
      startTime: '2026-04-16T13:00',
      endTime: '2026-04-16T16:00'
    }
  ]);

  const categories = [
    { label: "Competitive", items: ["Battle Royale", "MOBA", "Strategy", "Shooter (FPS/TPS)", "Fighting"] },
    { label: "Racing & Sports", items: ["Racing", "Sports", "Simulation"] },
    { label: "Casual & Arcade", items: ["Arcade", "Retro", "Puzzle", "Trivia", "Card Games"] },
    { label: "Adventure", items: ["Adventure", "Role Playing (RPG)"] }
  ];

  const difficulties = ["Beginner", "Intermediate", "Advanced", "Pro Circuit", "Legendary"];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSessionChange = (index: number, field: keyof SessionInput, value: string | number) => {

    const newSessions = [...sessions];
    newSessions[index] = { ...newSessions[index], [field]: value };
    setSessions(newSessions);
  };

  const addSession = () => {
    setSessions([
      ...sessions,
      {
        title: `Tournament #${sessions.length + 1}`,
        type: 'tournament',
        entryFee: 1000,
        maxPlayers: 100,
        winnersCount: 10,
        startTime: '',
        endTime: ''
      }
    ]);
  };

  const removeSession = (index: number) => {
    if (sessions.length > 1) {
      setSessions(sessions.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload = {
        gameData: {
          ...formData,
          isActive,
          howToPlay: {
            controls: formData.controls,
            rules: formData.rules,
            scoring: formData.scoring
          }
        },
        sessions: sessions.map(s => ({
          ...s,
          startTime: new Date(s.startTime).toISOString(),
          endTime: new Date(s.endTime).toISOString()
        }))
      };

      const response = await gameSessionService.createGame(payload.gameData, payload.sessions);
      
      if (response.success) {
        toast.success('Game and sessions published successfully!');
        navigate('/games');
      } else {
        toast.error(response.data.message || 'Failed to publish game');
      }
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      console.error('Error publishing game:', error);
      toast.error(error.response?.data?.message || 'Server error occurred');

    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to calculate prize pool
  const calculatePool = (entryFee: number, maxPlayers: number) => {
    const gross = entryFee * maxPlayers;
    const fee = gross * (formData.platformFeePercentage / 100);
    const net = gross - fee;
    return { gross, fee, net };
  };

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
            <button 
              form="create-game-form"
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl text-sm font-bold shadow-md shadow-primary/20 transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Publishing...' : 'Initialize Game'}
            </button>
          </div>
        </div>

        <form id="create-game-form" onSubmit={handleSubmit} className="space-y-8 pb-20">
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
                  <Input 
                    name="title" 
                    required 
                    value={formData.title} 
                    onChange={handleInputChange} 
                    className="h-11 bg-muted border-border rounded-xl font-bold font-heading" 
                    placeholder="e.g. Cyber Strikers" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Identifier Slug <span className="text-rose-500">*</span></label>
                  <Input 
                    name="slug" 
                    required 
                    value={formData.slug} 
                    onChange={handleInputChange} 
                    className="h-11 bg-muted border-border rounded-xl font-bold lowercase" 
                    placeholder="velocity-gl" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Category <span className="text-rose-500">*</span></label>
                  <Select value={formData.category} onValueChange={(v) => handleSelectChange('category', v)}>
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
                  <Select value={formData.difficulty} onValueChange={(v) => handleSelectChange('difficulty', v)}>
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
                  <Select value={formData.mode} onValueChange={(v) => handleSelectChange('mode', v)}>
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
                  <Input 
                    name="durationInSeconds" 
                    type="number" 
                    required 
                    value={formData.durationInSeconds} 
                    onChange={handleInputChange} 
                    className="h-11 bg-muted border-border rounded-xl font-bold font-number" 
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Platform Fee (%) <span className="text-rose-500">*</span></label>
                  <Input 
                    name="platformFeePercentage" 
                    type="number" 
                    required 
                    value={formData.platformFeePercentage} 
                    onChange={handleInputChange} 
                    className="h-11 bg-muted border-border rounded-xl font-bold font-number" 
                  />
                </div>
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Iframe URL <span className="text-rose-500">*</span></label>
                  <Input 
                    name="iframeUrl" 
                    required 
                    value={formData.iframeUrl} 
                    onChange={handleInputChange} 
                    className="h-11 bg-muted border-border rounded-xl font-bold text-xs" 
                    placeholder="https://cdn.playza.com/gameLib/VelocityGL/index.html" 
                  />
                </div>
              </div>

              {/* Side Column: Media & Toggle */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">Thumbnail URL</label>
                  <Input 
                    name="thumbnailUrl" 
                    value={formData.thumbnailUrl} 
                    onChange={handleInputChange} 
                    className="h-11 bg-muted border-border rounded-xl" 
                    placeholder="https://cdn.playza.com/games/velocity-gl.png" 
                  />
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
              {(
                [
                  { name: "controls", label: "Controls", placeholder: "Use WASD or Arrow Keys..." },
                  { name: "rules", label: "Rules", placeholder: "Win conditions, disqualifications..." },
                  { name: "scoring", label: "Scoring", placeholder: "How points are awarded..." },
                ] as const
              ).map((item, i) => (
                <div key={i} className="space-y-1.5">
                  <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground ml-1">{item.label}</label>
                  <textarea 
                    name={item.name}
                    required 
                    rows={3} 
                    value={formData[item.name as keyof GameFormData] as string}
                    onChange={handleInputChange}
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
              <button 
                onClick={addSession}
                type="button" 
                className="px-4 py-1.5 bg-muted hover:bg-muted/80 text-foreground rounded-xl text-xs font-bold transition-all border border-border"
              >
                <MdAdd className="text-lg mr-1 inline" /> Add Session
              </button>
            </div>

            {sessions.map((session, idx) => {
              const pool = calculatePool(session.entryFee, session.maxPlayers);
              return (
                <div key={idx} className="bg-card border border-border rounded-2xl p-6 shadow-sm relative">
                  <button 
                    onClick={() => removeSession(idx)}
                    className="absolute -top-2 -right-2 h-8 w-8 bg-rose-500 text-white rounded-lg flex items-center justify-center shadow-md hover:bg-rose-600 transition-all z-10" 
                    type="button"
                  >
                    <MdClose className="text-lg" />
                  </button>
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-end">
                    <div className="md:col-span-4 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Session Title</label>
                      <Input 
                        className="h-11 bg-muted border-border rounded-xl font-bold uppercase tracking-tight" 
                        placeholder="Elite Tournament #1" 
                        value={session.title}
                        onChange={(e) => handleSessionChange(idx, 'title', e.target.value)}
                      />
                    </div>
                    <div className="col-span-12 md:col-span-2 space-y-1.5">
                      <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Type</label>
                      <Select value={session.type} onValueChange={(v) => handleSessionChange(idx, 'type', v)}>
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
                      <Input 
                        type="number" 
                        className="h-11 bg-muted border-border rounded-xl font-black text-emerald-600 font-number" 
                        value={session.entryFee}
                        onChange={(e) => handleSessionChange(idx, 'entryFee', Number(e.target.value))}
                      />
                    </div>
                    <div className="md:col-span-12 lg:col-span-4 grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Max Players</label>
                        <Input 
                          type="number" 
                          className="h-11 bg-muted border-border rounded-xl font-black font-number" 
                          value={session.maxPlayers}
                          onChange={(e) => handleSessionChange(idx, 'maxPlayers', Number(e.target.value))}
                        />
                      </div>
                       <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Winners</label>
                        <Input 
                          type="number" 
                          className="h-11 bg-muted border-border rounded-xl font-black font-number" 
                          value={session.winnersCount}
                          onChange={(e) => handleSessionChange(idx, 'winnersCount', Number(e.target.value))}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">Start</label>
                        <Input 
                          type="datetime-local" 
                          className="h-11 bg-muted border-border rounded-xl font-bold text-[10px] uppercase" 
                          value={session.startTime}
                          onChange={(e) => handleSessionChange(idx, 'startTime', e.target.value)}
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-[10px] font-black uppercase tracking-wider text-muted-foreground">End</label>
                        <Input 
                          type="datetime-local" 
                          className="h-11 bg-muted border-border rounded-xl font-bold text-[10px] uppercase" 
                          value={session.endTime}
                          onChange={(e) => handleSessionChange(idx, 'endTime', e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                  {/* Prize Logic Footer */}
                  <div className="mt-6 pt-4 border-t border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex flex-wrap gap-6">
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">Gross Expected</span>
                        <span className="text-lg font-black text-foreground font-number tracking-tight">₦{pool.gross.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">Platform Fee ({formData.platformFeePercentage}%)</span>
                        <span className="text-lg font-black text-primary font-number tracking-tight">₦{pool.fee.toLocaleString()}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">Prize Pool (Net)</span>
                        <span className="text-lg font-black text-emerald-500 font-number tracking-tight">₦{pool.net.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* Final Actions */}
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6 pt-6 border-t border-border">
            <div className="flex flex-col w-full lg:w-auto">
              <span className="text-[10px] font-black uppercase text-muted-foreground tracking-wider mb-0.5">Global Profit Estimate</span>
              <span className="text-2xl font-black text-emerald-500 tracking-tight uppercase font-number">
                ₦{sessions.reduce((acc, s) => acc + calculatePool(s.entryFee, s.maxPlayers).fee, 0).toLocaleString()} Total Fee
              </span>
            </div>
            <div className="flex items-center gap-3 w-full lg:w-auto">
              <button type="button" className="flex-1 lg:flex-none px-8 py-3 rounded-xl font-black uppercase tracking-widest text-[10px] border border-border bg-card text-foreground hover:bg-muted transition-all">
                Save Draft
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="flex-1 lg:flex-none px-10 py-3 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-black shadow-lg shadow-primary/20 uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-95 group disabled:opacity-50"
              >
                <MdRocketLaunch className="text-lg" />
                {isSubmitting ? 'Publishing...' : 'Publish Game'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
};

export default CreateGame;
