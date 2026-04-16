"use client";

import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "@/lib/api";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

interface Props {
  period: string;
  amountPaise: number;
}

export function PayButton({ period, amountPaise }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scriptLoaded = useRef(false);

  useEffect(() => {
    if (scriptLoaded.current) return;
    if (typeof window !== "undefined" && !window.Razorpay) {
      const s = document.createElement("script");
      s.src = "https://checkout.razorpay.com/v1/checkout.js";
      s.async = true;
      document.head.appendChild(s);
    }
    scriptLoaded.current = true;
  }, []);

  const handlePay = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`${API_BASE}/v1/payments/order`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ period, amount_paise: amountPaise }),
      });

      if (!res.ok) {
        throw new Error("Failed to create order");
      }

      const data = await res.json();

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK not loaded");
      }

      const rzp = new window.Razorpay({
        key: data.razorpay_key_id,
        amount: data.amount_paise,
        currency: "INR",
        name: "Vik Theatre",
        description: `Fees for ${period}`,
        order_id: data.order_id,
        handler: () => {
          // Payment succeeded; refresh to show updated status.
          router.refresh();
        },
        theme: {
          color: "#E8C872",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
          },
        },
      });

      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Payment failed");
      setLoading(false);
    }
  }, [period, amountPaise, router]);

  return (
    <div>
      <button
        onClick={handlePay}
        disabled={loading}
        className="rounded-lg bg-[#E8C872] px-6 py-3 text-sm font-semibold text-black hover:bg-[#f0d589] disabled:opacity-50 transition-colors"
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
      {error && (
        <p className="mt-2 text-xs text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
