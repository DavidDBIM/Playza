import { Link } from "react-router";
import { HelpCircle, ChevronRight } from "lucide-react";

const HomeFAQ = () => {
  return (
    <section className="px-2 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/20 flex items-center justify-center text-primary shadow-lg shadow-primary/10">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-black uppercase tracking-tight italic text-foreground">
              Frequently <span className="text-primary">Asked</span>
            </h2>
            <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground dark:text-slate-500">Quick answers to common questions</p>
          </div>
        </div>
        <Link 
          to="/faq" 
          className="text-[10px] font-black uppercase tracking-widest text-primary flex items-center gap-1 hover:underline underline-offset-4 bg-primary/10 px-3 py-1.5 rounded-full border border-primary/20"
        >
          View All <ChevronRight className="w-3 h-3" />
        </Link>
      </div>
    </section>
  );
};

export default HomeFAQ;