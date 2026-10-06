"use client";

import { useParams } from "next/navigation";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { formatUnits, parseUnits } from "viem";
import Link from "next/link";
import { useState } from "react";
import { ConnectButton } from "@/components/ConnectButton";
import { ESCROW_ABI, ERC20_ABI } from "@/lib/abi";
import { USDC_ADDRESS } from "@/lib/wagmi";

const STATUS_LABELS = ["Pending", "Funded", "Submitted", "Released", "Refunded"];
const STATUS_COLORS = [
  "text-gray-400",
  "text-blue-400",
  "text-amber-400",
  "text-emerald-400",
  "text-red-400",
];

// Fallback mock projects for rich preview
const MOCK_DATA: Record<string, any> = {
  "0x3A94b29C8B561271D12E278B452778A6d2c88451": {
    projectName: "Arc Ecosystem Landing Page Redesign",
    freelancer: "0x89205A3A3b2b0011C9024B10928a56214A110900",
    client: "0x71C809278912A349022201991823772819020000",
    totalFunded: BigInt(2500000000), // $2,500 USDC
    funded: true,
    cancelled: false,
    milestones: [
      { description: "Figma UI/UX Mockups & Design System", amount: BigInt(800000000), deliverableUri: "https://figma.com/file/arc-landing-design", submittedAt: 1728000000, status: 3 },
      { description: "Next.js & Tailwind CSS Frontend Implementation", amount: BigInt(1000000000), deliverableUri: "https://github.com/arc/landing/pull/1", submittedAt: 1728100000, status: 2 },
      { description: "Final QA, Mobile Optimization & Mainnet Deployment", amount: BigInt(700000000), deliverableUri: "", submittedAt: 0, status: 1 },
    ]
  }
};

