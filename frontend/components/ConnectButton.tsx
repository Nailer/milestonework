"use client";

import { useAccount, useConnect, useDisconnect } from "wagmi";
import { arcMainnet } from "@/lib/wagmi";

export function ConnectButton() {
  const { address, isConnected, chain } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const isOnArc = chain?.id === arcMainnet.id;

  if (!isConnected) {
    return (
      <button
        onClick={() => connect({ connector: connectors[0] })}
        className="px-4 py-2 rounded-lg bg-violet-600 hover:bg-violet-500 text-white text-sm font-semibold transition-colors"
      >
        Connect Wallet
      </button>
    );
  }

  if (!isOnArc) {
    return (
      <div className="flex items-center gap-2">
        <span className="text-amber-400 text-sm font-medium">⚠ Wrong network</span>
        <button
          onClick={() => disconnect()}
          className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 text-sm transition-colors"
        >
          Disconnect
        </button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
        <span className="text-sm text-gray-300 font-mono">{address?.slice(0, 6)}…{address?.slice(-4)}</span>
      </div>
      <button
        onClick={() => disconnect()}
        className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-400 text-sm transition-colors"
      >
        Disconnect
      </button>
    </div>
  );
}
