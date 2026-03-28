import { useState, useMemo } from "react";
import { MdCheckCircle, MdPending, MdCancel, MdSearch, MdFilterList } from "react-icons/md";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table";
import { ZASymbol } from "@/components/currency/ZASymbol";

const MOCK_REFERRALS = [
  {
    id: 1,
    name: "NightStalker_99",
    avatar: "N",
    date: "Oct 12, 2023",
    status: "Completed",
    reward: "5,000",
  },
  {
    id: 2,
    name: "BellaCiao04",
    avatar: "B",
    date: "Oct 10, 2023",
    status: "Pending",
    reward: "--",
  },
  {
    id: 3,
    name: "PixelFire",
    avatar: "P",
    date: "Oct 08, 2023",
    status: "Completed",
    reward: "5,000",
  },
  {
    id: 4,
    name: "DragonsSlayer",
    avatar: "D",
    date: "Oct 05, 2023",
    status: "Completed",
    reward: "5,000",
  },
  {
    id: 5,
    name: "MysticMage",
    avatar: "M",
    date: "Oct 01, 2023",
    status: "Failed",
    reward: "--",
  },
];

const ReferralHistoryTable = () => {
  const [filter, setFilter] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredReferrals = useMemo(() => {
    return MOCK_REFERRALS.filter((r) => {
      const matchesFilter = filter === "All" || r.status === filter;
      const matchesSearch = r.name.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesFilter && matchesSearch;
    });
  }, [filter, searchQuery]);

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
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl pl-2 md:pl-10 pr-2 md:pr-4 py-2 text-sm text-slate-900 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all shadow-sm"
            />
          </div>
          <button className="bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 p-2 md:p-2.5 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors text-slate-500 dark:text-slate-300">
            <MdFilterList className="text-sm md:text-lg" />
          </button>
        </div>
      </div>

      <div className="flex gap-2 md:gap-4 mb-4 overflow-x-auto px-2 md:px-0 scrollbar-hide">
        {["All", "Pending", "Completed"].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
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
            {filteredReferrals.map((referral) => (
              <TableRow
                key={referral.id}
                className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors border-slate-100 dark:border-slate-800 group"
              >
                <TableCell className="p-2 md:p-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-xs border border-primary/20">
                      {referral.avatar}
                    </div>
                    <span className="text-slate-900 dark:text-slate-100 font-bold text-sm tracking-tight truncate max-w-25 sm:max-w-none">
                      {referral.name}
                    </span>
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
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-2 md:gap-4 px-2">
        <p className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">
          Season 1 Activities
        </p>
        <div className="flex items-center gap-1">
          <button
            className="px-2 md:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 disabled:opacity-30 transition-all border border-slate-200 dark:border-slate-700"
            disabled
          >
            Prev
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-primary text-white text-xs font-black shadow-lg shadow-primary/20">
            1
          </button>
          <button className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all text-center">
            2
          </button>
          <button className="px-2 md:px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500 text-xs font-bold hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 transition-all">
            Next
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReferralHistoryTable;
