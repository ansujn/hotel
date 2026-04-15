import type { ReactNode } from "react";

export function BannerGradient({
  className = "",
  children,
}: {
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`relative overflow-hidden rounded-2xl border border-[#2A2A36] ${className}`}
      style={{
        background:
          "radial-gradient(900px 500px at 15% 10%, rgba(139,92,246,0.55), transparent 60%), radial-gradient(700px 400px at 85% 80%, rgba(232,200,114,0.4), transparent 60%), linear-gradient(135deg, #1a1030 0%, #0B0B0F 100%)",
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.08] pointer-events-none"
        style={{
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.9) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      />
      {children}
    </div>
  );
}
