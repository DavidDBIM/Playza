import { useState, useEffect, useCallback } from 'react';
import { notificationService, type Notification } from '../services/notification.service';

export function useNotifications() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchHistory = useCallback(async (p = 1) => {
    setLoading(true);
    try {
      const data = await notificationService.getHistory(p);
      setNotifications(data.notifications);
      setTotal(data.total);
      setTotalPages(data.total_pages);
      setPage(data.page);
      setError(null);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to fetch notification history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchHistory(page);
  }, [fetchHistory, page]);

  return {
    notifications,
    total,
    loading,
    error,
    page,
    totalPages,
    setPage,
    refresh: () => fetchHistory(page),
    remove: async (id: string) => {
      await notificationService.deleteNotification(id);
      fetchHistory(page);
    },
  };
}
