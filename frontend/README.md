# Tipper Frontend (React + TypeScript + Tailwind + @stacks/connect)

This frontend is a minimal scaffold to interact with the `tipper.clar` contract using Stacks (Mainnet) and `@stacks/connect`. It provides a simple UI shell with wallet connect flow and placeholders for the contract read / write operations. The intent is to let you quickly plug in contract-call logic and iterate.

Project location:
- `wc-stacks/tipper/frontend`

What I built for you so far
- A Vite + React + TypeScript app.
- Tailwind CSS base + some styles in `src/index.css`.
- Mainnet connect flow using `@stacks/connect` (see `src/main.tsx`).
- UI shell with inputs for the contract address and buttons for common actions (deposit, refund, withdraw, manage beneficiaries). These actions are currently placeholders in the shell; I show where to implement them.

Requirements
- Node 16+ (recommended)
- Yarn or npm
- A browser with a Stacks-compatible wallet extension (Hiro Wallet / Stacks Wallet) installed for Mainnet

Quick start

1. Install dependencies
```/dev/null/commands.sh#L1-3
# from the project frontend directory:
cd wc-stacks/tipper/frontend
npm install
```

2. Run the dev server
```/dev/null/commands.sh#L1-3
npm run dev
# open http://localhost:5173 (Vite will usually open it automatically)
```

3. Build for production
```/dev/null/commands.sh#L1-3
npm run build
npm run preview  # to locally preview the production build
```

Important files
- `package.json` — scripts and dependencies
  - You can view the project's package configuration in `wc-stacks/tipper/frontend/package.json`.
- `vite.config.ts` — Vite config and aliases
- `tailwind.config.cjs` & `src/index.css` — Tailwind setup and base styles
- `src/main.tsx` — App shell and @stacks/connect integration. We set `StacksMainnet` here.
  - Example: you can see the mainnet import in the file:
```wc-stacks/tipper/frontend/src/main.tsx#L1-20
import React from 'react';
import { createRoot } from 'react-dom/client';
import { showConnect } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';
import './index.css';
```

Configuring the contract address
- The app has an input that lets you set the contract address at runtime. It saves the value into `localStorage` under the key `tipper.contractAddress` so you can change contracts without rebuilding the app.
- I recommend deploying your `tipper.clar` contract to mainnet and then pasting the mainnet contract principal into the input in the UI.

Implementing the contract interactions (where to plug in)
- The app shell currently contains placeholders for action buttons (Deposit, Refund, Withdraw, Add beneficiary, Remove beneficiary).
- Use `@stacks/connect`'s `openContractCall` to create & send contract-call transactions from the browser. For read-only calls, use `callReadOnlyFunction` from `@stacks/transactions` (or a backend if you prefer).

A small example (how to call `deposit`):
```/dev/null/openContractCall-example.ts#L1-40
import { openContractCall } from '@stacks/connect';
import { StacksMainnet } from '@stacks/network';

/*
  This is a conceptual example — adapt types and parameters for your UI.
  - `contractAddress` should be the contract principal (e.g. ST...).
  - `contractName` is `tipper` (or the deployed contract name).
  - `functionArgs` must be constructed for Clarity arguments (uint, principal, etc).
*/

openContractCall({
  network: new StacksMainnet(),
  contractAddress: 'ST...YOUR_CONTRACT_ADDRESS',
  contractName: 'tipper',
  functionName: 'deposit',
  functionArgs: [
    // For a uint-typed argument, you can use standard helpers from @stacks/transactions.
    // Example: uintCV(1000000) for 1_000_000 microstx (if needed).
  ],
  onFinish: (data) => {
    console.log('Deposit finished', data);
  },
});
```

Notes about amounts
- Stacks transactions and the Clarity contract expect amounts in the contract's expected unit:
  - If the contract treats `amount` as `uint` representing micro-STX, convert accordingly.
  - Double-check how your `deposit` implementation expects amounts; many Stacks examples use micro-STX.

Reading contract state (read-only)
- Use `callReadOnlyFunction` from `@stacks/transactions` and pass the `contractAddress`, `contractName`, `functionName`, and arguments.
- Example read-only calls to implement:
  - `get-total-balance` -> show total STX in the contract
  - `get-unlock-time` -> show the unlock time
  - `is-unlocked` -> show if funds may be withdrawn
  - `get-user-deposit` -> pass connected user's principal

Where to place the logic
- I kept the initial wallet/connect logic in `src/main.tsx`. For better organization, create `src/api/contract.ts` for contract utilities (wrapping openContractCall, building args, parsing results).
- Use React hooks (e.g., `useEffect` + `useState`) to fetch read-only state after the wallet connects and the contract address is set.

Security & UX notes
- Never ask users for raw private keys in the browser. Use the wallet flow (`@stacks/connect`) which keeps keys in the wallet extension.
- Always validate amounts client-side before sending transactions.
- Consider verifying the contract source & address off-chain (e.g., via a backend) if you expect users to trust the contract address presented in the UI.

Tailwind and styling
- Tailwind is configured in `tailwind.config.cjs`. The base CSS entrypoint is `src/index.css`. If you need custom theming, edit the Tailwind config or extend variables in `index.css`.

Extending the UI
- Add a transactions feed by saving `onFinish` transaction IDs in local state and calling a Stacks API (like `https://stacks-node-api.mainnet.stacks.co`) to fetch transaction details and confirmations.
- Provide clearer UX for amounts (STX decimals) and for owner-only actions (hide or disable until the connected principal matches the owner).

Helpful file references
- App shell / connect: `wc-stacks/tipper/frontend/src/main.tsx`
- Styles: `wc-stacks/tipper/frontend/src/index.css`
- Tailwind config: `wc-stacks/tipper/frontend/tailwind.config.cjs`
- Package config: `wc-stacks/tipper/frontend/package.json`

If you want, I can:
- Implement full contract call handlers for all public functions in `tipper.clar` using `openContractCall` and `callReadOnlyFunction`.
- Add a `src/api/contract.ts` module with typed wrappers and a `useTipper` React hook.
- Wire transaction history fetching against the official Stacks API (mainnet).

Tell me which of those you want next, and I’ll add the concrete implementations.