# MilestoneWork 🚀

> **Zero-Commission Milestone Escrow on Arc Blockchain**
> Built for the Arc Microgrant Program.

---

## ⚡ Risk-Free Testing on Arc Testnet

**You do NOT need real money or mainnet funds to test and deploy!** Arc has an official Testnet with a free USDC faucet.

### 🌐 Network Specifications

| Parameter | Arc Testnet (FREE TESTNET) | Arc Mainnet |
|---|---|---|
| **Network Name** | Arc Testnet | Arc Mainnet |
| **Chain ID** | `5042002` | `5042` |
| **RPC URL** | `https://rpc.testnet.arc.network` | `https://rpc.mainnet.arc.io` |
| **Currency** | USDC (Faucet available) | USDC |
| **Explorer** | [testnet.arcscan.app](https://testnet.arcscan.app) | [explorer.arc.io](https://explorer.arc.io) |

### 🚰 Free Testnet Faucet
Get free testnet USDC to fund transactions and gas:
👉 **[Circle Official Faucet](https://faucet.circle.com)** (Select Arc Testnet)

---

## 🏗️ Architecture

```
                                  +-----------------------+
                                  | MilestoneEscrowFactory |
                                  +-----------+-----------+
                                              |
                                      deploys / registers
                                              |
                                              v
                                   +---------------------+
                                   |   MilestoneEscrow   |
                                   |  (USDC Native L1)   |
                                   +----------+----------+
                                              |
               +------------------------------+------------------------------+
               |                                                             |
               v                                                             v
       [Client: Fund Escrow]                                      [Freelancer: Submit Deliverable]
               |                                                             |
               +----------------------------+--------------------------------+
                                            |
                                            v
                                [Client Approve & Release]
                                           OR
                                 [48h Auto-Release Fallback]
```

---

## 🚀 Quickstart & Deployment

### 1. Smart Contracts

```bash
cd contracts

# Run unit tests (100% passing)
forge test

# Deploy to Arc Testnet (FREE)
forge script script/Deploy.s.sol:DeployScript \
  --rpc-url https://rpc.testnet.arc.network \
  --private-key <YOUR_TESTNET_PRIVATE_KEY> \
  --broadcast
```

### 2. Frontend Web App

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Set your deployed factory address in `.env.local`:
```env
NEXT_PUBLIC_FACTORY_ADDRESS=0xYourDeployedFactoryAddress
```

---

## 🏆 Hackathon Submission Checklist

- [x] Smart contracts written in Solidity 0.8.24
- [x] 100% test pass rate in Foundry
- [x] Next.js 16 + Wagmi + Viem frontend built & verified
- [x] Arc Testnet support added for zero-risk testing
- [ ] Contract deployed to Arc Testnet or Mainnet & address configured
- [ ] Submitted to DoraHacks Arc Microgrant track
