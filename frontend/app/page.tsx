"use client";

import Link from "next/link";
import { ConnectButton } from "@/components/ConnectButton";

export default function HomePage() {
  return (
    <main className="flex flex-col min-h-screen">
      {/* ── Nav ─────────────────────────────────────────────────────────── */}
      <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6 py-4 bg-gray-950/80 backdrop-blur-md border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center font-bold text-sm">M</div>
          <span className="font-semibold text-white">MilestoneWork</span>
        </div>
        <ConnectButton />
      </nav>

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 pt-32 pb-20">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Live on Arc Mainnet
        </div>

        <h1 className="text-5xl sm:text-7xl font-bold tracking-tight text-white mb-6 max-w-3xl leading-tight">
          The freelance contract
          <br />
          <span className="bg-gradient-to-r from-violet-400 via-blue-400 to-cyan-400 bg-clip-text text-transparent">
            that pays itself.
          </span>
        </h1>

        <p className="text-gray-400 text-xl max-w-xl mb-10 leading-relaxed">
          Create milestone-based escrow contracts in seconds. Client approves work → USDC releases <strong className="text-white">instantly</strong>. No Upwork. No 20% cut. No trust required.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Link
            href="/create"
            className="px-8 py-4 rounded-xl bg-gradient-to-r from-violet-600 to-blue-600 text-white font-semibold text-lg hover:opacity-90 transition-opacity shadow-lg shadow-violet-500/25"
          >
            Create a Project
          </Link>
          <Link
            href="/projects"
            className="px-8 py-4 rounded-xl bg-white/5 border border-white/10 text-white font-semibold text-lg hover:bg-white/10 transition-colors"
          >
            View Projects
          </Link>
        </div>

        {/* Stats row */}
        <div className="flex gap-8 text-center">
          {[
            { label: "Platform fee", value: "0%" },
            { label: "Settlement time", value: "<1s" },
            { label: "Needed to use", value: "USDC only" },
          ].map((stat) => (
            <div key={stat.label}>
              <div className="text-2xl font-bold text-white">{stat.value}</div>
              <div className="text-sm text-gray-500 mt-1">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────────────────────────── */}
      <section className="px-4 py-20 max-w-5xl mx-auto w-full">
        <h2 className="text-3xl font-bold text-center text-white mb-12">How it works</h2>
        <div className="grid sm:grid-cols-4 gap-6">
          {[
            { step: "01", title: "Create project", desc: "Freelancer sets up milestones with USDC amounts. Shares link with client." },
            { step: "02", title: "Client funds", desc: "Client deposits USDC into escrow. Funds locked until milestones are approved." },
            { step: "03", title: "Submit work", desc: "Freelancer delivers, submits proof link on-chain for each milestone." },
            { step: "04", title: "Instant payment", desc: "Client approves → USDC lands in freelancer wallet in < 1 second." },
          ].map((item) => (
            <div key={item.step} className="rounded-2xl bg-white/5 border border-white/5 p-6 flex flex-col gap-3 hover:border-violet-500/30 transition-colors">
              <div className="text-xs font-mono text-violet-400 font-bold">{item.step}</div>
              <div className="font-semibold text-white">{item.title}</div>
              <p className="text-sm text-gray-400 leading-relaxed">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Why Arc ──────────────────────────────────────────────────────── */}
      <section className="px-4 py-20 bg-gradient-to-b from-gray-950 to-gray-900">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">Why Arc?</h2>
          <p className="text-gray-400 mb-12 max-w-xl mx-auto">Arc is the only chain where USDC is the native gas token. You only ever need USDC — nothing else.</p>
          <div className="grid sm:grid-cols-3 gap-6">
            {[
              { icon: "⚡", title: "Sub-second finality", desc: "Approved → paid. No waiting for block confirmations." },
              { icon: "🪙", title: "USDC only", desc: "Gas paid in USDC. No ETH juggling. One token does it all." },
              { icon: "🔒", title: "Trustless escrow", desc: "No middleman. Smart contract holds funds. 48h auto-release protects freelancers." },
            ].map((feat) => (
              <div key={feat.title} className="rounded-2xl bg-white/5 border border-white/5 p-6 text-left">
                <div className="text-3xl mb-3">{feat.icon}</div>
                <div className="font-semibold text-white mb-2">{feat.title}</div>
                <p className="text-sm text-gray-400">{feat.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/5 px-6 py-8 text-center text-sm text-gray-600">
        <p>MilestoneWork · Built on <a href="https://arc.io" className="text-violet-400 hover:underline" target="_blank" rel="noreferrer">Arc Mainnet</a> · Chain ID 5042</p>
      </footer>
    </main>
  );
}
