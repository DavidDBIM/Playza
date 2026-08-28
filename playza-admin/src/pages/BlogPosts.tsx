import React, { useState, useRef } from 'react';
import {
  MdArticle, MdAdd, MdEdit, MdDelete, MdVisibility, MdVisibilityOff,
  MdClose, MdSave, MdUpload, MdCheckCircle, MdRemoveRedEye,
} from 'react-icons/md';
import {
  useBlogPosts,
  useCreateBlogPost,
  useUpdateBlogPost,
  useDeleteBlogPost,
  useUploadBlogImage,
} from '../hooks/use-blog';
import type { BlogPost, BlogPostInput } from '../services/blog.service';

const EMPTY_FORM: BlogPostInput = {
  title: '',
  excerpt: '',
  content: '',
  cover_image_url: null,
  author_name: 'Playza Team',
  tags: [],
  is_published: false,
};

const PostFormModal: React.FC<{
  post?: BlogPost | null;
  onClose: () => void;
  onSave: (data: BlogPostInput) => void;
  isSaving: boolean;
}> = ({ post, onClose, onSave, isSaving }) => {
  const [form, setForm] = useState<BlogPostInput>(
    post
      ? {
          title: post.title,
          excerpt: post.excerpt,
          content: post.content,
          cover_image_url: post.cover_image_url,
          author_name: post.author_name,
          tags: post.tags,
          is_published: post.is_published,
        }
      : { ...EMPTY_FORM },
  );
  const [tagInput, setTagInput] = useState('');

  const fileRef = useRef<HTMLInputElement>(null);
  const { mutateAsync: uploadImage, isPending: uploading } = useUploadBlogImage();
  const [uploadError, setUploadError] = useState('');

  const set = <K extends keyof BlogPostInput>(key: K, value: BlogPostInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError('');
    try {
      const url = await uploadImage(file);
      set('cover_image_url', url);
    } catch {
      setUploadError('Upload failed. Try a URL instead.');
    }
  };

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !form.tags.includes(t)) set('tags', [...form.tags, t]);
    setTagInput('');
  };

  const removeTag = (t: string) => set('tags', form.tags.filter((tag) => tag !== t));

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
        <div className="flex justify-center pt-3 pb-1 sm:hidden">
          <div className="w-10 h-1 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-slate-100 dark:border-slate-800 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
              <MdArticle className="text-primary text-xl" />
            </div>
            <div>
              <h3 className="font-black text-slate-900 dark:text-white text-base leading-tight">
                {post ? 'Edit Post' : 'New Post'}
              </h3>
              <p className="text-[11px] text-slate-500 font-medium">Blog article details</p>
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
          {/* Title + Published */}
          <div className="flex gap-3 items-start">
            <div className="flex-1">
              <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Title</label>
              <input
                className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="How to climb the H2H leaderboard"
                value={form.title}
                onChange={(e) => set('title', e.target.value)}
              />
            </div>
            <div className="flex flex-col items-center gap-1 pt-5">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-500">Published</span>
              <button
                type="button"
                onClick={() => set('is_published', !form.is_published)}
                className={`w-12 h-6 rounded-full transition-all relative ${form.is_published ? 'bg-primary' : 'bg-slate-300 dark:bg-slate-600'}`}
              >
                <span className={`absolute top-1 w-4 h-4 bg-white rounded-full shadow transition-all ${form.is_published ? 'left-7' : 'left-1'}`} />
              </button>
            </div>
          </div>

          {/* Excerpt */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Excerpt <span className="normal-case text-slate-400 font-medium">(shown in the homepage marquee card)</span>
            </label>
            <textarea
              rows={2}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-none"
              placeholder="One or two sentences that hook the reader"
              value={form.excerpt}
              onChange={(e) => set('excerpt', e.target.value)}
            />
          </div>

          {/* Content */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Content <span className="normal-case text-slate-400 font-medium">(full article — plain text or markdown-ish paragraphs)</span>
            </label>
            <textarea
              rows={10}
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50 resize-y font-mono"
              placeholder="Write the full post here. Separate paragraphs with a blank line."
              value={form.content}
              onChange={(e) => set('content', e.target.value)}
            />
          </div>

          {/* Author */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Author Name</label>
            <input
              className="w-full px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
              placeholder="Playza Team"
              value={form.author_name}
              onChange={(e) => set('author_name', e.target.value)}
            />
          </div>

          {/* Cover image */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">
              Cover Image
            </label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="https://... or upload →"
                value={form.cover_image_url || ''}
                onChange={(e) => set('cover_image_url', e.target.value || null)}
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
            {form.cover_image_url && (
              <div className="mt-2 relative w-full h-28 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800">
                <img src={form.cover_image_url} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => set('cover_image_url', null)}
                  className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors"
                >
                  <MdClose className="text-sm" />
                </button>
              </div>
            )}
          </div>

          {/* Tags */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1 block">Tags</label>
            <div className="flex gap-2">
              <input
                className="flex-1 px-3 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                placeholder="e.g. Tips"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTag(); } }}
              />
              <button
                type="button"
                onClick={addTag}
                className="px-3 py-2 rounded-xl bg-primary/10 border border-primary/30 text-primary text-xs font-black hover:bg-primary/20 transition-all shrink-0"
              >
                Add
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mt-2">
                {form.tags.map((t) => (
                  <span
                    key={t}
                    className="flex items-center gap-1 px-2 py-1 rounded-lg bg-primary/10 text-primary text-[11px] font-bold"
                  >
                    {t}
                    <button type="button" onClick={() => removeTag(t)} className="hover:text-red-500">
                      <MdClose className="text-xs" />
                    </button>
                  </span>
                ))}
              </div>
            )}
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
              disabled={isSaving || !form.title || !form.content}
              className="flex-1 py-3 rounded-xl bg-primary text-white font-black text-sm flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <MdSave className="text-base" />
              {isSaving ? 'Saving…' : 'Save Post'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BlogPosts: React.FC = () => {
  const { data: posts = [], isLoading } = useBlogPosts();
  const { mutateAsync: createPost, isPending: creating } = useCreateBlogPost();
  const { mutateAsync: updatePost, isPending: updating } = useUpdateBlogPost();
  const { mutateAsync: deletePost } = useDeleteBlogPost();

  const [modal, setModal] = useState<{ open: boolean; post?: BlogPost | null }>({ open: false });
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [successId, setSuccessId] = useState<string | null>(null);

  const openCreate = () => setModal({ open: true, post: null });
  const openEdit = (post: BlogPost) => setModal({ open: true, post });
  const closeModal = () => setModal({ open: false });

  const handleSave = async (data: BlogPostInput) => {
    if (modal.post) {
      await updatePost({ id: modal.post.id, data });
      setSuccessId(modal.post.id);
    } else {
      const created = await createPost(data);
      setSuccessId(created.id);
    }
    setTimeout(() => setSuccessId(null), 2000);
    closeModal();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this post? This cannot be undone.')) return;
    setDeletingId(id);
    await deletePost(id);
    setDeletingId(null);
  };

  const togglePublished = async (post: BlogPost) => {
    await updatePost({ id: post.id, data: { is_published: !post.is_published } });
  };

  const sortedPosts = [...posts].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
  );

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-linear-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-md shadow-sky-400/30">
            <MdArticle className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-foreground tracking-tight uppercase">Blog</h1>
            <p className="text-xs text-muted-foreground font-medium">Publish and manage homepage blog posts</p>
          </div>
        </div>

        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-white font-black text-sm hover:bg-primary/90 active:scale-95 transition-all shadow-sm shadow-primary/30"
        >
          <MdAdd className="text-lg" />
          New Post
        </button>
      </div>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Total Posts', value: posts.length, color: 'text-sky-500' },
          { label: 'Published', value: posts.filter((p) => p.is_published).length, color: 'text-emerald-500' },
          { label: 'Drafts', value: posts.filter((p) => !p.is_published).length, color: 'text-slate-400' },
        ].map((stat) => (
          <div key={stat.label} className="bg-card border border-border rounded-2xl p-4 text-center">
            <p className={`text-2xl font-black ${stat.color}`}>{stat.value}</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-0.5">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Posts list */}
      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-24 rounded-2xl bg-card border border-border animate-pulse" />
          ))}
        </div>
      ) : sortedPosts.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <MdArticle className="text-4xl text-primary/40" />
          </div>
          <p className="text-sm font-black text-muted-foreground uppercase tracking-wide">No posts yet</p>
          <button
            onClick={openCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 text-primary font-black text-xs border border-primary/20 hover:bg-primary/20 transition-all"
          >
            <MdAdd /> Write your first post
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedPosts.map((post) => (
            <div
              key={post.id}
              className={`relative bg-card border rounded-2xl overflow-hidden transition-all ${
                successId === post.id ? 'border-emerald-400 shadow-lg shadow-emerald-400/20' : 'border-border hover:border-primary/30'
              }`}
            >
              <div className="flex items-center gap-3 p-4">
                {/* Cover preview */}
                <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0 bg-slate-100 dark:bg-slate-800 border border-border">
                  {post.cover_image_url ? (
                    <img src={post.cover_image_url} alt={post.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full bg-linear-to-br from-sky-500 to-blue-600 opacity-60 flex items-center justify-center">
                      <MdArticle className="text-white text-xl" />
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span
                      className={`text-[9px] font-black px-1.5 py-0.5 rounded-md text-white ${
                        post.is_published ? 'bg-emerald-500' : 'bg-slate-400'
                      }`}
                    >
                      {post.is_published ? 'PUBLISHED' : 'DRAFT'}
                    </span>
                    <span className="flex items-center gap-0.5 text-[9px] font-bold text-muted-foreground">
                      <MdRemoveRedEye className="text-xs" /> {post.view_count}
                    </span>
                    {successId === post.id && (
                      <span className="flex items-center gap-1 text-[9px] font-black text-emerald-500">
                        <MdCheckCircle /> Saved!
                      </span>
                    )}
                  </div>
                  <p className="font-black text-sm text-foreground truncate">{post.title}</p>
                  <p className="text-[10px] text-muted-foreground truncate">{post.excerpt}</p>
                  <p className="text-[10px] text-muted-foreground/60 truncate mt-0.5">by {post.author_name} · /blog/{post.slug}</p>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => togglePublished(post)}
                    title={post.is_published ? 'Unpublish' : 'Publish'}
                    className={`p-2 rounded-xl border transition-all ${
                      post.is_published
                        ? 'bg-emerald-50 dark:bg-emerald-950/30 border-emerald-200 dark:border-emerald-800 text-emerald-600'
                        : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'
                    }`}
                  >
                    {post.is_published ? <MdVisibility /> : <MdVisibilityOff />}
                  </button>

                  <button
                    onClick={() => openEdit(post)}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-primary hover:border-primary/30 transition-all"
                  >
                    <MdEdit />
                  </button>

                  <button
                    onClick={() => handleDelete(post.id)}
                    disabled={deletingId === post.id}
                    className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-500 hover:text-red-500 hover:border-red-300 transition-all disabled:opacity-40"
                  >
                    <MdDelete />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal.open && (
        <PostFormModal
          post={modal.post}
          onClose={closeModal}
          onSave={handleSave}
          isSaving={creating || updating}
        />
      )}
    </div>
  );
};

export default BlogPosts;