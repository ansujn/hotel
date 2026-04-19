"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";

export type FeeStatus = "paid" | "due" | "overdue";

export interface FeeRow {
  id: string;
  period: string;
  amountPaise: number;
  status: "paid" | "created" | "failed" | string;
  createdAt: string;
}

interface Props {
  status: FeeStatus;
  currentPeriod?: string;
  amountPaise?: number;
  nextDueOn?: string;
  payHref?: string; // we link to /parent/fees for actual payment
  recentPayments: FeeRow[];
}

function formatRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(paise / 100);
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  } catch {
    return iso;
  }
}

export function FeesCard({
  status,
  currentPeriod,
  amountPaise,
  nextDueOn,
  payHref = "/parent/fees",
  recentPayments,
}: Props) {
  const prefersReducedMotion = useReducedMotion();

  const accent =
    status === "paid"
      ? "emerald"
      : status === "overdue"
      ? "red"
      : "amber";

  const palette = {
    emerald: {
      border: "border-emerald-500/40",
      bg: "bg-emerald-500/5",
      pill: "bg-emerald-500/15 text-emerald-300 border-emerald-500/40",
      dot: "bg-emerald-400",
      label: "Paid up",
    },
    amber: {
      border: "border-[#E8C872]/40",
      bg: "bg-[#E8C872]/5",
      pill: "bg-[#E8C872]/15 text-[#E8C872] border-[#E8C872]/40",
      dot: "bg-[#E8C872]",
      label: "Payment due",
    },
    red: {
      border: "border-red-500/40",
      bg: "bg-red-500/5",
      pill: "bg-red-500/15 text-red-300 border-red-500/40",
      dot: "bg-red-400",
      label: "Overdue",
    },
  }[accent];

  return (
    <motion.section
      initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-10%" }}
      transition={{ duration: 0.6 }}
      aria-labelledby="fees-heading"
      className={`rounded-2xl border ${palette.border} ${palette.bg} overflow-hidden`}
    >
      <div className="p-6 md:p-8">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <div className="text-[10px] tracking-[0.3em] text-[#E8C872]">FEES</div>
            <h3 id="fees-heading" className="serif mt-2 text-2xl font-bold">
              {status === "paid"
                ? "All fees current. Thank you."
                : status === "overdue"
                ? `Overdue: ${currentPeriod ?? ""}`
                : `Due for ${currentPeriod ?? "this term"}`}
            </h3>
            {status === "paid" && nextDueOn && (
              <p className="text-sm text-[#8A8A96] mt-1">
                Next instalment on <span className="text-[#C9C9D1]">{formatDate(nextDueOn)}</span>.
              </p>
            )}
            {status !== "paid" && amountPaise && (
              <div className="mt-4 flex items-baseline gap-3">
                <div className="serif text-4xl font-black text-[#F5F5F7]">
                  {formatRupees(amountPaise)}
                </div>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-widest ${palette.pill}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${palette.dot}`} />
                  {palette.label}
                </span>
              </div>
            )}
          </div>

          {status !== "paid" && (
            <Link
              href={payHref as Route}
              className="shrink-0 rounded-xl bg-[#E8C872] px-6 py-3 text-sm font-semibold text-black hover:bg-[#f0d589] shadow-[0_10px_25px_-10px_rgba(232,200,114,0.6)] transition-colors"
            >
              Pay now &rarr;
            </Link>
          )}
          {status === "paid" && (
            <Link
              href={payHref as Route}
              className="shrink-0 rounded-xl border border-[#2A2A36] px-5 py-2.5 text-xs tracking-widest text-[#C9C9D1] hover:border-[#E8C872]/40 hover:text-white transition-colors"
            >
              VIEW HISTORY
            </Link>
          )}
        </div>
      </div>

      {recentPayments.length > 0 && (
        <div className="border-t border-[#2A2A36]/70 bg-[#0B0B0F]/40">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[10px] tracking-[0.3em] text-[#8A8A96]">
                <th className="px-6 py-3 font-medium">DATE</th>
                <th className="px-6 py-3 font-medium">PERIOD</th>
                <th className="px-6 py-3 font-medium text-right">AMOUNT</th>
                <th className="px-6 py-3 font-medium">STATUS</th>
              </tr>
            </thead>
            <tbody>
              {recentPayments.slice(0, 4).map((p) => (
                <tr key={p.id} className="border-t border-[#2A2A36]/60">
                  <td className="px-6 py-3 text-[#C9C9D1]">
                    {formatDate(p.createdAt)}
                  </td>
                  <td className="px-6 py-3 text-[#C9C9D1]">{p.period}</td>
                  <td className="px-6 py-3 text-right font-medium text-[#F5F5F7]">
                    {formatRupees(p.amountPaise)}
                  </td>
                  <td className="px-6 py-3">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] uppercase tracking-wider ${
                        p.status === "paid"
                          ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                          : p.status === "failed"
                          ? "border-red-500/40 bg-red-500/10 text-red-300"
                          : "border-[#E8C872]/40 bg-[#E8C872]/10 text-[#E8C872]"
                      }`}
                    >
                      {p.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </motion.section>
  );
}
