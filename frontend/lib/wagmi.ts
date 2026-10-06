import { http, createConfig } from "wagmi";
import { injected, metaMask } from "wagmi/connectors";
import { defineChain } from "viem";

// ─── Arc Testnet (Free Testnet Tokens via Faucet) ─────────────────────────
export const arcTestnet = defineChain({
  id: 5042002,
  name: "Arc Testnet",
  nativeCurrency: {
    decimals: 18,
    name: "USDC",
    symbol: "USDC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.testnet.arc.network"],
    },
  },
  blockExplorers: {
    default: {
      name: "ArcScan Testnet",
      url: "https://testnet.arcscan.app",
    },
  },
  testnet: true,
});

// ─── Arc Mainnet ───────────────────────────────────────────────────────────
export const arcMainnet = defineChain({
  id: 5042,
  name: "Arc Mainnet",
  nativeCurrency: {
    decimals: 18,
    name: "USDC",
    symbol: "USDC",
  },
  rpcUrls: {
    default: {
      http: ["https://rpc.mainnet.arc.io"],
    },
  },
  blockExplorers: {
    default: {
      name: "Arc Explorer",
      url: "https://explorer.arc.io",
    },
  },
});

// ─── USDC Contract on Arc (ERC-20 interface, 6 decimals) ──────────────────
export const USDC_ADDRESS = "0x3600000000000000000000000000000000000000" as `0x${string}`;

// ─── Factory Address (Update after deploying to Testnet or Mainnet) ──────
export const FACTORY_ADDRESS = (process.env.NEXT_PUBLIC_FACTORY_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`;

// ─── Wagmi Config (Arc Testnet set as primary for risk-free testing) ─────
export const wagmiConfig = createConfig({
  chains: [arcTestnet, arcMainnet],
  connectors: [
    injected(),
    metaMask(),
  ],
  transports: {
    [arcTestnet.id]: http("https://rpc.testnet.arc.network"),
    [arcMainnet.id]: http("https://rpc.mainnet.arc.io"),
  },
});
