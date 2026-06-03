import React, { useState, useRef } from 'react';
import {
  MdImage, MdAdd, MdEdit, MdDelete, MdDragIndicator,
  MdVisibility, MdVisibilityOff, MdClose, MdSave, MdUpload,
  MdCheckCircle, MdArrowUpward, MdArrowDownward,
} from 'react-icons/md';
import {
  useBannerSlides,
  useCreateBannerSlide,
  useUpdateBannerSlide,
  useDeleteBannerSlide,
  useUploadBannerImage,
} from '../hooks/use-banners';
import type { BannerSlide, BannerSlideInput } from '../services/banner.service';

const ACCENT_OPTIONS = [
  { label: 'Amber', color: 'bg-amber-500', value: 'bg-amber-500' },
  { label: 'Blue', color: 'bg-blue-500', value: 'bg-blue-500' },
  { label: 'Emerald', color: 'bg-emerald-500', value: 'bg-emerald-500' },
  { label: 'Violet', color: 'bg-violet-500', value: 'bg-violet-500' },
  { label: 'Orange', color: 'bg-orange-500', value: 'bg-orange-500' },
  { label: 'Red', color: 'bg-red-500', value: 'bg-red-500' },
  { label: 'Pink', color: 'bg-pink-500', value: 'bg-pink-500' },
  { label: 'Cyan', color: 'bg-cyan-500', value: 'bg-cyan-500' },
];

const GRADIENT_OPTIONS = [
  { label: 'Amber → Yellow', value: 'from-amber-500 to-yellow-900' },
  { label: 'Blue → Indigo', value: 'from-blue-600 to-indigo-900' },
  { label: 'Emerald → Teal', value: 'from-emerald-600 to-teal-900' },
  { label: 'Violet → Purple', value: 'from-violet-600 to-purple-900' },
  { label: 'Orange → Red', value: 'from-orange-600 to-red-900' },
  { label: 'Pink → Rose', value: 'from-pink-600 to-rose-900' },
  { label: 'Cyan → Blue', value: 'from-cyan-600 to-blue-900' },
];

const EMPTY_FORM: BannerSlideInput = {
  tag: '',
  title: '',
  subtitle: '',
  description: '',
  button_text: 'Play Now',
  button_link: '/games',
  image_url: null,
  color: 'from-blue-600 to-indigo-900',
  accent: 'bg-blue-500',
  is_active: true,
  sort_order: 0,
};

