// Minimal React + JSX shims to silence TypeScript missing-type errors in the frontend.
// Place at: wc-stacks/tipper/frontend/src/types/react-shims.d.ts
//
// This file provides lightweight ambient declarations for `react`, `react/jsx-runtime`,
// and `react-dom/client` as well as the global `JSX` namespace. It is intentionally
// permissive (uses `any`) so you can iterate without installing `@types/react`.
// Replace with proper types (`npm i -D @types/react @types/react-dom`) for stronger checks.

declare namespace React {
  // Basic commonly used React types (permissive)
  type ReactNode = any;
  type Key = string | number;
  type Ref<T = any> = any;

  interface Attributes {
    key?: Key;
  }

  interface ClassAttributes<T> extends Attributes {
    ref?: Ref<T>;
  }

  type PropsWithChildren<P> = P & { children?: ReactNode };

  type FC<P = {}> = (props: PropsWithChildren<P>) => any;
  type FunctionComponent<P = {}> = FC<P>;

  type ComponentType<P = {}> = any;
  type ComponentClass<P = {}, S = any> = any;

  interface DOMAttributes<T> {
    [key: string]: any;
  }

  const Fragment: any;
  const StrictMode: any;
  const Profiler: any;
  const Suspense: any;
  const createElement: any;
  const cloneElement: any;
  const isValidElement: any;
  const useState: any;
  const useEffect: any;
  const useRef: any;
  const useCallback: any;
  const useMemo: any;
  const useContext: any;
  const useReducer: any;
  const useLayoutEffect: any;
  const useImperativeHandle: any;
  const createContext: any;
  const forwardRef: any;
  const memo: any;
  const Children: any;
  const FragmentSymbol: any;
}

declare module 'react' {
  export = React;
}

declare module 'react/jsx-runtime' {
  // JSX runtime helpers used by modern TSX transforms
  export function jsx(type: any, props?: any, key?: any): any;
  export function jsxs(type: any, props?: any, key?: any): any;
  export function jsxDEV(type: any, props?: any, key?: any, isStaticChildren?: any, source?: any, self?: any): any;
  export const Fragment: any;
  export default { jsx, jsxs, jsxDEV, Fragment };
}

declare module 'react-dom/client' {
  // Minimal typing for `createRoot` used in modern React entrypoints.
  export function createRoot(container: Element | DocumentFragment | any): {
    render(element: any): void;
    unmount(): void;
  };
}

// Provide a permissive global JSX namespace so TSX/JSX expressions type-check.
declare global {
  namespace JSX {
    // The return type for JSX expressions (React elements, etc.)
    interface Element { [key: string]: any }

    // Allow any intrinsic element names with arbitrary props.
    interface IntrinsicElements {
      [elemName: string]: any;
    }

    // When using class components, TS will look for this interface on the class
    interface ElementClass { }

    // Use `props` property to extract attributes from components:
    interface ElementAttributesProperty { props: any }

    // Use `children` property name for children extraction
    interface ElementChildrenAttribute { children: {} }
  }
}

// If this file is included as a module, ensure these declarations are visible.
export {};
