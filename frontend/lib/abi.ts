// ─── ABIs ─────────────────────────────────────────────────────────────────

export const FACTORY_ABI = [
  {
    "inputs": [
      { "name": "projectName", "type": "string" },
      { "name": "freelancer", "type": "address" },
      { "name": "descriptions", "type": "string[]" },
      { "name": "amounts", "type": "uint256[]" }
    ],
    "name": "createEscrow",
    "outputs": [{ "name": "escrow", "type": "address" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getAllEscrows",
    "outputs": [{ "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "freelancer", "type": "address" }],
    "name": "getEscrowsByFreelancer",
    "outputs": [{ "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "name": "client", "type": "address" }],
    "name": "getEscrowsByClient",
    "outputs": [{ "name": "", "type": "address[]" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTotalEscrowCount",
    "outputs": [{ "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": true, "name": "escrow", "type": "address" },
      { "indexed": true, "name": "client", "type": "address" },
      { "indexed": true, "name": "freelancer", "type": "address" },
      { "indexed": false, "name": "projectName", "type": "string" },
      { "indexed": false, "name": "totalAmount", "type": "uint256" }
    ],
    "name": "EscrowCreated",
    "type": "event"
  }
] as const;

export const ESCROW_ABI = [
  // ─── State readers
  { "inputs": [], "name": "projectName",  "outputs": [{ "type": "string" }],  "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "freelancer",   "outputs": [{ "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "client",       "outputs": [{ "type": "address" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "totalFunded",  "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "funded",       "outputs": [{ "type": "bool" }],    "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "cancelled",    "outputs": [{ "type": "bool" }],    "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "isComplete",   "outputs": [{ "type": "bool" }],    "stateMutability": "view", "type": "function" },
  { "inputs": [], "name": "getMilestoneCount", "outputs": [{ "type": "uint256" }], "stateMutability": "view", "type": "function" },
  {
    "inputs": [],
    "name": "getMilestones",
    "outputs": [{
      "components": [
        { "name": "description",    "type": "string"  },
        { "name": "amount",         "type": "uint256" },
        { "name": "deliverableUri", "type": "string"  },
        { "name": "submittedAt",    "type": "uint256" },
        { "name": "status",         "type": "uint8"   }
      ],
      "name": "",
      "type": "tuple[]"
    }],
    "stateMutability": "view",
    "type": "function"
  },
  // ─── Write functions
  {
    "inputs": [],
    "name": "fund",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "milestoneId",    "type": "uint256" },
      { "name": "deliverableUri", "type": "string"  }
    ],
    "name": "submit",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "milestoneId", "type": "uint256" }],
    "name": "approve",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "milestoneId", "type": "uint256" }],
    "name": "autoRelease",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "cancel",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
] as const;

export const ERC20_ABI = [
  {
    "inputs": [
      { "name": "spender", "type": "address" },
      { "name": "amount",  "type": "uint256" }
    ],
    "name": "approve",
    "outputs": [{ "type": "bool" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "name": "account", "type": "address" }],
    "name": "balanceOf",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "name": "owner",   "type": "address" },
      { "name": "spender", "type": "address" }
    ],
    "name": "allowance",
    "outputs": [{ "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;
