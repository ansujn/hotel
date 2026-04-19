"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import type { Asset, AssetType, AssetPrivacy } from "@/lib/channel";
import { AssetCard } from "./asset-card";
import { Button } from "@/components/Button";
import Link from "next/link";
import type { Route } from "next";

type TypeFilter = AssetType | "all";
type PrivacyFilter = AssetPrivacy | "all";

interface Props {
  assets: Asset[];
  channelId: string;
  canSeePrivacy: boolean;
  canScore: boolean;
  canUpload: boolean;
  uploadHref: string;
  viewerLabel: "self" | "staff" | "parent" | "public";
}

const TYPE_CHIPS: readonly { key: TypeFilter; label: string }[] = [
  { key: "all", label: "All work" },
  { key: "monologue", label: "Monologues" },
  { key: "scene", label: "Scenes" },
  { key: "showcase", label: "Showcases" },
  { key: "catalog", label: "Catalog" },
];

const PRIVACY_CHIPS: readonly { key: PrivacyFilter; label: string }[] = [
  { key: "all", label: "Every status" },
  { key: "public", label: "Public" },
  { key: "pending_consent", label: "Pending" },
  { key: "private", label: "Private" },
];

export function AssetGrid({
  assets,
  channelId,
  canSeePrivacy,
  canScore,
  canUpload,
  uploadHref,
  viewerLabel,
}: Props) {
  const [type, setType] = useState<TypeFilter>("all");
  const [privacy, setPrivacy] = useState<PrivacyFilter>("all");

  const counts = useMemo(() => {
    const out: Record<TypeFilter, number> = {
      all: assets.length,
      monologue: 0,
      scene: 0,
      showcase: 0,
      catalog: 0,
    };
    for (const a of assets) out[a.type] = (out[a.type] ?? 0) + 1;
    return out;
  }, [assets]);

  const filtered = useMemo(() => {
    return assets.filter((a) => {
      if (type !== "all" && a.type !== type) return false;
      if (canSeePrivacy && privacy !== "all" && a.privacy !== privacy) return false;
      return true;
    });
  }, [assets, type, privacy, canSeePrivacy]);

  return (
    <section id="body-of-work" className="max-w-6xl mx-auto px-6 md:px-8 mt-14 mb-20">
      <div className="flex items-end justify-between mb-6 gap-4 flex-wrap">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-[1px] w-8 bg-[#E8C872]" />
            <div className="text-[10px] tracking-[0.4em] text-[#E8C872] uppercase">
              Body of Work
            </div>
          </div>
          <h2 className="serif text-3xl md:text-4xl font-black mt-3">
            {viewerLabel === "self" ? "Your stage" : "The collection"}
          </h2>
        </div>
        {canUpload && (
          <Link href={uploadHref as Route} className="hidden md:block">
            <Button variant="ghost" size="md" aria-label="Upload new piece">
              + New piece
            </Button>
          </Link>
        )}
      </div>

      {/* Filter chips */}
      <div className="space-y-3 mb-8">
        <div className="flex flex-wrap gap-2">
          {TYPE_CHIPS.map((c) => {
            const active = c.key === type;
            const count = counts[c.key];
            const disabled = count === 0 && c.key !== "all";
            return (
              <button
                key={c.key}
                type="button"
                disabled={disabled}
                onClick={() => setType(c.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 px-4 h-9 rounded-full text-xs tracking-[0.18em] uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60 ${
                  active
                    ? "bg-[#E8C872] text-black border border-[#E8C872] shadow-[0_6px_20px_-8px_rgba(232,200,114,0.7)]"
                    : disabled
                    ? "bg-[#15151C]/40 text-[#4e4e58] border border-[#2A2A36]/60 cursor-not-allowed"
                    : "bg-[#15151C] text-[#C9C9D1] border border-[#2A2A36] hover:text-white hover:border-[#E8C872]/50"
                }`}
              >
                {c.label}
                <span
                  className={`text-[10px] font-mono ${
                    active ? "text-black/70" : "text-[#8A8A96]"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {canSeePrivacy && (
          <div className="flex flex-wrap gap-2">
            {PRIVACY_CHIPS.map((c) => {
              const active = c.key === privacy;
              return (
                <button
                  key={c.key}
                  type="button"
                  onClick={() => setPrivacy(c.key)}
                  aria-pressed={active}
                  className={`inline-flex items-center gap-2 px-3 h-8 rounded-full text-[11px] tracking-[0.15em] uppercase transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60 ${
                    active
                      ? "bg-[#8B5CF6]/20 text-[#B89BFB] border border-[#8B5CF6]/50"
                      : "bg-transparent text-[#8A8A96] border border-[#2A2A36] hover:text-white"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          canUpload={canUpload}
          uploadHref={uploadHref}
          hasAnyAssets={assets.length > 0}
        />
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filtered.map((a) => (
              <AssetCard
                key={a.id}
                asset={a}
                href={`/channel/${channelId}/v/${a.id}`}
                canScore={canScore}
                scoreHref={`/channel/${channelId}/v/${a.id}#rubric`}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </section>
  );
}

function EmptyState({
  canUpload,
  uploadHref,
  hasAnyAssets,
}: {
  canUpload: boolean;
  uploadHref: string;
  hasAnyAssets: boolean;
}) {
  return (
    <div className="relative overflow-hidden bg-[#15151C] border border-[#2A2A36] rounded-3xl p-10 md:p-16 text-center">
      <div
        aria-hidden
        className="absolute inset-0 opacity-40 pointer-events-none"
        style={{
          background:
            "radial-gradient(600px 300px at 50% 0%, rgba(232,200,114,0.18), transparent 60%)",
        }}
      />
      <div className="relative">
        <div className="text-[10px] tracking-[0.4em] text-[#E8C872] uppercase mb-4">
          {hasAnyAssets ? "Nothing matches" : "Curtain up"}
        </div>
        <h3 className="serif text-2xl md:text-4xl font-black leading-tight">
          {hasAnyAssets
            ? "No pieces fit those filters."
            : "The stage is set. Your first spotlight awaits."}
        </h3>
        <p className="mt-3 text-sm text-[#8A8A96] max-w-md mx-auto">
          {hasAnyAssets
            ? "Try clearing a chip or two to see more work."
            : "Upload a monologue, a scene, or a showcase moment and it will live here forever."}
        </p>
        {canUpload && !hasAnyAssets && (
          <div className="mt-8">
            <Link href={uploadHref as Route}>
              <Button variant="primary" size="lg">
                Upload your first piece
              </Button>
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
