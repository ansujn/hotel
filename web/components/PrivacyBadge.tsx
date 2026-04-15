export type Privacy = "private" | "pending_consent" | "public";

const styles: Record<Privacy, { label: string; cls: string }> = {
  private: {
    label: "Private",
    cls: "bg-[#2A2A36] text-[#C9C9D1] border-[#3A3A46]",
  },
  pending_consent: {
    label: "Pending consent",
    cls: "bg-[#8B5CF6]/15 text-[#B89BFB] border-[#8B5CF6]/40",
  },
  public: {
    label: "Public",
    cls: "bg-[#E8C872]/15 text-[#E8C872] border-[#E8C872]/40",
  },
};

export function PrivacyBadge({ privacy }: { privacy: Privacy }) {
  const s = styles[privacy];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${s.cls}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {s.label}
    </span>
  );
}
