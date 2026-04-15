import { forwardRef, type InputHTMLAttributes } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  prefix?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, prefix, className = "", id, ...props }, ref) => {
    const inputId = id ?? props.name;
    return (
      <div className="flex flex-col gap-1.5">
        {label && (
          <label htmlFor={inputId} className="text-xs uppercase tracking-[0.2em] text-[#8A8A96]">
            {label}
          </label>
        )}
        <div
          className={`flex items-center rounded-lg bg-[#15151C] border ${
            error ? "border-red-500/60" : "border-[#2A2A36]"
          } focus-within:border-[#E8C872]/70 transition-colors`}
        >
          {prefix && (
            <span className="pl-3 pr-2 text-[#E8C872] font-medium border-r border-[#2A2A36] mr-3 h-12 flex items-center">
              {prefix}
            </span>
          )}
          <input
            ref={ref}
            id={inputId}
            className={`flex-1 bg-transparent outline-none h-12 px-3 text-[#F5F5F7] placeholder:text-[#555561] ${className}`}
            {...props}
          />
        </div>
        {error && <span className="text-xs text-red-400">{error}</span>}
      </div>
    );
  }
);
Input.displayName = "Input";
