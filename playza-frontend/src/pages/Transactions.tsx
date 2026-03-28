import { Loader2 } from "lucide-react";
import { MdFileDownload, MdSearch, MdFilterList } from "react-icons/md";
import TransactionItem from "@/components/transactions/TransactionItem";
import { useState, useEffect, useMemo, useRef } from "react";
import TransactionDetailModal from "@/components/transactions/TransactionDetailModal";
import type { TransactionUI } from "@/types/types";
import { transactionsData } from "@/data/transactions";

const ITEMS_PER_PAGE = 15;

const Transactions = () => {
  const [selectedTxn, setSelectedTxn] = useState<TransactionUI | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [itemsToShow, setItemsToShow] = useState(ITEMS_PER_PAGE);
  const [isLoading, setIsLoading] = useState(false);
  
  const observerBottom = useRef(null);
  const observerTop = useRef(null);

  const handleOpen = (txn: TransactionUI) => {
    setSelectedTxn(txn);
    setIsModalOpen(true);
  };

  const filteredTransactions = useMemo(() => {
    let filtered = transactionsData;
    if (activeTab !== "All") {
      filtered = filtered.filter(txn => txn.typeKey === activeTab);
    }
    if (searchQuery) {
      filtered = filtered.filter(txn => txn.id.toLowerCase().includes(searchQuery.toLowerCase()));
    }
    return filtered;
  }, [activeTab, searchQuery]);

  const currentItems = useMemo(() => {
    return filteredTransactions.slice(0, itemsToShow);
  }, [filteredTransactions, itemsToShow]);

  const hasMore = itemsToShow < filteredTransactions.length;

  const loadMore = () => {
    if (isLoading || !hasMore) return;
    setIsLoading(true);
    setTimeout(() => {
      setItemsToShow(prev => prev + ITEMS_PER_PAGE);
      setIsLoading(false);
    }, 800);
  };



  // Bottom Observer (Load More)
  useEffect(() => {
    const target = observerBottom.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !isLoading) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [hasMore, isLoading]);

  // Top Observer (Reduce List)
  useEffect(() => {
    const target = observerTop.current;
    if (!target) return;

    const observer = new IntersectionObserver(
      entries => {
        // If we are back at the top and have more than initial page, we can "reduce"
        // But we only want to do this if we actually scrolled down significantly
        if (entries[0].isIntersecting && itemsToShow > ITEMS_PER_PAGE) {
          // We don't want to snap back instantly usually, 
          // but the user asked for "reduces" when scrolling up.
          // To make it less jarring, we'll only do it if the user is at the very top.
          setItemsToShow(ITEMS_PER_PAGE);
        }
      },
      { threshold: 1.0 }
    );

    observer.observe(target);
    return () => observer.disconnect();
  }, [itemsToShow]);

  return (
    <main className="flex-1 mx-auto w-full overflow-x-hidden relative">
      {/* Top Observer Target */}
      <div ref={observerTop} className="h-1 w-full absolute top-0 bg-transparent" />

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-6 mb-10 mt-4">
        <div className="space-y-2">
          <h1 className="text-4xl md:text-5xl font-black tracking-tighter text-slate-900 dark:text-slate-100">
            Ledger <span className="text-primary">&</span> History
          </h1>
          <p className="text-slate-600 dark:text-slate-400 text-sm md:text-xs md:text-base font-medium">
            Your detailed financial activity and gaming rewards statement.
          </p>
        </div>
        <button className="flex items-center gap-2 px-2 md:px-6 py-2 md:py-3 bg-primary text-background-dark font-black rounded-xl hover:scale-[1.05] transition-all neon-glow group shadow-xl">
          <MdFileDownload className="text-base md:text-xl group-hover:animate-bounce" />
          <span>Download PDF</span>
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-2 md:gap-4 mb-8 ">
        <div className="flex-1 flex gap-2 overflow-x-auto pb-2 lg:pb-0 scrollbar-hide">
          {["All", "Deposits", "Withdrawals", "Entries", "Wins"].map(
            (filter) => (
              <button
                key={filter}
                onClick={() => {
                  setActiveTab(filter);
                  setItemsToShow(ITEMS_PER_PAGE);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border shrink-0 ${
                  activeTab === filter
                    ? "bg-primary text-background-dark border-primary shadow-lg shadow-primary/20"
                    : "bg-white/5 text-slate-500 border-white/5 hover:border-primary/30 hover:text-primary"
                }`}
              >
                {filter}
              </button>
            ),
          )}
        </div>
        <div className="flex gap-2">
          <div className="relative flex-1 lg:w-64">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm md:text-lg" />
            <input
              type="text"
              placeholder="Search by ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-white/5 border border-white/5 rounded-xl py-2 md:py-2.5 pl-2 md:pl-10 pr-2 md:pr-4 text-sm focus:outline-none focus:border-primary/50 transition-all text-white"
            />
          </div>
          <button className="p-2 md:p-2.5 bg-white/5 border border-white/5 rounded-xl text-slate-500 hover:text-primary transition-all">
            <MdFilterList className="text-base md:text-xl" />
          </button>
        </div>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden mb-10 border border-white/5 shadow-2xl">
        <div className="bg-white/5 px-2 py-2 md:py-4 border-b border-white/5 flex items-center justify-between">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Transaction Details
          </span>
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Amount & Status
          </span>
        </div>
        <div className="flex flex-col">
          {currentItems.map((txn) => (
            <TransactionItem
              key={txn.id}
              {...txn}
              onClick={() => handleOpen(txn)}
            />
          ))}

          {/* Bottom Observer Target */}
          <div ref={observerBottom} className="h-20 w-full" />

          {isLoading && (
            <div className="flex flex-col items-center justify-center p-2 md:p-8 text-slate-500 gap-2 md:gap-3">
              <Loader2 className="animate-spin text-primary" size={32} />
              <p className="text-xs font-bold uppercase tracking-widest animate-pulse">
                Loading more transactions...
              </p>
            </div>
          )}

          {!hasMore && currentItems.length > 0 && (
            <div className="p-2 md:p-8 text-center border-t border-white/5 bg-white/5">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                ✨ No more transactions to show
              </p>
            </div>
          )}

          {currentItems.length === 0 && (
            <div className="p-2 md:p-20 text-center">
              <p className="text-xs md:text-base text-slate-500 font-bold">
                No transactions found for this category.
              </p>
            </div>
          )}
        </div>
      </div>

      <TransactionDetailModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        transaction={selectedTxn}
      />
    </main>
  );
};

export default Transactions;



