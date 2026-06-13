import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../lib/api-client";
import { MdAdd, MdDelete, MdEdit, MdClose, MdRefresh, MdCheckCircle, MdHandshake, MdUpload } from "react-icons/md";
import { Globe } from "lucide-react";

interface Sponsor {
  id: string;
  name: string;
  logo_url: string | null;
  website_url: string | null;
  created_at: string;
}

const api = {
  list: async (): Promise<Sponsor[]> => {
    const { data } = await apiClient.get("/admin/quiz/sponsors");
    return data.data ?? [];
  },
  create: async (payload: Partial<Sponsor>) => {
    const { data } = await apiClient.post("/admin/quiz/sponsors", payload);
    return data.data;
  },
  update: async ({ id, ...payload }: Partial<Sponsor> & { id: string }) => {
    const { data } = await apiClient.patch(`/admin/quiz/sponsors/${id}`, payload);
    return data.data;
  },
  remove: async (id: string) => {
    await apiClient.delete(`/admin/quiz/sponsors/${id}`);
  },
};

const inputCls = "w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-violet-500/60 transition-all";
const labelCls = "block text-[10px] font-black text-white/40 uppercase tracking-widest mb-1.5";

function SponsorForm({
  initial,
  onSave,
  onCancel,
  saving,
  error,
}: {
  initial?: Partial<Sponsor>;
  onSave: (v: Partial<Sponsor>) => void;
  onCancel: () => void;
  saving: boolean;
  error: string;
}) {
  const [form, setForm] = useState({
    name: initial?.name ?? "",
    logo_url: initial?.logo_url ?? "",
    website_url: initial?.website_url ?? "",
  });

  return (
    <div className="space-y-4">
      {error && (
        <div className="px-4 py-3 rounded-xl text-sm font-bold" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#f87171" }}>
          {error}
        </div>
      )}

      <div>
        <label className={labelCls}>Sponsor Name *</label>
        <input type="text" placeholder="e.g. CryptoX, BetaFund" value={form.name}
          onChange={e => setForm(p => ({ ...p, name: e.target.value }))} className={inputCls} />
      </div>

      <div>
        <label className={labelCls}>Sponsor Logo</label>
        <div className="flex gap-2 mb-2">
          <input type="url" placeholder="Paste logo image URL..." value={form.logo_url}
            onChange={e => setForm(p => ({ ...p, logo_url: e.target.value }))} className={inputCls} style={{ flex: 1 }} />
          <label className="flex items-center gap-1.5 px-3 py-2 rounded-xl cursor-pointer shrink-0 text-xs font-bold text-white/60 hover:text-white transition-all" style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", whiteSpace: "nowrap" }}>
            <MdUpload className="text-sm" /> Upload
            <input type="file" accept="image/*" className="hidden" onChange={e => {
              const file = e.target.files?.[0]; if (!file) return;
              const reader = new FileReader();
              reader.onload = ev => { setForm(p => ({ ...p, logo_url: ev.target?.result as string })); };
              reader.readAsDataURL(file);
              e.target.value = "";
            }} />
          </label>
        </div>
        {form.logo_url && (
          <div className="mt-2 flex items-center gap-3 p-3 rounded-xl" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
            <img src={form.logo_url} alt="preview" className="w-12 h-12 object-contain rounded-lg" style={{ background: "rgba(255,255,255,0.06)" }}
              onError={e => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }} />
            <span className="text-xs text-white/40 font-bold">Logo preview</span>
            <button onClick={() => setForm(p => ({ ...p, logo_url: "" }))} className="ml-auto w-7 h-7 rounded-lg flex items-center justify-center transition-all" style={{ background: "rgba(239,68,68,0.12)", color: "#f87171" }}>
              <MdClose className="text-sm" />
            </button>
          </div>
        )}
      </div>

      <div>
        <label className={labelCls}>Website URL <span className="font-normal normal-case opacity-50">(optional)</span></label>
        <input type="url" placeholder="https://sponsor.com" value={form.website_url}
          onChange={e => setForm(p => ({ ...p, website_url: e.target.value }))} className={inputCls} />
      </div>

      <div className="flex gap-2 pt-1">
        <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white/50 hover:text-white transition-all"
          style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
          Cancel
        </button>
        <button onClick={() => onSave(form)} disabled={saving || !form.name}
          className="flex-1 py-2.5 rounded-xl font-black text-sm text-white disabled:opacity-40 flex items-center justify-center gap-2 transition-all hover:opacity-90"
          style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 20px rgba(124,58,237,0.3)" }}>
          {saving ? <><MdRefresh className="animate-spin" /> Saving...</> : <><MdCheckCircle /> {initial?.id ? "Save Changes" : "Add Sponsor"}</>}
        </button>
      </div>
    </div>
  );
}

