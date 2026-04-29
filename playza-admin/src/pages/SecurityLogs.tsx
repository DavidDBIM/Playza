import React, { useState } from 'react';
import { 
  MdRefresh,
  MdInfo,
  MdShield
} from 'react-icons/md';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../components/ui/table';
import { useAdminLogs } from "../hooks/use-admin";
import type { AdminLog } from '../services/security.service';

const SecurityLogs: React.FC = () => {
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, refetch } = useAdminLogs({
    page,
    limit: 20
  });

  const logs = (data?.logs as AdminLog[]) || [];

  return (
    <main className="p-4 space-y-4">
      {/* Header Section */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-linear-to-br from-rose-500 to-amber-600 flex items-center justify-center shadow-md shadow-rose-500/30">
            <MdShield className="w-4 h-4 text-white text-lg" />
          </div>
          <div>
            <h1 className="text-xl font-black text-foreground tracking-tight">
              Security Audit Trails
            </h1>
            <p className="text-xs text-muted-foreground font-medium">
              Monitor administrative actions and system integrity
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 px-3 py-1.5 bg-muted hover:bg-muted/80 rounded-xl text-xs font-bold text-foreground transition-all"
          >
            <MdRefresh
              className={`text-lg ${isLoading ? "animate-spin" : ""}`}
            />{" "}
            Refresh Logs
          </button>
        </div>
      </div>

      {/* Intelligence Note */}
      <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 flex items-start gap-3">
        <MdInfo className="text-primary text-xl shrink-0 mt-0.5" />
        <div className="text-xs text-primary/80 font-medium leading-relaxed">
          <strong className="text-primary">Operational Security Notice:</strong> All administrative sessions are recorded. Modifications to user wallets, status, and game parameters are logged with IP tracking for platform integrity.
        </div>
      </div>

      {/* Table Module */}
      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          {isError ? (
            <div className="py-20 text-center text-rose-500">
              <p className="font-heading font-black uppercase text-xl">
                Intelligence Link Failure
              </p>
              <p className="text-xs opacity-60 mt-2">
                Could not synchronize with the security audit server.
              </p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-muted/50 border-b border-border">
                <TableRow className="hover:bg-transparent border-none">
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Admin
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Action
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Target ID
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Details
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    IP Address
                  </TableHead>
                  <TableHead className="px-4 py-3 text-xs font-black text-muted-foreground uppercase tracking-wider h-auto whitespace-nowrap">
                    Timestamp
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody
                className={`divide-y divide-border ${isLoading ? "opacity-30" : ""}`}
              >
                {logs.length > 0 ? (
                  logs.map((log: AdminLog) => (
                    <TableRow
                      key={log.id}
                      className="group hover:bg-muted/30 transition-all duration-200 border-border"
                    >
                      <TableCell className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          {log.admin?.avatar_url ? (
                            <img src={log.admin.avatar_url} className="w-6 h-6 rounded-lg object-cover" alt="" />
                          ) : (
                            <div className="w-6 h-6 rounded-lg bg-primary/10 flex items-center justify-center text-[10px] font-black text-primary">
                              {log.admin?.username?.[0].toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col">
                            <span className="text-sm font-bold text-foreground">@{log.admin?.username}</span>
                            <span className="text-[10px] text-muted-foreground">{log.admin?.email}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-4 py-2.5">
                        <span className={`text-[10px] font-black uppercase px-2 py-1 rounded-lg border ${
                          log.action.includes('BAN') ? 'bg-rose-100 dark:bg-rose-900/30 text-rose-600 border-rose-200' :
                          log.action.includes('ACTIVATE') ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 border-emerald-200' :
                          'bg-primary/10 text-primary border-primary/20'
                        }`}>
                          {log.action.replace('_', ' ')}
                        </span>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 font-mono text-[10px] font-bold text-muted-foreground">
                        {log.target_id || 'N/A'}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 max-w-xs">
                        <pre className="text-[10px] font-medium text-muted-foreground bg-muted p-2 rounded-lg overflow-hidden text-ellipsis whitespace-nowrap">
                          {JSON.stringify(log.details)}
                        </pre>
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-xs font-bold text-foreground">
                        {log.ip_address || '0.0.0.0'}
                      </TableCell>
                      <TableCell className="px-4 py-2.5 text-xs font-bold text-muted-foreground uppercase">
                        {new Date(log.created_at).toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="py-20 text-center opacity-30"
                    >
                      <p className="font-heading font-black uppercase tracking-widest">
                        No Audit Records Found
                      </p>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Pagination */}
        <div className="px-6 py-4 bg-muted/50 border-t border-border flex items-center justify-between text-muted-foreground">
          <p className="text-[10px] font-black uppercase tracking-wider">
            Displaying <span className="text-primary font-number">{logs.length}</span> Records
          </p>
          {data && data.pages > 1 && (
            <div className="flex items-center gap-3">
              <button
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 transition-all"
              >
                ← Prev
              </button>
              <span className="text-xs font-bold text-foreground">
                Page {page} of {data.pages}
              </span>
              <button
                disabled={page === data.pages}
                onClick={() => setPage((p) => p + 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-bold bg-muted hover:bg-muted/80 text-foreground disabled:opacity-40 transition-all"
              >
                Next →
              </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
};

export default SecurityLogs;
