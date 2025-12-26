import React, { useCallback, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { showConnect } from "@stacks/connect";
import { StacksMainnet } from "@stacks/network";
import "./index.css";
import contract from "./api/contract";

/**
 * Main entry and app shell for the Tipper frontend.
 *
 * - Provides a minimal connect / disconnect flow using @stacks/connect (mainnet).
 * - Exposes a simple UI to set the contract address and show read-only placeholders.
 * - This file intentionally keeps the contract interactions small and isolated so
 *   the rest of the app (components that make contract calls) can be added later.
 */

/* Minimal typed shape for connected user data we care about */
type ConnectedUser = {
  username?: string;
  appPrivateKey?: string;
  stxAddress?: string;
};

function useLocalBoolean(key: string, initial = false) {
  const [state, setState] = useState(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : initial;
    } catch {
      return initial;
    }
  });
  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch {}
  }, [key, state]);
  return [state, setState] as const;
}

function Header({
  connected,
  address,
  onConnect,
  onDisconnect,
}: {
  connected: boolean;
  address?: string;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <header className="w-full max-w-6xl mx-auto px-4 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold">Tipper — Stacks (Mainnet)</h1>
          <p className="kv mt-1">
            A minimal UI for the Tipper clarity contract
          </p>
        </div>
        <div className="flex items-center gap-3">
          {connected && address ? (
            <div className="card-sm row-between">
              <div className="pr-3">
                <div className="text-sm text-slate-600">Connected</div>
                <div className="text-sm font-medium break-words">{address}</div>
              </div>
              <button className="btn btn-ghost" onClick={onDisconnect}>
                Disconnect
              </button>
            </div>
          ) : (
            <button className="btn btn-primary" onClick={onConnect}>
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
}

function AppShell() {
  const [contractAddress, setContractAddress] = useState<string>("");
  const [connected, setConnected] = useLocalBoolean("tipper.connected", false);
  const [user, setUser] = useState<ConnectedUser | null>(null);

  // Try to hydrate an address if the wallet left some known key (best-effort)
  useEffect(() => {
    // Not safe to assume a specific structure in storage; this is purely UX-friendly.
    // The primary connection flow uses showConnect below which will handle authentication.
    if (connected && !user) {
      // We can't reliably extract an address without the stacks auth objects,
      // so just keep the `connected` boolean for UI. Real address read should
      // come from the authentication response or a getUserSession wrapper.
      setUser({ stxAddress: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const connect = useCallback(() => {
    showConnect({
      appDetails: {
        name: "Tipper",
        icon: "",
      },
      network: new StacksMainnet(),
      onFinish: (payload: any) => {
        // onFinish is invoked after the wallet flow completes.
        // Different versions of the wallet connect payload may vary.
        // We'll set a conservative connected flag and attempt to read an address
        // if present on payload.
        try {
          // Try a few common paths users might find useful to inspect.
          let stxAddress: string | undefined;
          if (payload && payload.hasOwnProperty("authResponse")) {
            const ar = payload.authResponse;
            // common structure: authResponse.userData?.profile?.stxAddress?.mainnet
            stxAddress =
              ar?.userData?.profile?.stxAddress?.mainnet ??
              ar?.userData?.stxAddress?.mainnet;
          } else if (payload && payload.account) {
            stxAddress = payload.account;
          }

          setUser((prev) => ({ ...prev, stxAddress }));
          setConnected(true);
          // Developers: you may want to persist user details into a more secure store
          // or call your backend to register the authenticated user here.
        } catch (err) {
          console.warn("Could not parse connect payload", err);
          setConnected(true);
        }
      },
    });
  }, [setConnected]);

  const disconnect = useCallback(() => {
    // @stacks/connect does not expose a direct logout function because the wallet
    // is external. Clearing app-specific state and optionally reloading is typical.
    setUser(null);
    setConnected(false);
    // Keep it friendly: don't force reload — but the developer can toggle as needed.
  }, [setConnected]);

  return (
    <div className="app-shell">
      <div className="card">
        <Header
          connected={connected}
          address={user?.stxAddress}
          onConnect={connect}
          onDisconnect={disconnect}
        />

        <div className="grid-cols-responsive mt-4">
          <div>
            <section className="mb-6">
              <h2 className="text-lg font-bold">Contract</h2>
              <p className="kv mb-3">
                Set the contract address (mainnet) you want to interact with.
              </p>
              <div className="flex gap-3">
                <input
                  className="input"
                  placeholder="ST... (mainnet contract address)"
                  value={contractAddress}
                  onChange={(e) => setContractAddress(e.target.value)}
                />
                <button
                  className="btn btn-primary"
                  onClick={() => {
                    // Persist the chosen address for convenience
                    try {
                      localStorage.setItem(
                        "tipper.contractAddress",
                        contractAddress
                      );
                      alert("Contract address saved (in localStorage)");
                    } catch {
                      alert("Could not save contract address");
                    }
                  }}
                >
                  Save
                </button>
              </div>
            </section>

            <section className="mb-6">
              <h3 className="text-sm font-semibold mb-2">
                Read-only contract state
              </h3>
              <div className="card-sm">
                <div className="row-between mb-3">
                  <div>
                    <div className="kv">Total Balance</div>
                    <div className="balance">— STX</div>
                    <div className="balance-sub">(Fetched from contract)</div>
                  </div>
                  <div>
                    <div className="kv">Unlock Status</div>
                    <div className="badge locked">Locked</div>
                    <div className="kv mt-1">Unlock time: —</div>
                  </div>
                </div>

                <div className="hr" />

                <div>
                  <div className="kv">Your deposit</div>
                  <div className="text-lg font-medium">— STX</div>
                  <div className="kv">
                    (Use wallet actions below to interact)
                  </div>
                </div>
              </div>
            </section>

            <section>
              <h3 className="text-sm font-semibold mb-2">Actions</h3>
              <div className="space-y-3">
                <div className="flex gap-3">
                  <button
                    className="btn btn-primary"
                    onClick={async () => {
                      if (!connected) {
                        connect();
                        return;
                      }
                      try {
                        const input = prompt(
                          "Enter amount (uint, e.g. micro-STX):"
                        );
                        if (!input) return;
                        const amount = Number(input);
                        if (!Number.isFinite(amount) || amount < 0) {
                          alert("Invalid amount");
                          return;
                        }
                        await contract.deposit(contractAddress, amount, {
                          onFinish: (payload) => {
                            const txId =
                              payload?.txId ??
                              payload?.tx_id ??
                              JSON.stringify(payload);
                            alert("Deposit submitted. Tx: " + txId);
                          },
                          onCancel: () => {
                            alert("Deposit cancelled");
                          },
                        });
                      } catch (err) {
                        console.error(err);
                        alert(
                          "Deposit failed: " +
                            (err instanceof Error ? err.message : String(err))
                        );
                      }
                    }}
                  >
                    Deposit
                  </button>

                  <button
                    className="btn btn-ghost"
                    onClick={async () => {
                      if (!connected) {
                        connect();
                        return;
                      }
                      try {
                        await contract.refund(contractAddress, {
                          onFinish: (payload) => {
                            const txId =
                              payload?.txId ??
                              payload?.tx_id ??
                              JSON.stringify(payload);
                            alert("Refund submitted. Tx: " + txId);
                          },
                          onCancel: () => {
                            alert("Refund cancelled");
                          },
                        });
                      } catch (err) {
                        console.error(err);
                        alert(
                          "Refund failed: " +
                            (err instanceof Error ? err.message : String(err))
                        );
                      }
                    }}
                  >
                    Refund
                  </button>

                  <button
                    className="btn"
                    onClick={async () => {
                      if (!connected) {
                        connect();
                        return;
                      }
                      try {
                        const input = prompt("Enter withdraw amount (uint):");
                        if (!input) return;
                        const amount = Number(input);
                        if (!Number.isFinite(amount) || amount < 0) {
                          alert("Invalid amount");
                          return;
                        }
                        await contract.withdraw(contractAddress, amount, {
                          onFinish: (payload) => {
                            const txId =
                              payload?.txId ??
                              payload?.tx_id ??
                              JSON.stringify(payload);
                            alert("Withdraw submitted. Tx: " + txId);
                          },
                          onCancel: () => {
                            alert("Withdraw cancelled");
                          },
                        });
                      } catch (err) {
                        console.error(err);
                        alert(
                          "Withdraw failed: " +
                            (err instanceof Error ? err.message : String(err))
                        );
                      }
                    }}
                  >
                    Withdraw
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    className="btn btn-ghost"
                    onClick={async () => {
                      if (!connected) {
                        connect();
                        return;
                      }
                      try {
                        const principal = prompt(
                          "Enter beneficiary principal (e.g. ST... or SP...):"
                        );
                        if (!principal) return;
                        await contract.addBeneficiary(
                          contractAddress,
                          principal,
                          {
                            onFinish: (payload) => {
                              const txId =
                                payload?.txId ??
                                payload?.tx_id ??
                                JSON.stringify(payload);
                              alert("Add beneficiary submitted. Tx: " + txId);
                            },
                            onCancel: () => {
                              alert("Add beneficiary cancelled");
                            },
                          }
                        );
                      } catch (err) {
                        console.error(err);
                        alert(
                          "Add beneficiary failed: " +
                            (err instanceof Error ? err.message : String(err))
                        );
                      }
                    }}
                  >
                    Add beneficiary
                  </button>

                  <button
                    className="btn btn-ghost"
                    onClick={async () => {
                      if (!connected) {
                        connect();
                        return;
                      }
                      try {
                        const principal = prompt(
                          "Enter beneficiary principal to remove (e.g. ST... or SP...):"
                        );
                        if (!principal) return;
                        await contract.removeBeneficiary(
                          contractAddress,
                          principal,
                          {
                            onFinish: (payload) => {
                              const txId =
                                payload?.txId ??
                                payload?.tx_id ??
                                JSON.stringify(payload);
                              alert(
                                "Remove beneficiary submitted. Tx: " + txId
                              );
                            },
                            onCancel: () => {
                              alert("Remove beneficiary cancelled");
                            },
                          }
                        );
                      } catch (err) {
                        console.error(err);
                        alert(
                          "Remove beneficiary failed: " +
                            (err instanceof Error ? err.message : String(err))
                        );
                      }
                    }}
                  >
                    Remove beneficiary
                  </button>
                </div>

                <div>
                  <small className="kv">
                    Notes: These actions use the wallet (via @stacks/connect).
                    Amounts should be provided in the uint units your contract
                    expects (e.g. micro-STX). Transaction confirmations and
                    richer UX (spinner, pending state, tx feed) can be added
                    next.
                  </small>
                </div>
              </div>
            </section>
          </div>

          <aside>
            <div className="card-sm">
              <div className="row-between mb-3">
                <div>
                  <div className="kv">Environment</div>
                  <div className="text-sm font-medium">Mainnet</div>
                </div>
                <div>
                  <div className="kv">Status</div>
                  <div className="badge ok">
                    {connected ? "Wallet connected" : "Disconnected"}
                  </div>
                </div>
              </div>

              <div className="hr" />

              <div>
                <div className="kv">Contract address</div>
                <div className="text-sm break-words">
                  {contractAddress || <span className="kv">Not set</span>}
                </div>
              </div>

              <div className="hr" />

              <div>
                <div className="kv mb-2">Transaction log</div>
                <ul className="tx-log">
                  <li className="text-xs text-slate-500">
                    No transactions yet. Actions will appear here when
                    implemented.
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

const root = createRoot(document.getElementById("root") as HTMLElement);
root.render(<AppShell />);
