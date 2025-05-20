interface PhantomProvider {
  isPhantom: boolean;
  connect: () => Promise<{ publicKey: { toString: () => string } }>;
  disconnect: () => Promise<void>;
  isConnected: boolean;
  on: (event: string, callback: Function) => void;
  off: (event: string, callback: Function) => void;
}

interface Phantom {
  solana?: PhantomProvider;
}

interface Window {
  phantom?: Phantom;
}
