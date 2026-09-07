import { BookOpen, ChevronRight } from "lucide-react";

const HomeDocs = () => {
  return (
    <section className="px-2 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight italic text-foreground">
              Playza <span className="text-primary">Docs</span>
            </h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-500">How the platform actually works</p>
          </div>
        </div>
        {/* Plain <a>, not react-router's <Link> — /doc is a separately
            deployed site (playza-docs on Vercel) proxied in via a
            vercel.json rewrite, not a route inside this app. A <Link>
            would try to handle it client-side and 404 instead of ever
            sending a real request for the rewrite to catch. */}
        <a
          href="/doc"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline underline-offset-4 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
        >
          Read Docs <ChevronRight className="w-3 h-3" />
        </a>
      </div>
    </section>
  );
};

export default HomeDocs;