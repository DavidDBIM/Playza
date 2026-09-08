import { Link } from "react-router";
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
        {/* /doc is a real route inside this app now (see App.tsx + DocPage),
            so this is a normal react-router Link. */}
        <Link
          to="/doc"
          className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline underline-offset-4 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
        >
          Read Docs <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
};

export default HomeDocs;