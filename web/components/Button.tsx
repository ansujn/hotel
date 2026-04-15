import { forwardRef, type ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "accent";
type Size = "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
}

const base =
  "inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8C872]/60 disabled:opacity-50 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary:
    "bg-[#E8C872] text-black hover:bg-[#f0d589] active:bg-[#d9b85a] shadow-[0_6px_24px_-8px_rgba(232,200,114,0.6)]",
  ghost:
    "bg-transparent text-[#F5F5F7] border border-[#2A2A36] hover:bg-[#15151C]",
  accent:
    "bg-[#8B5CF6] text-white hover:bg-[#9b70f7] shadow-[0_6px_24px_-8px_rgba(139,92,246,0.7)]",
};

const sizes: Record<Size, string> = {
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "md", className = "", ...props }, ref) => (
    <button
      ref={ref}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  )
);
Button.displayName = "Button";
