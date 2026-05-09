import React, { useState, useEffect } from 'react';
import { 
  MdChat, 
  MdSearch, 
  MdFilterList, 
  MdError, 
  MdLightbulb,
  MdGamepad,
  MdCheckCircle,
  MdVisibility,
  MdHistory,
  MdDelete
} from 'react-icons/md';
import { feedbackService, type FeedbackAdminItem } from '../services/feedback.service';
import { ConfirmDialog } from '../components/ui/confirm-dialog';

const Feedback: React.FC = () => {
  const [feedbackList, setFeedbackList] = useState<FeedbackAdminItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All Types');
  const [filterStatus, setFilterStatus] = useState('pending');
  const [totalCount, setTotalCount] = useState(0);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; id: string }>({
    isOpen: false,
    id: ''
  });

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const data = await feedbackService.getAllFeedback({
        type: filterType,
        status: filterStatus
      });
      setFeedbackList(data.feedback);
      setTotalCount(data.total);
    } catch (err: unknown) {
      console.error('Failed to fetch feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [filterType, filterStatus]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'suggest_game': return <MdGamepad className="text-indigo-500" />;
      case 'report_problem': return <MdError className="text-rose-500" />;
      case 'idea': return <MdLightbulb className="text-amber-500" />;
      default: return <MdChat className="text-sky-500" />;
    }
  };

  const getTypeName = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
  };

  const toggleResolved = async (item: FeedbackAdminItem) => {
    try {
      const updated = await feedbackService.updateFeedback(item.id, { 
        is_resolved: !item.is_resolved,
        is_read: true 
      });
      setFeedbackList(prev => prev.map(f => f.id === item.id ? { ...f, ...updated } : f));
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      await feedbackService.updateFeedback(id, { is_read: true });
      setFeedbackList(prev => prev.map(f => f.id === id ? { ...f, is_read: true } : f));
    } catch (err: unknown) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    setDeleteConfirm({ isOpen: true, id });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm.id) return;
    try {
      await feedbackService.deleteFeedback(deleteConfirm.id);
      setFeedbackList(prev => prev.filter(f => f.id !== deleteConfirm.id));
      setTotalCount(prev => prev - 1);
    } catch (err: unknown) {
      console.error(err);
    } finally {
      setDeleteConfirm({ isOpen: false, id: '' });
    }
  };

  const filteredList = feedbackList.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          item.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          item.users?.username.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  });

  return (
    <main className="p-4 md:p-8 space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="size-14 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-2xl shadow-lg shadow-indigo-500/20">
            <MdChat />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tighter uppercase italic">User Feedback</h1>
            <p className="text-xs text-muted-foreground font-medium">Monitor and manage player reports and ideas</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
            {totalCount} Total Reports
          </div>
        </div>
      </div>
 
      {/* Toolbar */}
      <div className="bg-card border border-border rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-96">
          <MdSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground text-lg" />
          <input
            type="text"
            placeholder="Search feedback..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-11 pl-12 pr-4 bg-muted/50 border border-border rounded-xl text-xs font-bold focus:ring-1 focus:ring-primary outline-none transition-all"
          />
        </div>
 
        <div className="flex items-center gap-3 w-full md:w-auto overflow-x-auto pb-2 md:pb-0">
          <div className="flex items-center gap-2 bg-muted/50 px-4 h-11 rounded-xl border border-border shrink-0">
            <MdFilterList className="text-muted-foreground" />
            <select 
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase tracking-widest outline-none cursor-pointer"
            >
              <option>All Types</option>
              <option>Suggest Game</option>
              <option>Report Problem</option>
              <option>Idea</option>
              <option>Game Feedback</option>
            </select>
          </div>
 
          <div className="flex items-center gap-2 bg-muted/50 px-4 h-11 rounded-xl border border-border shrink-0">
            <MdHistory className="text-muted-foreground" />
            <select 
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="bg-transparent border-none text-xs font-black uppercase tracking-widest outline-none cursor-pointer"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="resolved">Resolved</option>
              <option value="unread">Unread</option>
            </select>
          </div>
        </div>
      </div>
 
      {/* List */}
      <div className="grid grid-cols-1 gap-4">
        {loading ? (
          <div className="py-20 text-center">
            <div className="size-10 border-2 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Loading Feedback...</p>
          </div>
        ) : filteredList.map((item) => (
          <div 
            key={item.id}
            onMouseEnter={() => !item.is_read && markAsRead(item.id)}
            className={`group bg-card border rounded-2xl overflow-hidden transition-all duration-300 shadow-sm hover:shadow-xl ${
              item.is_resolved ? 'opacity-60 border-border' : 'border-border hover:border-primary/30'
            } ${!item.is_read ? 'border-l-4 border-l-primary' : ''}`}
          >
            <div className="p-6 flex flex-col md:flex-row gap-6 relative">
              {!item.is_read && (
                <div className="absolute top-4 right-4 size-2 bg-primary rounded-full animate-pulse" title="New Feedback" />
              )}
              
              <div className="flex flex-col items-center gap-2 shrink-0">
                <div className="size-12 rounded-xl bg-muted flex items-center justify-center text-xl">
                  {getTypeIcon(item.type)}
                </div>
                <span className="text-[9px] font-black text-muted-foreground uppercase tracking-tighter text-center max-w-[80px]">
                  {getTypeName(item.type)}
                </span>
              </div>
 
              <div className="flex-1 space-y-4">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <h3 className={`text-lg font-black italic tracking-tight uppercase ${item.is_resolved ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                      {item.title}
                    </h3>
                    {item.is_resolved && (
                      <span className="flex items-center gap-1 bg-emerald-500/10 text-emerald-500 px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest">
                        <MdCheckCircle /> Resolved
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-bold text-muted-foreground uppercase">
                      By <span className="text-primary">{item.users?.username || 'Anonymous'}</span>
                    </span>
                    <span className="text-[10px] font-bold text-muted-foreground uppercase opacity-50">
                      {new Date(item.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
 
                <div className={`p-4 rounded-xl border ${item.is_resolved ? 'bg-muted/10 border-border/30' : 'bg-muted/30 border-border/50'}`}>
                  <p className={`text-sm font-medium leading-relaxed ${item.is_resolved ? 'text-muted-foreground/60' : 'text-muted-foreground'}`}>
                    {item.message}
                  </p>
                </div>
 
                {item.game_name && (
                  <div className="flex items-center gap-2 text-[10px] font-black text-indigo-500 uppercase tracking-widest">
                    <MdGamepad />
                    Target Game: {item.game_name}
                  </div>
                )}
              </div>
 
              <div className="flex md:flex-col gap-2 justify-end shrink-0">
                <button 
                  onClick={() => toggleResolved(item)}
                  className={`h-10 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all flex items-center justify-center gap-2 ${
                    item.is_resolved 
                      ? 'bg-muted text-muted-foreground border-border hover:bg-emerald-500/10 hover:text-emerald-500' 
                      : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 hover:bg-emerald-500 hover:text-white'
                  }`}
                >
                  <MdCheckCircle size={16} />
                  {item.is_resolved ? 'Reopen' : 'Resolve'}
                </button>
                {!item.is_read && (
                  <button 
                    onClick={() => markAsRead(item.id)}
                    className="h-10 px-4 bg-primary/10 text-primary border border-primary/20 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-white transition-all flex items-center justify-center gap-2"
                  >
                    <MdVisibility size={16} />
                    Mark Read
                  </button>
                )}
                <button 
                  onClick={() => handleDelete(item.id)}
                  className="h-10 px-4 bg-muted text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest border border-border hover:bg-rose-500/10 hover:text-rose-500 hover:border-rose-500/20 transition-all flex items-center justify-center gap-2"
                >
                  <MdDelete size={16} />
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredList.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="size-20 bg-muted rounded-full flex items-center justify-center text-3xl mx-auto opacity-20">
              <MdChat />
            </div>
            <p className="text-xs font-black text-muted-foreground uppercase tracking-widest italic">
              No feedback matching your filters...
            </p>
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, id: '' })}
        onConfirm={confirmDelete}
        type="danger"
        title="Delete Feedback?"
        description="Are you sure you want to permanently delete this user feedback? This action cannot be undone."
        confirmText="Delete Now"
      />
    </main>
  );
};

export default Feedback;