export default function ProjectPage() {
  const params = useParams();
  const escrowAddress = params.address as `0x${string}`;
  const { address: userAddress, isConnected } = useAccount();

  const [submitUri, setSubmitUri] = useState("");
  const [activeSubmitId, setActiveSubmitId] = useState<number | null>(null);
  const [txError, setTxError] = useState<string | null>(null);

  // ── Contract reads ────────────────────────────────────────────────────────
  const { data: rawProjectName } = useReadContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "projectName" });
  const { data: rawFreelancer }  = useReadContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "freelancer" });
  const { data: rawClient }      = useReadContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "client" });
  const { data: rawTotalFunded } = useReadContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "totalFunded" });
  const { data: rawIsFunded }    = useReadContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "funded" });
  const { data: rawIsCancelled } = useReadContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "cancelled" });
  const { data: rawMilestones, refetch: refetchMilestones } = useReadContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "getMilestones" });
  
  const { data: usdcAllowance, refetch: refetchAllowance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "allowance",
    args: userAddress ? [userAddress, escrowAddress] : undefined,
    query: { enabled: !!userAddress },
  });
  const { data: usdcBalance } = useReadContract({
    address: USDC_ADDRESS,
    abi: ERC20_ABI,
    functionName: "balanceOf",
    args: userAddress ? [userAddress] : undefined,
    query: { enabled: !!userAddress },
  });

  // Fallback to mock data if contract is not deployed on this address
  const fallback = MOCK_DATA[escrowAddress] || MOCK_DATA["0x3A94b29C8B561271D12E278B452778A6d2c88451"];

  const projectName = (rawProjectName as string) || fallback.projectName;
  const freelancer  = (rawFreelancer as string) || fallback.freelancer;
  const client      = (rawClient as string) || fallback.client;
  const totalFunded = (rawTotalFunded as bigint) || fallback.totalFunded;
  const isFunded    = rawIsFunded !== undefined ? (rawIsFunded as boolean) : fallback.funded;
  const isCancelled = rawIsCancelled !== undefined ? (rawIsCancelled as boolean) : fallback.cancelled;
  const milestones  = (rawMilestones as any[]) || fallback.milestones;

  // ── Contract writes ───────────────────────────────────────────────────────
  const { writeContract, data: txHash, isPending } = useWriteContract();
  const { isLoading: isConfirming } = useWaitForTransactionReceipt({
    hash: txHash,
    onReplaced: () => { refetchMilestones(); refetchAllowance(); },
  });

  const isClient     = userAddress?.toLowerCase() === client?.toLowerCase();
  const isFreelancer = userAddress?.toLowerCase() === freelancer?.toLowerCase();

  const needsApproval = totalFunded && usdcAllowance !== undefined && usdcAllowance < totalFunded;

  const handleApproveUsdc = () => {
    if (!totalFunded) return;
    writeContract({
      address: USDC_ADDRESS,
      abi: ERC20_ABI,
      functionName: "approve",
      args: [escrowAddress, totalFunded],
    });
  };

  const handleFund = () => {
    writeContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "fund" });
  };

  const handleSubmit = (milestoneId: number) => {
    if (!submitUri.trim()) { setTxError("Please enter a deliverable link or description"); return; }
    setTxError(null);
    writeContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "submit", args: [BigInt(milestoneId), submitUri.trim()] });
    setActiveSubmitId(null);
    setSubmitUri("");
  };

  const handleApprove = (milestoneId: number) => {
    writeContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "approve", args: [BigInt(milestoneId)] });
  };

  const handleAutoRelease = (milestoneId: number) => {
    writeContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "autoRelease", args: [BigInt(milestoneId)] });
  };

  const handleCancel = () => {
    writeContract({ address: escrowAddress, abi: ESCROW_ABI, functionName: "cancel" });
  };

  const totalUSDC = totalFunded ? parseFloat(formatUnits(totalFunded, 6)) : 0;
  const releasedUSDC = milestones
    ? milestones.filter((m: any) => m.status === 3).reduce((s: number, m: any) => s + parseFloat(formatUnits(m.amount, 6)), 0)
    : 0;
  const progressPct = totalUSDC > 0 ? (releasedUSDC / totalUSDC) * 100 : 0;

  return (
    <div className="min-h-screen px-4 py-16 bg-gray-950 text-white">
      {/* Nav */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center font-bold text-sm">M</div>
          <span className="font-semibold text-white">MilestoneWork</span>
        </Link>
        <ConnectButton />
      </nav>

      <div className="max-w-2xl mx-auto pt-20 space-y-6">
        {/* Header card */}
        <div className="rounded-2xl bg-white/5 border border-white/10 p-6">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h1 className="text-2xl font-bold text-white">{projectName}</h1>
              <p className="text-sm text-gray-500 mt-1 font-mono break-all">{escrowAddress}</p>
            </div>
            <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
              isCancelled ? "bg-red-500/10 border-red-500/30 text-red-400" :
              isFunded    ? "bg-blue-500/10 border-blue-500/30 text-blue-400" :
                            "bg-gray-500/10 border-gray-500/30 text-gray-400"
            }`}>
              {isCancelled ? "Cancelled" : isFunded ? "Funded" : "Awaiting Funding"}
            </div>
          </div>

          {/* Progress */}
          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Escrow Progress</span>
              <span className="text-white font-semibold">${releasedUSDC.toFixed(2)} / ${totalUSDC.toFixed(2)} USDC released</span>
            </div>
            <div className="h-2 bg-white/10 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-violet-500 to-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-gray-500">Client</span>
              <div className="text-gray-300 font-mono text-xs mt-0.5">{client ? `${client.slice(0,10)}…` : "—"}</div>
            </div>
            <div>
              <span className="text-gray-500">Freelancer</span>
              <div className="text-gray-300 font-mono text-xs mt-0.5">{freelancer ? `${freelancer.slice(0,10)}…` : "—"}</div>
            </div>
          </div>
        </div>

        {/* Fund action (client only) */}
        {isClient && !isFunded && !isCancelled && (
          <div className="rounded-2xl bg-blue-500/5 border border-blue-500/20 p-6">
            <h3 className="font-semibold text-white mb-2">Fund the escrow</h3>
            <p className="text-sm text-gray-400 mb-4">
              Deposit <strong className="text-white">${totalUSDC.toFixed(2)} USDC</strong> to lock in escrow. Funds are only released when you approve milestones.
            </p>
            {usdcBalance !== undefined && (
              <p className="text-xs text-gray-500 mb-4">Your balance: {parseFloat(formatUnits(usdcBalance, 6)).toFixed(2)} USDC</p>
            )}
            {needsApproval ? (
              <button
                onClick={handleApproveUsdc}
                disabled={isPending || isConfirming}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending || isConfirming ? "Processing…" : "Step 1: Approve USDC"}
              </button>
            ) : (
              <button
                onClick={handleFund}
                disabled={isPending || isConfirming}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {isPending || isConfirming ? "Funding…" : `Fund $${totalUSDC.toFixed(2)} USDC`}
              </button>
            )}
          </div>
        )}

        {/* Milestones */}
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-white">Milestones</h2>
          {milestones?.map((m: any, i: number) => (
            <div key={i} className="rounded-2xl bg-white/5 border border-white/5 p-5 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5 ${
                    m.status === 3 ? "bg-emerald-500/20 text-emerald-400" :
                    m.status === 2 ? "bg-amber-500/20 text-amber-400" :
                    m.status === 1 ? "bg-blue-500/20 text-blue-400" :
                    "bg-gray-500/20 text-gray-400"
                  }`}>{i + 1}</div>
                  <div>
                    <div className="font-medium text-white">{m.description}</div>
                    <div className={`text-xs mt-0.5 ${STATUS_COLORS[m.status]}`}>{STATUS_LABELS[m.status]}</div>
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="font-semibold text-white">${parseFloat(formatUnits(m.amount, 6)).toFixed(2)}</div>
                  <div className="text-xs text-gray-500">USDC</div>
                </div>
              </div>

              {/* Deliverable */}
              {m.deliverableUri && (
                <div className="bg-white/5 rounded-lg px-3 py-2 text-xs text-gray-400 break-all">
                  📎 {m.deliverableUri}
                </div>
              )}

              {/* Auto-release countdown */}
              {m.status === 2 && m.submittedAt > 0 && (
                <div className="text-xs text-amber-400/70">
                  Auto-releases 48h after submission
                </div>
              )}

              {/* Actions */}
              <div className="space-y-2">
                {/* Freelancer: submit */}
                {isFreelancer && isFunded && m.status === 1 && !isCancelled && (
                  activeSubmitId === i ? (
                    <div className="space-y-2">
                      <input
                        value={submitUri}
                        onChange={e => setSubmitUri(e.target.value)}
                        placeholder="Paste link, IPFS hash, or description of your deliverable…"
                        className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-violet-500"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleSubmit(i)}
                          disabled={isPending || isConfirming}
                          className="flex-1 py-2 rounded-lg bg-amber-500/20 border border-amber-500/30 text-amber-400 text-sm font-medium hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                        >
                          Submit Work
                        </button>
                        <button onClick={() => { setActiveSubmitId(null); setSubmitUri(""); }} className="px-4 py-2 rounded-lg bg-white/5 text-gray-400 text-sm hover:bg-white/10 transition-colors">
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => setActiveSubmitId(i)}
                      className="w-full py-2 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-sm font-medium hover:bg-amber-500/20 transition-colors"
                    >
                      Submit deliverable
                    </button>
                  )
                )}

                {/* Client: approve */}
                {isClient && m.status === 2 && !isCancelled && (
                  <button
                    onClick={() => handleApprove(i)}
                    disabled={isPending || isConfirming}
                    className="w-full py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
                  >
                    {isPending || isConfirming ? "Releasing…" : "✓ Approve & Release USDC"}
                  </button>
                )}

                {/* Auto-release button */}
                {m.status === 2 && m.submittedAt > 0 && (
                  <button
                    onClick={() => handleAutoRelease(i)}
                    disabled={isPending || isConfirming || Number(m.submittedAt) + 48 * 3600 > Math.floor(Date.now() / 1000)}
                    className="w-full py-2 rounded-lg bg-white/5 border border-white/5 text-gray-500 text-xs hover:bg-white/10 transition-colors disabled:opacity-50"
                  >
                    Auto-release (48h protection)
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {txError && (
          <div className="rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">{txError}</div>
        )}

        {/* Cancel */}
        {!isCancelled && (isClient || isFreelancer) && (
          <div className="pt-2">
            <button
              onClick={handleCancel}
              disabled={isPending || isConfirming}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              Cancel project (refund client)
            </button>
          </div>
        )}

        {/* Share */}
        <div className="rounded-2xl bg-white/5 border border-white/5 p-5">
          <div className="text-sm font-medium text-gray-300 mb-2">Share this escrow</div>
          <div className="flex gap-2">
            <code className="flex-1 bg-white/5 rounded-lg px-3 py-2 text-xs text-violet-300 break-all">
              {typeof window !== "undefined" ? window.location.href : ""}
            </code>
            <button
              onClick={() => typeof window !== "undefined" && navigator.clipboard.writeText(window.location.href)}
              className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm text-white transition-colors flex-shrink-0"
            >
              Copy Link
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
