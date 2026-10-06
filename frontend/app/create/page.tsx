"use client";

import { useState } from "react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, usePublicClient } from "wagmi";
import { parseUnits } from "viem";
import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { FACTORY_ABI } from "@/lib/abi";
import { arcMainnet } from "@/lib/wagmi";

// ── Replace with your deployed factory address after running forge deploy ──
const FACTORY_ADDRESS = process.env.NEXT_PUBLIC_FACTORY_ADDRESS as `0x${string}`;

interface MilestoneInput {
  description: string;
  amount: string;
}

export default function CreatePage() {
  const { isConnected, chain } = useAccount();
  const isOnArc = chain?.id === arcMainnet.id;
  const publicClient = usePublicClient();

  const [projectName, setProjectName] = useState("");
  const [freelancerAddress, setFreelancerAddress] = useState("");
  const [milestones, setMilestones] = useState<MilestoneInput[]>([
    { description: "", amount: "" },
    { description: "", amount: "" },
  ]);
  const [createdEscrow, setCreatedEscrow] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash: txHash });

  const totalAmount = milestones.reduce((sum, m) => {
    const val = parseFloat(m.amount) || 0;
    return sum + val;
  }, 0);

  const addMilestone = () => setMilestones([...milestones, { description: "", amount: "" }]);
  const removeMilestone = (i: number) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter((_, idx) => idx !== i));
  };
  const updateMilestone = (i: number, field: keyof MilestoneInput, value: string) => {
    setMilestones(milestones.map((m, idx) => idx === i ? { ...m, [field]: value } : m));
  };

  const handleCreate = async () => {
    setError(null);
    if (!projectName.trim()) { setError("Project name required"); return; }
    if (!freelancerAddress.startsWith("0x") || freelancerAddress.length !== 42) { setError("Valid freelancer address required"); return; }
    if (milestones.some(m => !m.description.trim() || !m.amount || parseFloat(m.amount) <= 0)) {
      setError("All milestones need a description and amount > 0"); return;
    }

    const descriptions = milestones.map(m => m.description.trim());
    // USDC has 6 decimals on Arc
    const amounts = milestones.map(m => parseUnits(m.amount, 6));

    writeContract({
      address: FACTORY_ADDRESS,
      abi: FACTORY_ABI,
      functionName: "createEscrow",
      args: [projectName.trim(), freelancerAddress as `0x${string}`, descriptions, amounts],
    });
  };

  // Parse escrow address from tx receipt logs
  if (isSuccess && txHash && !createdEscrow && publicClient) {
    publicClient.getTransactionReceipt({ hash: txHash }).then((receipt) => {
      const log = receipt.logs.find(l => l.topics[0]);
      if (log) {
        // EscrowCreated event: first topic after event sig is escrow address (indexed)
        const escrowAddr = "0x" + log.topics[1]?.slice(26);
        if (escrowAddr && escrowAddr.length === 42) {
          setCreatedEscrow(escrowAddr);
        }
      }
    });
  }

  if (!isConnected || !isOnArc) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4">
        <p className="text-gray-400 text-lg text-center">Connect your wallet on <strong className="text-white">Arc Mainnet</strong> to create a project.</p>
        <ConnectButton />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-16">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center font-bold text-sm">M</div>
          <span className="font-semibold text-white">MilestoneWork</span>
        </Link>
        <ConnectButton />
      </nav>

      <div className="max-w-2xl mx-auto pt-20">
        <h1 className="text-3xl font-bold text-white mb-2">Create a project</h1>
        <p className="text-gray-400 mb-8">Set up milestones, share the link with your client. They fund USDC — you get paid on approval.</p>

        {/* Success state */}
        {createdEscrow && (
          <div className="rounded-2xl bg-emerald-500/10 border border-emerald-500/30 p-6 mb-8">
            <div className="text-emerald-400 font-semibold mb-2">🎉 Project created!</div>
            <p className="text-sm text-gray-400 mb-4">Share this link with your client so they can fund the escrow:</p>
            <div className="flex gap-2">
              <code className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-sm text-violet-300 break-all">
                {typeof window !== "undefined" ? `${window.location.origin}/project/${createdEscrow}` : `/project/${createdEscrow}`}
              </code>
              <button
                onClick={() => navigator.clipboard.writeText(`${window.location.origin}/project/${createdEscrow}`)}
                className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition-colors"
              >
                Copy
              </button>
            </div>
            <Link href={`/project/${createdEscrow}`} className="inline-block mt-4 text-sm text-violet-400 hover:underline">
              View project →
            </Link>
          </div>
        )}

        {!createdEscrow && (
          <div className="space-y-6">
            {/* Project name */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Project name</label>
              <input
                value={projectName}
                onChange={e => setProjectName(e.target.value)}
                placeholder="Website redesign, Logo package…"
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Freelancer address */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Freelancer wallet address</label>
              <input
                value={freelancerAddress}
                onChange={e => setFreelancerAddress(e.target.value)}
                placeholder="0x..."
                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-600 font-mono text-sm focus:outline-none focus:border-violet-500 transition-colors"
              />
            </div>

            {/* Milestones */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <label className="text-sm font-medium text-gray-300">Milestones</label>
                <button onClick={addMilestone} className="text-xs text-violet-400 hover:text-violet-300 transition-colors">
                  + Add milestone
                </button>
              </div>
              <div className="space-y-3">
                {milestones.map((m, i) => (
                  <div key={i} className="flex gap-3 items-start bg-white/5 border border-white/5 rounded-xl p-4">
                    <div className="flex-shrink-0 w-6 h-6 rounded-full bg-violet-500/20 text-violet-400 text-xs flex items-center justify-center font-bold mt-0.5">
                      {i + 1}
                    </div>
                    <div className="flex-1 flex gap-3">
                      <input
                        value={m.description}
                        onChange={e => updateMilestone(i, "description", e.target.value)}
                        placeholder="Description (e.g. First draft)"
                        className="flex-1 bg-transparent border-b border-white/10 pb-1 text-white placeholder-gray-600 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                      />
                      <div className="flex items-center gap-1 border-b border-white/10 pb-1 flex-shrink-0">
                        <span className="text-gray-600 text-sm">$</span>
                        <input
                          type="number"
                          value={m.amount}
                          onChange={e => updateMilestone(i, "amount", e.target.value)}
                          placeholder="0.00"
                          className="w-20 bg-transparent text-white text-sm text-right focus:outline-none"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-gray-600 text-xs">USDC</span>
                      </div>
                    </div>
                    {milestones.length > 1 && (
                      <button onClick={() => removeMilestone(i)} className="text-gray-600 hover:text-red-400 transition-colors text-xs flex-shrink-0 mt-1">
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Total */}
            <div className="flex justify-between items-center rounded-xl bg-white/5 px-4 py-3">
              <span className="text-sm text-gray-400">Total to lock in escrow</span>
              <span className="font-bold text-white text-lg">${totalAmount.toFixed(2)} <span className="text-sm font-normal text-gray-400">USDC</span></span>
            </div>

            {error && (
              <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">{error}</div>
            )}

            <button
              onClick={handleCreate}
              disabled={isPending || isConfirming}
              className="w-full py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Confirm in wallet…" : isConfirming ? "Creating project…" : "Create Project"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
