"use client";

import { motion, useReducedMotion } from "framer-motion";
import Link from "next/link";
import type { Route } from "next";

export type ConsentStatus = "pending" | "signed" | "revoked";

export interface ConsentRow {
  id: string;
  assetTitle: string;
  status: ConsentStatus;
  signedAt?: string;
  validUntil?: string; // ISO
  scope?: {
    channel?: boolean;
    social?: boolean;
    print?: boolean;
  };
  actionHref: string;
}

interface Props {
  pendingCount: number;
  items: ConsentRow[];
  viewAllHref?: string;
}

function daysUntil(iso?: string): number | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  return Math.round(ms / 86400000);
}

function scopeLabel(scope?: ConsentRow["scope"]): string {
  if (!scope) return "";
  const parts = [
    scope.channel && "Channel",
    scope.social && "Social",
    scope.print && "Print",
  ].filter(Boolean);
  return parts.join(" · ") || "Channel only";
}

function StatusPill({ row }: { row: ConsentRow }) {
  const days = daysUntil(row.validUntil);
  const expiringSoon = row.status === "signed" && days !== null && days >= 0 && days <= 30;

  const base = "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-widest";

  if (row.status === "pending") {
    return (
      <span className={`${base} border-[#E8C872]/50 bg-[#E8C872]/10 text-[#E8C872]`}>
        <span className="h-1.5 w-1.5 rounded-full bg-[#E8C872] animate-pulse" />
        Needs you
      </span>
    );
  }
  if (row.status === "revoked") {
    return (
      <span className={`${base} border-red-500/40 bg-red-500/10 text-red-300`}>
        Revoked
      </span>
    );
  }
  if (expiringSoon) {
    return (
      <span className={`${base} border-amber-400/40 bg-amber-400/10 text-amber-200`}>
        Renew in {days}d
      </span>
    );
  }
  return (
    <span className={`${base} border-emerald-500/40 bg-emerald-500/10 text-emerald-300`}>
      Active
    </span>
  );
}

export function ConsentList({ pendingCount, items, viewAllHref = "/parent/consent" }: Props) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <section aria-labelledby="consent-heading" className="space-y-5">
      <motion.div
        initial={prefersReducedMotion ? false : { opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-10%" }}
        transition={{ duration: 0.6 }}
        className="flex items-end justify-between gap-4 flex-wrap"
      >
        <div>
          <div className="text-[10px] tracking-[0.3em] text-[#E8C872]">CONSENT CENTER</div>
          <h3 id="consent-heading" className="serif mt-2 text-2xl font-bold">
            {pendingCount > 0
              ? `${pendingCount} item${pendingCount > 1 ? "s" : ""} awaiting your signature`
              : "Every recording properly consented"}
          </h3>
          <p className="text-sm text-[#8A8A96] mt-1 max-w-xl">
            Your child{"\u2019"}s work is only shared with your explicit permission. Review scope, expiry and status here.
          </p>
        </div>
        <Link
          href={viewAllHref as Route}
          className="rounded-lg border border-[#2A2A36] bg-[#15151C] px-4 py-2 text-xs tracking-widest text-[#C9C9D1] hover:border-[#E8C872]/40 hover:text-white transition-colors"
        >
          OPEN CENTER
        </Link>
      </motion.div>

      {items.length === 0 ? (
        <div className="rounded-2xl border border-[#2A2A36] bg-[#15151C] p-6 text-sm text-[#8A8A96]">
          No consent forms on record yet.
        </div>
      ) : (
        <motion.ul
          initial={prefersReducedMotion ? false : { opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.5 }}
          className="space-y-3"
        >
          {items.map((row, i) => (
            <motion.li
              key={row.id}
              initial={prefersReducedMotion ? false : { opacity: 0, x: -12 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-10%" }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
            >
              <Link
                href={row.actionHref as Route}
                className="flex items-center gap-4 rounded-xl border border-[#2A2A36] bg-[#15151C] px-5 py-4 hover:border-[#E8C872]/40 transition-colors"
              >
                <div className="flex-1 min-w-0">
                  <div className="serif text-base font-bold truncate">
                    {row.assetTitle}
                  </div>
                  <div className="mt-0.5 text-xs text-[#8A8A96]">
                    {scopeLabel(row.scope)}
                    {row.signedAt && (
                      <span> · signed {new Date(row.signedAt).toLocaleDateString("en-IN")}</span>
                    )}
                  </div>
                </div>
                <StatusPill row={row} />
                <span aria-hidden className="text-[#8A8A96]">
                  &rarr;
                </span>
              </Link>
            </motion.li>
          ))}
        </motion.ul>
      )}
    </section>
  );
}
