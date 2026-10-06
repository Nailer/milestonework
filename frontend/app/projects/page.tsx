"use client";

import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";
import { useAccount, useReadContract } from "wagmi";
import { FACTORY_ABI, ESCROW_ABI } from "@/lib/abi";
import { FACTORY_ADDRESS } from "@/lib/wagmi";
import { useState } from "react";

// Mock projects for realistic preview before on-chain deployment
const MOCK_PROJECTS = [
  {
    address: "0x3A94b29C8B561271D12E278B452778A6d2c88451",
    projectName: "Arc Ecosystem Landing Page Redesign",
    client: "0x71C...4902",
    freelancer: "0x892...1109",
    totalAmount: "$2,500 USDC",
    status: "Funded",
    milestoneCount: 3,
    statusColor: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  {
    address: "0x7B21c8109F4d567119A208B1452994A1a4c90123",
    projectName: "Smart Contract Security Audit",
    client: "0x44B...9012",
    freelancer: "0x12A...9941",
    totalAmount: "$5,000 USDC",
    status: "In Progress",
    milestoneCount: 2,
    statusColor: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  {
    address: "0x9E41d90218A7631980A12498765412A098127411",
    projectName: "Python SDK Integration & Technical Docs",
    client: "0x991...3381",
    freelancer: "0x551...7781",
    totalAmount: "$1,200 USDC",
    status: "Completed",
    milestoneCount: 2,
    statusColor: "bg-purple-500/10 text-purple-400 border-purple-500/20",
  }
];

export default function ProjectsPage() {
  const { isConnected } = useAccount();

  // Query factory for real escrows if deployed
  const { data: allEscrows } = useReadContract({
    address: FACTORY_ADDRESS,
    abi: FACTORY_ABI,
    functionName: "getAllEscrows",
    query: {
      enabled: FACTORY_ADDRESS !== "0x0000000000000000000000000000000000000000",
    }
  });

  return (
    <main className="flex flex-col min-h-screen bg-gray-950 text-white">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center font-bold text-sm">M</div>
          <span className="font-semibold text-white">MilestoneWork</span>
        </Link>
        <div className="flex items-center gap-4">
          <Link href="/create" className="text-sm text-gray-300 hover:text-white transition-colors">
            + Create Project
          </Link>
          <ConnectButton />
        </div>
      </nav>

      {/* ── Header ──────────────────────────────────────────────────────── */}
      <section className="px-6 pt-32 pb-12 max-w-5xl mx-auto w-full">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">Explore Active Projects</h1>
            <p className="text-gray-400 text-sm">
              Discover trustless freelance escrow contracts on Arc Testnet & Mainnet.
            </p>
          </div>
          <Link
            href="/create"
            className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white text-sm font-semibold hover:opacity-90 transition-opacity flex items-center gap-2 self-start md:self-auto shadow-lg shadow-violet-500/20"
          >
            <span>+</span> Create New Project
          </Link>
        </div>
      </section>

      {/* ── Project Cards Grid ──────────────────────────────────────────── */}
      <section className="px-6 pb-20 max-w-5xl mx-auto w-full flex-1">
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {MOCK_PROJECTS.map((project) => (
            <div
              key={project.address}
              className="rounded-2xl bg-white/5 border border-white/5 hover:border-violet-500/30 p-6 flex flex-col justify-between gap-6 transition-all hover:-translate-y-1 group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${project.statusColor}`}>
                    {project.status}
                  </span>
                  <span className="text-xs font-mono text-gray-500">
                    {project.milestoneCount} Milestones
                  </span>
                </div>
                <h3 className="font-semibold text-lg text-white group-hover:text-violet-300 transition-colors mb-3 line-clamp-2">
                  {project.projectName}
                </h3>
                <div className="flex flex-col gap-1.5 text-xs text-gray-400 font-mono">
                  <div className="flex justify-between">
                    <span>Client:</span>
                    <span className="text-gray-300">{project.client}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Freelancer:</span>
                    <span className="text-gray-300">{project.freelancer}</span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-white/5 flex items-center justify-between">
                <div>
                  <div className="text-xs text-gray-500">Escrow Value</div>
                  <div className="text-base font-bold text-white">{project.totalAmount}</div>
                </div>
                <Link
                  href={`/project/${project.address}`}
                  className="px-3.5 py-1.5 rounded-lg bg-white/10 text-xs text-white hover:bg-white/20 transition-colors font-medium"
                >
                  View Escrow →
                </Link>
              </div>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
