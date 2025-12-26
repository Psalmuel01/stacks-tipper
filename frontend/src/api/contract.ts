/**
 * Contract API wrappers for the Tipper contract (write/call flows)
 *
 * These helpers use `@stacks/connect` to open wallet-based contract-call flows
 * on Stacks Mainnet. They intentionally keep the surfaces small and return the
 * result of `openContractCall`, allowing the caller to handle onFinish/onCancel.
 *
 * Notes:
 * - Amounts are forwarded as `uint` Clarity values using `uintCV`.
 * - Principal parameters are forwarded as standard principals using `standardPrincipalCV`.
 * - The contract name is assumed to be `tipper` (adjust if your deployed contract name differs).
 *
 * Usage example:
 *   import * as tipper from '@/api/contract';
 *   tipper.deposit(contractAddress, 1000000, { onFinish: payload => console.log(payload) });
 */

import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import { uintCV, standardPrincipalCV } from '@stacks/transactions';

const NETWORK = new StacksMainnet();
const DEFAULT_CONTRACT_NAME = 'tipper';

/** Basic runtime validation helper */
function requireContractAddress(contractAddress?: string) {
  if (!contractAddress || contractAddress.trim().length === 0) {
    throw new Error('contractAddress is required');
  }
}

/** Common app details used by openContractCall (update icon if you have one) */
const APP_DETAILS = {
  name: 'Tipper Frontend',
  icon: '', // optional URL to an icon
};

/**
 * Options accepted by each wrapper (all optional)
 */
export type TxOptions = {
  onFinish?: (payload: any) => void;
  onCancel?: (payload?: any) => void;
  // Additional options can be added here in the future (postConditionMode, etc.)
};

/**
 * Deposit an amount into the contract.
 * - `amount` should be a uint representation that the contract expects (e.g. micro-STX if you use micro units).
 */
export function deposit(contractAddress: string, amount: number, opts?: TxOptions) {
  requireContractAddress(contractAddress);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('amount must be a non-negative number');
  }

  return openContractCall({
    appDetails: APP_DETAILS,
    network: NETWORK,
    contractAddress,
    contractName: DEFAULT_CONTRACT_NAME,
    functionName: 'deposit',
    functionArgs: [uintCV(Math.floor(amount))],
    onFinish: opts?.onFinish,
    onCancel: opts?.onCancel,
  } as any);
}

/** Refund the caller's deposit (refund has no args) */
export function refund(contractAddress: string, opts?: TxOptions) {
  requireContractAddress(contractAddress);

  return openContractCall({
    appDetails: APP_DETAILS,
    network: NETWORK,
    contractAddress,
    contractName: DEFAULT_CONTRACT_NAME,
    functionName: 'refund',
    functionArgs: [],
    onFinish: opts?.onFinish,
    onCancel: opts?.onCancel,
  } as any);
}

/** Withdraw an amount (owner or beneficiary). */
export function withdraw(contractAddress: string, amount: number, opts?: TxOptions) {
  requireContractAddress(contractAddress);
  if (!Number.isFinite(amount) || amount < 0) {
    throw new Error('amount must be a non-negative number');
  }

  return openContractCall({
    appDetails: APP_DETAILS,
    network: NETWORK,
    contractAddress,
    contractName: DEFAULT_CONTRACT_NAME,
    functionName: 'withdraw',
    functionArgs: [uintCV(Math.floor(amount))],
    onFinish: opts?.onFinish,
    onCancel: opts?.onCancel,
  } as any);
}

/** Extend the lock (owner only). `newUnlock` is a uint block-time/unix-time depending on your contract usage. */
export function extendLock(contractAddress: string, newUnlock: number, opts?: TxOptions) {
  requireContractAddress(contractAddress);
  if (!Number.isFinite(newUnlock) || newUnlock < 0) {
    throw new Error('newUnlock must be a non-negative number');
  }

  return openContractCall({
    appDetails: APP_DETAILS,
    network: NETWORK,
    contractAddress,
    contractName: DEFAULT_CONTRACT_NAME,
    functionName: 'extend-lock',
    functionArgs: [uintCV(Math.floor(newUnlock))],
    onFinish: opts?.onFinish,
    onCancel: opts?.onCancel,
  } as any);
}

/** Add a beneficiary (owner only). `principal` should be a valid Stacks principal string (e.g. 'SP...' or 'ST...'). */
export function addBeneficiary(contractAddress: string, principal: string, opts?: TxOptions) {
  requireContractAddress(contractAddress);
  if (!principal || principal.trim().length === 0) {
    throw new Error('principal is required');
  }

  return openContractCall({
    appDetails: APP_DETAILS,
    network: NETWORK,
    contractAddress,
    contractName: DEFAULT_CONTRACT_NAME,
    functionName: 'add-beneficiary',
    functionArgs: [standardPrincipalCV(principal)],
    onFinish: opts?.onFinish,
    onCancel: opts?.onCancel,
  } as any);
}

/** Remove a beneficiary (owner only). `principal` should be a valid Stacks principal string. */
export function removeBeneficiary(contractAddress: string, principal: string, opts?: TxOptions) {
  requireContractAddress(contractAddress);
  if (!principal || principal.trim().length === 0) {
    throw new Error('principal is required');
  }

  return openContractCall({
    appDetails: APP_DETAILS,
    network: NETWORK,
    contractAddress,
    contractName: DEFAULT_CONTRACT_NAME,
    functionName: 'remove-beneficiary',
    functionArgs: [standardPrincipalCV(principal)],
    onFinish: opts?.onFinish,
    onCancel: opts?.onCancel,
  } as any);
}

/** Convenience default export */
const contract = {
  deposit,
  refund,
  withdraw,
  extendLock,
  addBeneficiary,
  removeBeneficiary,
};

export default contract;