const Sponsors: React.FC = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editSponsor, setEditSponsor] = useState<Sponsor | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<Sponsor | null>(null);
  const [formError, setFormError] = useState("");
  const [toast, setToast] = useState<string | null>(null);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3500); };

  const { data: sponsors = [], isLoading, refetch } = useQuery({
    queryKey: ["admin-sponsors"],
    queryFn: api.list,
  });

  const { mutate: create, isPending: creating } = useMutation({
    mutationFn: api.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      setCreateOpen(false);
      setFormError("");
      showToast("Sponsor added!");
    },
    onError: (err: any) => setFormError(err.response?.data?.message ?? "Failed to create"),
  });

  const { mutate: update, isPending: updating } = useMutation({
    mutationFn: api.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-sponsors"] });
      setEditSponsor(null);
      setFormError("");
      showToast("Sponsor updated!");
    },
    onError: (err: any) => setFormError(err.response?.data?.message ?? "Failed to update"),
  });

  const { mutate: remove } = useMutation({
    mutationFn: api.remove,
    onSuccess: (_data, id) => {
      queryClient.setQueryData<Sponsor[]>(["admin-sponsors"], old => (old ?? []).filter(s => s.id !== id));
      setConfirmDelete(null);
      showToast("Sponsor deleted.");
    },
  });

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: "linear-gradient(160deg, #0a0618 0%, #050310 50%, #080515 100%)" }}>
      {/* Toast */}
      {toast && (
        <div className="fixed top-6 right-6 z-[100] px-5 py-3 rounded-2xl font-bold text-sm flex items-center gap-2"
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.35)", color: "#34d399", boxShadow: "0 0 30px rgba(16,185,129,0.15)" }}>
          <MdCheckCircle className="text-lg" /> {toast}
        </div>
      )}

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 30px rgba(124,58,237,0.4)" }}>
              <MdHandshake className="text-2xl text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black text-white tracking-tight">Sponsors</h1>
              <p className="text-white/35 text-sm">Manage tournament sponsors & branding</p>
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => refetch()} className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white/60 hover:text-white transition-all"
              style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>
              <MdRefresh className={`text-lg ${isLoading ? "animate-spin" : ""}`} />
            </button>
            <button onClick={() => { setCreateOpen(true); setFormError(""); }}
              className="flex items-center gap-1.5 px-5 py-2.5 rounded-xl text-sm font-black text-white hover:opacity-90 transition-all"
              style={{ background: "linear-gradient(135deg, #7c3aed, #4f46e5)", boxShadow: "0 0 24px rgba(124,58,237,0.4)" }}>
              <MdAdd className="text-lg" /> Add Sponsor
            </button>
          </div>
        </div>

        {/* How it works */}
        <div className="rounded-2xl p-4 sm:p-5" style={{ background: "rgba(124,58,237,0.08)", border: "1px solid rgba(124,58,237,0.2)" }}>
          <p className="text-[10px] font-black text-violet-400/60 uppercase tracking-widest mb-3">How Sponsored Tournaments Work</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { mode: "🤝 Collab Mode", desc: "Shows Playza logo × Sponsor logo side by side in the hero banner with both names" },
              { mode: "🖼 Banner Mode", desc: "Replaces the hero banner entirely with a custom image the sponsor provides" },
            ].map((s, i) => (
              <div key={i} className="rounded-xl p-3" style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <p className="text-sm font-black text-white mb-1">{s.mode}</p>
                <p className="text-xs text-white/40 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
          <p className="text-xs text-white/30 mt-3">After adding a sponsor here, go to <span className="text-violet-400 font-bold">Quiz Tournaments</span> → Edit a tournament → assign the sponsor and choose the display mode.</p>
        </div>

        {/* Create form */}
        {createOpen && (
          <div className="rounded-2xl overflow-hidden"
            style={{ background: "linear-gradient(135deg, rgba(30,20,60,0.98), rgba(15,10,40,0.98))", border: "1px solid rgba(139,92,246,0.3)", boxShadow: "0 0 60px rgba(139,92,246,0.15)" }}>
            <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
              <h3 className="font-black text-white flex items-center gap-2"><MdAdd className="text-violet-400" /> New Sponsor</h3>
              <button onClick={() => setCreateOpen(false)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><MdClose /></button>
            </div>
            <div className="p-5">
              <SponsorForm onSave={v => create(v)} onCancel={() => setCreateOpen(false)} saving={creating} error={formError} />
            </div>
          </div>
        )}

        {/* Sponsor list */}
        {isLoading ? (
          <div className="py-16 flex items-center justify-center text-white/30">
            <MdRefresh className="animate-spin text-2xl mr-2" /> Loading...
          </div>
        ) : sponsors.length === 0 && !createOpen ? (
          <div className="py-20 text-center rounded-2xl" style={{ border: "1px dashed rgba(255,255,255,0.08)" }}>
            <MdHandshake className="text-5xl text-white/10 mx-auto mb-4" />
            <p className="font-black text-white text-lg mb-2">No sponsors yet</p>
            <p className="text-white/30 text-sm">Add a sponsor to start hosting branded tournaments</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {sponsors.map(s => (
              editSponsor?.id === s.id ? (
                <div key={s.id} className="rounded-2xl overflow-hidden col-span-full max-w-lg"
                  style={{ background: "linear-gradient(135deg, rgba(20,15,40,0.98), rgba(10,8,25,0.98))", border: "1px solid rgba(59,130,246,0.3)" }}>
                  <div className="px-5 py-4 border-b border-white/5 flex items-center justify-between">
                    <h3 className="font-black text-white flex items-center gap-2"><MdEdit className="text-blue-400" /> Edit Sponsor</h3>
                    <button onClick={() => setEditSponsor(null)} className="w-7 h-7 rounded-lg bg-white/5 flex items-center justify-center text-white/40 hover:text-white transition-all"><MdClose /></button>
                  </div>
                  <div className="p-5">
                    <SponsorForm initial={editSponsor} onSave={v => update({ id: editSponsor.id, ...v })}
                      onCancel={() => setEditSponsor(null)} saving={updating} error={formError} />
                  </div>
                </div>
              ) : (
                <div key={s.id} className="rounded-2xl p-4 flex items-center gap-4 group transition-all"
                  style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.07)" }}>
                  {/* Logo */}
                  <div className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 overflow-hidden"
                    style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)" }}>
                    {s.logo_url
                      ? <img src={s.logo_url} alt={s.name} className="w-full h-full object-contain p-1" onError={e => { (e.currentTarget as HTMLImageElement).style.display = "none"; }} />
                      : <MdHandshake className="text-2xl text-white/20" />}
                  </div>
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-white text-sm truncate">{s.name}</p>
                    {s.website_url && (
                      <a href={s.website_url} target="_blank" rel="noopener noreferrer"
                        className="flex items-center gap-1 text-[10px] text-violet-400 hover:text-violet-300 mt-0.5 truncate" onClick={e => e.stopPropagation()}>
                        <Globe className="w-3 h-3 shrink-0" /> {s.website_url}
                      </a>
                    )}
                    <p className="text-[9px] text-white/20 mt-1 uppercase tracking-widest">
                      Added {new Date(s.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  {/* Actions */}
                  <div className="flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    <button onClick={() => { setEditSponsor(s); setFormError(""); }}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-white/50 hover:text-white"
                      style={{ background: "rgba(59,130,246,0.1)", border: "1px solid rgba(59,130,246,0.2)" }}>
                      <MdEdit className="text-sm" />
                    </button>
                    <button onClick={() => setConfirmDelete(s)}
                      className="w-8 h-8 rounded-xl flex items-center justify-center transition-all text-white/50 hover:text-white"
                      style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
                      <MdDelete className="text-sm" />
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>

      {/* Delete confirm */}
      {confirmDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(16px)" }} onClick={() => setConfirmDelete(null)}>
          <div className="w-full max-w-sm rounded-2xl p-6 text-center" style={{ background: "rgba(25,5,5,0.99)", border: "1px solid rgba(239,68,68,0.3)" }} onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>
              <MdDelete className="text-3xl text-red-400" />
            </div>
            <h3 className="font-black text-white text-lg mb-1">Delete Sponsor?</h3>
            <p className="text-sm text-white/50 mb-5">"{confirmDelete.name}" will be removed from all tournaments.</p>
            <div className="flex gap-3">
              <button onClick={() => setConfirmDelete(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm text-white/50 hover:text-white transition-all"
                style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}>Keep</button>
              <button onClick={() => remove(confirmDelete.id)} className="flex-1 py-2.5 rounded-xl font-black text-sm text-white hover:opacity-90"
                style={{ background: "linear-gradient(135deg, #dc2626, #991b1b)" }}>Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Sponsors;
