import React, { useState, useCallback } from "react";

interface ConnectedUser {
  stxAddress: string;
  username?: string;
}

interface Transaction {
  id: string;
  type: string;
  timestamp: number;
  status: "pending" | "confirmed" | "failed";
}

interface ContractState {
  totalBalance: string;
  isLocked: boolean;
  unlockTime: string;
  userDeposit: string;
}

const MOCK_STACKS_AVAILABLE =
  typeof window !== "undefined" && (window as any).StacksProvider;

// Header Component
const Header: React.FC<{
  connected: boolean;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}> = ({ connected, address, onConnect, onDisconnect }) => {
  return (
    <header className="mb-8">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Tipper</h1>
          <p className="text-slate-600 mt-1">
            Stacks Mainnet • Deposit & Beneficiary Manager
          </p>
        </div>

        <div>
          {connected && address ? (
            <div className="flex items-center gap-3 bg-white rounded-xl shadow-sm border border-slate-200 px-4 py-3">
              <div>
                <div className="text-xs text-slate-500 font-medium">
                  Connected
                </div>
                <div className="text-sm font-mono text-slate-900">
                  {address.slice(0, 8)}...{address.slice(-6)}
                </div>
              </div>
              <button
                onClick={onDisconnect}
                className="px-3 py-1.5 text-sm text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-all"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={onConnect}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl font-medium shadow-lg shadow-orange-500/30 hover:shadow-xl hover:shadow-orange-500/40 transition-all hover:scale-105"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

// Contract Configuration Component
const ContractConfig: React.FC<{
  contractAddress: string;
  onChange: (address: string) => void;
}> = ({ contractAddress, onChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h2 className="text-lg font-semibold text-slate-900 mb-2">
        Contract Configuration
      </h2>
      <p className="text-sm text-slate-600 mb-4">
        Enter the Stacks mainnet contract address
      </p>

      <input
        type="text"
        value={contractAddress}
        onChange={(e) => onChange(e.target.value)}
        placeholder="ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM.tipper"
        className="w-full px-4 py-3 border border-slate-300 rounded-lg font-mono text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
      />

      {contractAddress && (
        <div className="mt-3 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-green-600 font-medium">
            Address format valid
          </span>
        </div>
      )}
    </div>
  );
};

// Contract State Display
const ContractStateCard: React.FC<{ state: ContractState }> = ({ state }) => {
  return (
    <div className="bg-gradient-to-br from-slate-50 to-slate-100 rounded-xl border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-700 mb-4">
        Contract State
      </h3>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-xs text-slate-500 mb-1">Total Balance</div>
          <div className="text-2xl font-bold text-slate-900">
            {state.totalBalance}
          </div>
          <div className="text-xs text-slate-500 mt-0.5">STX</div>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500 mb-1">Status</div>
          <div
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
              state.isLocked
                ? "bg-yellow-100 text-yellow-700"
                : "bg-green-100 text-green-700"
            }`}
          >
            <div
              className={`w-1.5 h-1.5 rounded-full ${
                state.isLocked ? "bg-yellow-500" : "bg-green-500"
              }`}
            ></div>
            {state.isLocked ? "Locked" : "Unlocked"}
          </div>
          {state.unlockTime && (
            <div className="text-xs text-slate-500 mt-1">
              {state.unlockTime}
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200">
        <div className="text-xs text-slate-500 mb-1">Your Deposit</div>
        <div className="text-lg font-semibold text-slate-900">
          {state.userDeposit} STX
        </div>
      </div>
    </div>
  );
};

// Action Buttons Component
const ActionButtons: React.FC<{
  loading: boolean;
  connected: boolean;
  onConnect: () => void;
  onDeposit: () => void;
  onRefund: () => void;
  onWithdraw: () => void;
  onAddBeneficiary: () => void;
  onRemoveBeneficiary: () => void;
}> = ({
  loading,
  connected,
  onConnect,
  onDeposit,
  onRefund,
  onWithdraw,
  onAddBeneficiary,
  onRemoveBeneficiary,
}) => {
  const handleAction = (action: () => void) => {
    if (!connected) {
      onConnect();
      return;
    }
    action();
  };

  const buttonClass = (variant: "primary" | "secondary" = "secondary") => {
    const base =
      "px-4 py-2.5 rounded-lg font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed text-sm";
    if (variant === "primary") {
      return `${base} bg-orange-500 text-white hover:bg-orange-600 shadow-md hover:shadow-lg`;
    }
    return `${base} bg-white text-slate-700 border border-slate-300 hover:bg-slate-50 hover:border-slate-400`;
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
      <h3 className="text-sm font-semibold text-slate-900 mb-4">Actions</h3>

      <div className="space-y-3">
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleAction(onDeposit)}
            disabled={loading}
            className={buttonClass("primary")}
          >
            {loading ? "⏳ Processing..." : "💰 Deposit"}
          </button>

          <button
            onClick={() => handleAction(onRefund)}
            disabled={loading}
            className={buttonClass()}
          >
            ↩️ Refund
          </button>

          <button
            onClick={() => handleAction(onWithdraw)}
            disabled={loading}
            className={buttonClass()}
          >
            💸 Withdraw
          </button>
        </div>

        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleAction(onAddBeneficiary)}
            disabled={loading}
            className={buttonClass()}
          >
            ➕ Add Beneficiary
          </button>

          <button
            onClick={() => handleAction(onRemoveBeneficiary)}
            disabled={loading}
            className={buttonClass()}
          >
            ➖ Remove Beneficiary
          </button>
        </div>
      </div>

      <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <p className="text-xs text-blue-800">
          <strong>💡 Tip:</strong> Amounts are in micro-STX (1 STX = 1,000,000
          µSTX). All transactions require wallet confirmation.
        </p>
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar: React.FC<{
  connected: boolean;
  contractAddress: string;
  transactions: Transaction[];
}> = ({ connected, contractAddress, transactions }) => {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="text-xs text-slate-500 font-medium mb-0.5">
              Network
            </div>
            <div className="text-sm font-semibold text-slate-900">Mainnet</div>
          </div>
          <div
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              connected
                ? "bg-green-100 text-green-700"
                : "bg-slate-100 text-slate-600"
            }`}
          >
            {connected ? "● Online" : "○ Offline"}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-200">
          <div className="text-xs text-slate-500 font-medium mb-1">
            Contract
          </div>
          <div className="text-xs font-mono text-slate-900 break-all bg-slate-50 px-2 py-1.5 rounded">
            {contractAddress || "—"}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-5">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold text-slate-900">
            Transaction Log
          </h3>
          {transactions.length > 0 && (
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs font-medium rounded-full">
              {transactions.length}
            </span>
          )}
        </div>

        <div className="space-y-2 max-h-80 overflow-y-auto">
          {transactions.length === 0 ? (
            <div className="text-center py-8">
              <div className="text-4xl mb-2">📋</div>
              <p className="text-xs text-slate-400">No transactions yet</p>
            </div>
          ) : (
            transactions.map((tx) => (
              <div
                key={tx.id}
                className="p-3 bg-slate-50 rounded-lg border border-slate-100"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-slate-900">
                    {tx.type}
                  </span>
                  <span
                    className={`text-xs px-1.5 py-0.5 rounded ${
                      tx.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : tx.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {tx.status}
                  </span>
                </div>
                <div className="text-xs text-slate-500 font-mono truncate">
                  {tx.id}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App: React.FC = () => {
  const [connected, setConnected] = useState(false);
  const [user, setUser] = useState<ConnectedUser | null>(null);
  const [contractAddress, setContractAddress] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  const [contractState] = useState<ContractState>({
    totalBalance: "—",
    isLocked: true,
    unlockTime: "Not set",
    userDeposit: "—",
  });

  const handleConnect = useCallback(() => {
    setError(null);

    // Simulate wallet connection (in real app, use @stacks/connect)
    if (!MOCK_STACKS_AVAILABLE) {
      const mockAddress = "ST1PQHQKV0RJXZFY1DGX8MNSNYVE3VGZJSRTPGZGM";
      setUser({ stxAddress: mockAddress });
      setConnected(true);
      return;
    }

    // Real implementation would use showConnect from @stacks/connect
    setError("Please install a Stacks wallet to connect");
  }, []);

  const handleDisconnect = useCallback(() => {
    setUser(null);
    setConnected(false);
    setTransactions([]);
    setError(null);
  }, []);

  const addTransaction = useCallback((type: string) => {
    const tx: Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: Date.now(),
      status: "pending",
    };
    setTransactions((prev) => [tx, ...prev]);
    return tx.id;
  }, []);

  const handleDeposit = useCallback(async () => {
    if (!contractAddress) {
      setError("Please set a contract address first");
      return;
    }

    setError(null);
    setLoading(true);

    const amount = prompt("Enter deposit amount in micro-STX:");
    if (!amount) {
      setLoading(false);
      return;
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setError("Invalid amount");
      setLoading(false);
      return;
    }

    // Simulate transaction
    const txId = addTransaction("Deposit");
    setTimeout(() => {
      alert(`✅ Deposit submitted!\nAmount: ${numAmount} µSTX\nTx ID: ${txId}`);
      setLoading(false);
    }, 1000);
  }, [contractAddress, addTransaction]);

  const handleRefund = useCallback(async () => {
    if (!contractAddress) {
      setError("Please set a contract address first");
      return;
    }

    setError(null);
    setLoading(true);

    const txId = addTransaction("Refund");
    setTimeout(() => {
      alert(`✅ Refund submitted!\nTx ID: ${txId}`);
      setLoading(false);
    }, 1000);
  }, [contractAddress, addTransaction]);

  const handleWithdraw = useCallback(async () => {
    if (!contractAddress) {
      setError("Please set a contract address first");
      return;
    }

    setError(null);
    setLoading(true);

    const amount = prompt("Enter withdrawal amount in micro-STX:");
    if (!amount) {
      setLoading(false);
      return;
    }

    const numAmount = Number(amount);
    if (!Number.isFinite(numAmount) || numAmount <= 0) {
      setError("Invalid amount");
      setLoading(false);
      return;
    }

    const txId = addTransaction("Withdraw");
    setTimeout(() => {
      alert(
        `✅ Withdrawal submitted!\nAmount: ${numAmount} µSTX\nTx ID: ${txId}`
      );
      setLoading(false);
    }, 1000);
  }, [contractAddress, addTransaction]);

  const handleAddBeneficiary = useCallback(async () => {
    if (!contractAddress) {
      setError("Please set a contract address first");
      return;
    }

    setError(null);
    setLoading(true);

    const principal = prompt("Enter beneficiary principal (ST... or SP...):");
    if (!principal) {
      setLoading(false);
      return;
    }

    if (!principal.match(/^(ST|SP)[A-Z0-9]+$/)) {
      setError("Invalid principal format");
      setLoading(false);
      return;
    }

    const txId = addTransaction("Add Beneficiary");
    setTimeout(() => {
      alert(`✅ Beneficiary added!\nPrincipal: ${principal}\nTx ID: ${txId}`);
      setLoading(false);
    }, 1000);
  }, [contractAddress, addTransaction]);

  const handleRemoveBeneficiary = useCallback(async () => {
    if (!contractAddress) {
      setError("Please set a contract address first");
      return;
    }

    setError(null);
    setLoading(true);

    const principal = prompt("Enter beneficiary principal to remove:");
    if (!principal) {
      setLoading(false);
      return;
    }

    if (!principal.match(/^(ST|SP)[A-Z0-9]+$/)) {
      setError("Invalid principal format");
      setLoading(false);
      return;
    }

    const txId = addTransaction("Remove Beneficiary");
    setTimeout(() => {
      alert(`✅ Beneficiary removed!\nPrincipal: ${principal}\nTx ID: ${txId}`);
      setLoading(false);
    }, 1000);
  }, [contractAddress, addTransaction]);

  return (
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-slate-50 to-blue-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <Header
          connected={connected}
          address={user?.stxAddress}
          onConnect={handleConnect}
          onDisconnect={handleDisconnect}
        />

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <div className="flex items-start gap-3">
              <span className="text-xl">⚠️</span>
              <div>
                <div className="font-medium text-red-900">Error</div>
                <div className="text-sm text-red-700">{error}</div>
              </div>
            </div>
          </div>
        )}

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <ContractConfig
              contractAddress={contractAddress}
              onChange={setContractAddress}
            />

            <ContractStateCard state={contractState} />

            <ActionButtons
              loading={loading}
              connected={connected}
              onConnect={handleConnect}
              onDeposit={handleDeposit}
              onRefund={handleRefund}
              onWithdraw={handleWithdraw}
              onAddBeneficiary={handleAddBeneficiary}
              onRemoveBeneficiary={handleRemoveBeneficiary}
            />
          </div>

          <div>
            <Sidebar
              connected={connected}
              contractAddress={contractAddress}
              transactions={transactions}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
