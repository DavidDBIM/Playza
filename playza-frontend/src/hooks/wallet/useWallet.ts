import { useState, useCallback } from "react";
import {
  walletApi,
  type WalletBalance,
  type Transaction,
  type Bank,
} from "@/api/wallet.api";

export const useWallet = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await walletApi.getWallet();
      console.log("[useWallet] Wallet balance fetched:", data);
      setBalance(data);
    } catch (err) {
      console.error("[useWallet] Fetch balance error:", err);
      const message = err instanceof Error ? err.message : "Failed to fetch wallet balance";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  const initializeDeposit = async (amount: number) => {
    setLoading(true);
    setError(null);
    try {
      const data = await walletApi.initializeDeposit(amount);
      console.log("[useWallet] Initialization deposit success:", data);
      return data;
    } catch (err) {
      console.error("[useWallet] Initialize deposit error:", err);
      const message = err instanceof Error ? err.message : "Failed to initialize deposit";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const withdraw = async (data: {
    amount: number;
    bank_code: string;
    account_number: string;
    account_name: string;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await walletApi.requestWithdrawal(data);
      console.log("[useWallet] Withdrawal success:", result);
      return result;
    } catch (err) {
      console.error("[useWallet] Withdrawal error:", err);
      const message = err instanceof Error ? err.message : "Failed to request withdrawal";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    balance,
    loading,
    error,
    fetchBalance,
    initializeDeposit,
    withdraw,
  };
};

export const useTransactions = (page = 1, limit = 10) => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await walletApi.getTransactionHistory(page, limit);
      console.log("[useTransactions] Transactions fetched:", data);
      setTransactions(data.transactions);
      setTotal(data.total);
    } catch (err) {
      console.error("[useTransactions] Fetch transactions error:", err);
      const message = err instanceof Error ? err.message : "Failed to fetch transaction history";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [page, limit]);

  return {
    transactions,
    total,
    loading,
    error,
    fetchTransactions,
  };
};

export const useBanks = () => {
  const [banks, setBanks] = useState<Bank[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchBanks = useCallback(async () => {
    setLoading(true);
    try {
      const data = await walletApi.getBankList();
      console.log("[useBanks] Banks list fetched:", data);
      setBanks(data);
    } catch (err) {
      console.error("[useBanks] Fetch banks error:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyAccount = async (accountNumber: string, bankCode: string) => {
    setLoading(true);
    try {
      const data = await walletApi.verifyBankAccount(accountNumber, bankCode);
      console.log("[useBanks] Account verification success:", data);
      return data;
    } catch (err) {
      console.error("[useBanks] Verify account error:", err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    banks,
    loading,
    fetchBanks,
    verifyAccount,
  };
};
