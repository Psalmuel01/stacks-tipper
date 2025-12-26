/**
 * Ambient type declarations for minimal @stacks/* packages used in the frontend.
 *
 * These are intentionally lightweight and provide just enough typing to reduce
 * TypeScript noise for rapid development. Replace with full official types
 * (or `@types/...`) if/when you need stronger guarantees.
 *
 * File: wc-stacks/tipper/frontend/src/types/stacks.d.ts
 */

/* -------------------------------------------------------------------------- */
/* @stacks/connect                                                              */
/* -------------------------------------------------------------------------- */
declare module '@stacks/connect' {
  /**
   * Minimal shape for app details used by the connect APIs.
   */
  export interface AppDetails {
    name?: string;
    icon?: string;
  }

  /**
   * Options accepted by `showConnect`.
   * - `network` should be a Stacks network object (from @stacks/network).
   * - `onFinish` is invoked when the wallet flow completes successfully.
   * - `onCancel` is invoked if the user cancels the flow.
   *
   * The actual `showConnect` accepts more configuration; this covers the common props used here.
   */
  export interface ShowConnectOptions {
    appDetails?: AppDetails;
    network?: any;
    onFinish?: (payload?: any) => void;
    onCancel?: (payload?: any) => void;
    // Allow extra properties to be passed without type errors.
    [key: string]: any;
  }

  /**
   * Open the wallet connection/authorize flow.
   * This displays the wallet UI to the user.
   */
  export function showConnect(opts: ShowConnectOptions): void;

  /**
   * Options used by `openContractCall`.
   * This is a permissive type to allow commonly-used options without being strict.
   */
  export interface OpenContractCallOptions {
    appDetails?: AppDetails;
    network?: any;
    contractAddress?: string;
    contractName?: string;
    functionName?: string;
    functionArgs?: any[];
    postConditionMode?: any;
    onFinish?: (payload?: any) => void;
    onCancel?: (payload?: any) => void;
    // Allow additional wallet-specific options
    [key: string]: any;
  }

  /**
   * Open a contract-call transaction in the user's wallet. Returns a promise
   * that resolves when the wallet flow completes (the resolved shape can vary).
   */
  export function openContractCall(opts: OpenContractCallOptions): Promise<any>;
}

/* -------------------------------------------------------------------------- */
/* @stacks/network                                                              */
/* -------------------------------------------------------------------------- */
declare module '@stacks/network' {
  /**
   * Base network class: the runtime shape is opaque for our usage here.
   * We provide minimal constructors for commonly used classes.
   */
  export class StacksNetwork {
    constructor(opts?: Record<string, unknown>);
  }

  export class StacksMainnet extends StacksNetwork {
    constructor(opts?: Record<string, unknown>);
  }

  export class StacksTestnet extends StacksNetwork {
    constructor(opts?: Record<string, unknown>);
  }

  // Allow importing the default export if any package exposes it that way.
  const _default: {
    StacksNetwork: typeof StacksNetwork;
    StacksMainnet: typeof StacksMainnet;
    StacksTestnet: typeof StacksTestnet;
  };
  export default _default;
}

/* -------------------------------------------------------------------------- */
/* @stacks/transactions                                                         */
/* -------------------------------------------------------------------------- */
declare module '@stacks/transactions' {
  // A permissive alias for Clarity values (CVs). Use official types for
  // stricter guarantees when available.
  export type ClarityValue = any;

  /**
   * Create a uint Clarity value.
   * Accepts number or numeric-string; returns a ClarityValue representation.
   */
  export function uintCV(value: number | string): ClarityValue;

  /**
   * Create a standard principal Clarity value from a principal string.
   */
  export function standardPrincipalCV(principal: string): ClarityValue;

  /**
   * Convert a ClarityValue to a JS-friendly value.
   * (Simple placeholder; official library provides utilities to decode CVs.)
   */
  export function cvToValue(cv: ClarityValue): any;

  /**
   * Call a contract read-only function via the local network/wallet.
   *
   * Common usage:
   *   callReadOnlyFunction({
   *     contractAddress,
   *     contractName,
   *     functionName,
   *     functionArgs
   *   }, network);
   *
   * The return is a Promise resolving to the read-only result payload.
   */
  export function callReadOnlyFunction(
    options: {
      contractAddress: string;
      contractName: string;
      functionName: string;
      functionArgs?: ClarityValue[];
      senderAddress?: string;
    },
    network?: any
  ): Promise<any>;

  /**
   * Re-export any additional utility symbols you commonly use to avoid TS errors.
   * These are typed as `any` to be permissive; replace with concrete types as needed.
   */
  export const standardPrincipalCV: (p: string) => ClarityValue;
  export const bufferCV: (b: any) => ClarityValue;
  export const tupleCV: (t: Record<string, any>) => ClarityValue;
  export const trueCV: ClarityValue;
  export const falseCV: ClarityValue;
}

/* -------------------------------------------------------------------------- */
/* Fallback for deep imports                                                    */
/* -------------------------------------------------------------------------- */
/**
 * Some projects import modules from nested paths, e.g. '@stacks/connect/dist/...'.
 * To avoid `Cannot find module` in those cases, allow wildcard module names.
 */
declare module '@stacks/*' {
  const whatever: any;
  export default whatever;
}