const SlideFormModal: React.FC<{
  slide?: BannerSlide | null;
  onClose: () => void;
  onSave: (data: BannerSlideInput) => void;
  isSaving: boolean;
}> = ({ slide, onClose, onSave, isSaving }) => {
  const [form, setForm] = useState<BannerSlideInput>(
    slide
      ? {
          tag: slide.tag,
          title: slide.title,
          subtitle: slide.subtitle,
          description: slide.description,
          button_text: slide.button_text,
          button_link: slide.button_link,
          image_url: slide.image_url,
          color: slide.color,
          accent: slide.accent,
          is_active: slide.is_active,
          sort_order: slide.sort_order,
        }
      : { ...EMPTY_FORM },
  );

  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImage, isPending: uploading } = useUploadBannerImage();
  const [uploadError, setUploadError] = useState('');

  const set = (key: keyof BannerSlideInput, value: string | boolean | null) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const url = await uploadImage(file);
      set('image_url', url);
    } catch {
      setUploadError('Upload failed. Try a URL instead.');
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative bg-white dark:bg-slate-900 w-full sm:max-w-xl flex flex-col rounded-t-3xl sm:rounded-2xl border-t sm:border border-slate-200 dark:border-slate-700 shadow-2xl"
        style={{ maxHeight: '92dvh' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MdImage className="text-primary text-xl" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                {slide ? 'Edit Slide' : 'New Slide'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Hero banner configuration</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white"
          >
            <MdClose />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
          {/* Tag + Active */}
          <div className="flex gap-3 items-center">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Tag Label</label>
              <input
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. PLATFORM"
                value={form.tag}
                onChange={(e) => set('tag', e.target.value.toUpperCase())}
              />
            </div>
            <div className="flex flex-col items-center gap-1 pt-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Active</span>
              <button
                type="button"
                onClick={() => set('is_active', !form.is_active)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.is_active ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_active ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Title */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Title</label>
            <input
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="MASTER YOUR SKILLS"
              value={form.title}
              onChange={(e) => set('title', e.target.value.toUpperCase())}
            />
          </div>

          {/* Subtitle */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Subtitle</label>
            <input
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="EARN REAL PZA REWARDS"
              value={form.subtitle}
              onChange={(e) => set('subtitle', e.target.value.toUpperCase())}
            />
          </div>

          {/* Description */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Description</label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="Short description shown on the banner"
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Button */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Button Text</label>
              <input
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="Play Now"
                value={form.button_text}
                onChange={(e) => set('button_text', e.target.value)}
              />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Button Link</label>
              <input
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="/games"
                value={form.button_link}
                onChange={(e) => set('button_link', e.target.value)}
              />
            </div>
          </div>

          {/* Image */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Banner Image
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://... or upload →"
                value={form.image_url || ''}
                onChange={(e) => set('image_url', e.target.value || null)}
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-black hover:bg-primary/20 transition-all disabled:opacity-50 shrink-0"
              >
                <MdUpload className="text-base" />
                {uploading ? 'Uploading…' : 'Upload'}
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
            </div>
            {uploadError && <p className="text-xs text-red-500 mt-1">{uploadError}</p>}
            {form.image_url && (
              <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('image_url', null)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <MdClose className="text-sm" />
                </button>
              </div>
            )}
          </div>

          {/* Gradient */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Background Gradient</label>
            <div className="flex flex-wrap gap-2">
              {GRADIENT_OPTIONS.map((g) => (
                <button
                  key={g.value}
                  type="button"
                  onClick={() => set('color', g.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all bg-linear-to-r ${g.value} text-white ${
                    form.color === g.value ? 'ring-2 ring-primary ring-offset-2' : 'opacity-70 hover:opacity-100'
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accent */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 block">Accent Color</label>
            <div className="flex flex-wrap gap-2">
              {ACCENT_OPTIONS.map((a) => (
                <button
                  key={a.value}
                  type="button"
                  onClick={() => set('accent', a.value)}
                  className={`w-8 h-8 rounded-xl ${a.color} border-2 transition-all ${
                    form.accent === a.value ? 'border-slate-900 dark:border-white scale-110' : 'border-transparent'
                  }`}
                  title={a.label}
                />
              ))}
            </div>
          </div>

          {/* Sort order */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Sort Order</label>
            <input
              type="number"
              min={0}
              className="w-24 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              value={form.sort_order}
              onChange={(e) => setForm((f) => ({ ...f, sort_order: Number(e.target.value) }))}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 px-5 pt-3 pb-5 border-t border-slate-100 dark:border-slate-800">
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 font-bold text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onSave(form)}
              disabled={isSaving || !form.title || !form.tag}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSave className="text-base" />
              {isSaving ? 'Saving…' : 'Save Slide'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BannerSlides: React.FC = () => {
  const { data: slides = [], isLoading } = useBannerSlides();
  const { mutateAsync: createSlide, isPending: creating } = useCreateBannerSlide();
  const { mutateAsync: updateSlide, isPending: updating } = useUpdateBannerSlide();
  const { mutateAsync: deleteSlide } = useDeleteBannerSlide();

  const [modal, setModal] = useState<{ open: boolean; slide?: BannerSlide | null }>({ open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const openCreate = () => setModal({ open: true, slide: null });
  const openEdit = (slide: BannerSlide) => setModal({ open: true, slide });
  const closeModal = () => setModal({ open: false });

  const handleSave = async (data: BannerSlideInput) => {
    if (modal.slide) {
      await updateSlide({ id: modal.slide.id, data });
      setSuccessId(modal.slide.id);
    } else {
      const created = await createSlide(data);
      setSuccessId(created.id);
    }
    setTimeout(() => setSuccessId(null), 2000);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this slide? This cannot be undone.')) return;
    setDeletingId(id);
    await deleteSlide(id);
    setDeletingId(null);
  };

  const toggleActive = async (slide: BannerSlide) => {
    await updateSlide({ id: slide.id, data: { is_active: !slide.is_active } });
  };

  const sortedSlides = [...slides].sort((a, b) => a.sort_order - b.sort_order);

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-md shadow-indigo-400/30">
            <MdImage className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Banner Slides</h1>
            <p className="text-xs text-muted-foreground font-medium">Manage homepage hero carousel</p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/30"
        >
          <MdAdd className="text-lg" />
          Add Slide
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Slides', value: slides.length, color: 'text-indigo-500' },
          { label: 'Active', value: slides.filter((s) => s.is_active).length, color: 'text-emerald-500' },
          { label: 'Inactive', value: slides.filter((s) => !s.is_active).length, color: 'text-slate-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Slides list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : sortedSlides.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MdImage className="text-4xl text-primary/40" />
          </div>
          <p className="text-sm font-black text-muted-foreground uppercase tracking-wide">No slides yet</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-black text-xs border border-primary/20 hover:bg-primary/20 transition-all"
          >
            <MdAdd /> Create your first slide
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedSlides.map((slide, idx) => (
            <div
              key={slide.id}
              className={`relative bg-card border rounded-2xl overflow-hidden transition-all ${
                successId === slide.id ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Drag handle + order */}
                <div className="flex flex-col items-center gap-1 shrink-0 text-slate-400">
                  <MdDragIndicator className="text-xl" />
                  <span className="text-[9px] font-black">#{idx + 1}</span>
                </div>

                {/* Image preview */}
                <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-border">
                  {slide.image_url ? (
                    <img src={slide.image_url} alt={slide.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className={`w-full h-full bg-linear-to-br ${slide.color} opacity-60 flex items-center justify-center`}>
                      <MdImage className="text-white text-xl" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className={`text-[9px] font-black px-1.5 py-0.5 rounded-md text-white ${slide.accent}`}>
                      {slide.tag}
                    </span>
                    {successId === slide.id && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500">
                        <MdCheckCircle /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="font-black text-sm text-foreground truncate">{slide.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{slide.subtitle}</p>
                  <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">→ {slide.button_link}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {/* Active toggle */}
                  <button
                    onClick={() => toggleActive(slide)}
                    title={slide.is_active ? 'Deactivate' : 'Activate'}
                    className={`p-2 rounded-xl border transition-all ${
                      slide.is_active
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {slide.is_active ? <MdVisibility /> : <MdVisibilityOff />}
                  </button>

                  {/* Edit */}
                  <button
                    onClick={() => openEdit(slide)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <MdEdit />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(slide.id)}
                    disabled={deletingId === slide.id}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-40"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>

              {/* Order arrows */}
              <div className="absolute left-3 bottom-2 flex gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => updateSlide({ id: slide.id, data: { sort_order: slide.sort_order - 1 } })}
                  className="p-0.5 text-slate-400 hover:text-primary disabled:opacity-20 transition-colors"
                  title="Move up"
                >
                  <MdArrowUpward className="text-xs" />
                </button>
                <button
                  disabled={idx === sortedSlides.length - 1}
                  onClick={() => updateSlide({ id: slide.id, data: { sort_order: slide.sort_order + 1 } })}
                  className="p-0.5 text-slate-400 hover:text-primary disabled:opacity-20 transition-colors"
                  title="Move down"
                >
                  <MdArrowDownward className="text-xs" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <SlideFormModal
          slide={modal.slide}
          onClose={closeModal}
          onSave={handleSave}
          isSaving={creating || updating}
        />
      )}
    </div>
  );
};

export default BannerSlides;
