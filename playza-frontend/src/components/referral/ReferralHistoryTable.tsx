import { useState, useMemo } from "react";
import { MdCheckCircle, MdPending, MdCancel, MdSearch } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ZASymbol } from "@/components/currency/ZASymbol";
import { type ReferralRecord as ReferralRecordType } from "@/api/referral.api";

interface ReferralHistoryTableProps {
  referrals: ReferralRecordType[];
}

const ReferralHistoryTable = ({ referrals: apiReferrals }: ReferralHistoryTableProps) => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  const referrals = useMemo(() => {
    return apiReferrals.map(r => ({
      id: r.id,
      name: r.users?.username || "Unknown Gamer",
      avatar: (r.users?.username || "U").charAt(0).toUpperCase(),
      date: new Date(r.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      status: r.status === "email_verified" ? "Completed" : r.status === "pending" ? "Pending" : "Failed",
      reward: r.status === "email_verified" ? "15" : "--" // SIGNUP(5) + EMAIL(10)
    }));
  }, [apiReferrals]);

  const filteredReferrals = useMemo(() => {
    return referrals.filter((r) => {
      const matchesFilter = filter === "All" || r.status === filter;
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [referrals, filter, searchQuery]);



  const { paginatedData, totalPages } = useMemo(() => {
    // We can't use lib/pagination directly because of the MatchHistory type restriction,
    // so we implement the same logic here for Referral records.
    const itemsPerPage = 5;
    const totalPages = Math.ceil(filteredReferrals.length / itemsPerPage);
    const paginatedData = filteredReferrals.slice(
      (currentPage - 1) * itemsPerPage,
      currentPage * itemsPerPage
    );
    return { paginatedData, totalPages };
  }, [filteredReferrals, currentPage]);

  return (
    <div className="w-full">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2 md:gap-4 px-2 md:px-0">
        <div>
          <h2 className="text-base md:text-xl font-display font-black text-slate-900 dark:text-slate-100 uppercase italic tracking-tight">
            Referral History
          </h2>
          <p className="text-slate-500 dark:text-slate-400 text-xs md:text-sm font-bold uppercase tracking-widest opacity-70">
            Track and manage your squad's activity.
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <MdSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm md:text-lg" />
            <input
              type="text"
              placeholder="Search players..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-10 pr-2 md:pr-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2 md:gap-4 mb-4 overflow-x-auto px-2 md:px-0 scrollbar-hide">
        {["All", "Pending", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => {
              setFilter(tab);
              setCurrentPage(1);
            }}
            className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all border ${
              filter === tab
                ? "bg-primary text-white border-primary shadow-lg shadow-primary/20"
                : "bg-slate-100 dark:bg-slate-800 text-slate-500 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/50 overflow-hidden shadow-sm">
        <Table className="w-full">
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-800/50 hover:bg-transparent border-slate-200 dark:border-slate-800">
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 p-2 md:p-4">
                Player
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 hidden sm:table-cell">
                Date
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500">
                Status
              </TableHead>
              <TableHead className="font-black text-[10px] uppercase tracking-widest text-slate-500 text-right p-2 md:p-4">
                Reward
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedData.length > 0 ? (
              paginatedData.map((referral) => (
                <TableRow
                  key={referral.id}
                  className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-slate-100 dark:border-slate-800 group"
                >
                  <TableCell className="p-2 md:p-4">
                    <div className="flex items-center gap-2 md:gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                        {referral.avatar}
                      </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight truncate">
                        {referral.name}
                      </span>
                      <span className="text-[10px] text-slate-400 font-bold uppercase sm:hidden">
                        {referral.date}
                      </span>
                    </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-xs text-slate-500 hidden sm:table-cell font-bold uppercase">
                    {referral.date}
                  </TableCell>
                  <TableCell>
                    <div
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider ${
                        referral.status === "Completed"
                          ? "bg-green-500/10 text-green-500 border border-green-500/20"
                          : referral.status === "Pending"
                            ? "bg-amber-500/10 text-amber-500 border border-amber-500/20"
                            : "bg-red-500/10 text-red-500 border border-red-500/20"
                      }`}
                    >
                      {referral.status === "Completed" && (
                        <MdCheckCircle className="text-xs" />
                      )}
                      {referral.status === "Pending" && (
                        <MdPending className="text-xs" />
                      )}
                      {referral.status === "Failed" && (
                        <MdCancel className="text-xs" />
                      )}
                      <span className="hidden xs:inline">{referral.status}</span>
                      <span className="xs:hidden">
                        {referral.status.charAt(0)}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right p-2 md:p-4">
                    <div className="flex items-center gap-1 justify-end">
                      {referral.reward !== "--" && <ZASymbol className="text-xs scale-90" />}
                      <span
                        className={`font-black text-sm tracking-tighter italic ${referral.reward !== "--" ? "text-primary" : "text-slate-400"}`}
                      >
                        {referral.reward}
                      </span>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-32 text-center">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <p className="text-slate-500 dark:text-slate-400 font-bold uppercase tracking-widest text-xs opacity-60">
                      No recruits in this squad level yet.
                    </p>
                    <p className="text-[10px] text-slate-400 italic">
                      Recruit friends to start earning legendary <ZASymbol className="text-xs ml-1" /> rewards!
                    </p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4 px-2">
          <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="px-2 md:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all border border-slate-200 dark:border-slate-700"
            >
              Prev
            </button>
            
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`w-8 h-8 flex items-center justify-center rounded-lg text-xs font-black transition-all ${
                  currentPage === page 
                    ? "bg-primary text-white shadow-lg shadow-primary/20" 
                    : "bg-slate-100 dark:bg-slate-800 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="px-2 md:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all border border-slate-200 dark:border-slate-700"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralHistoryTable;
