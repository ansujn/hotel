import { requireSession } from "@/lib/auth";
import { api } from "@/lib/api";
import { PayButton } from "./pay-button";

interface PaymentRow {
  id: string;
  razorpay_order_id: string;
  amount_paise: number;
  status: string;
  period: string;
  created_at: string;
}

interface DuesResponse {
  pending: boolean;
  period?: string;
  amount_paise?: number;
}

function formatRupees(paise: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 0,
  }).format(paise / 100);
}

function statusBadge(status: string) {
  const colors: Record<string, string> = {
    paid: "bg-green-900/40 text-green-400 border-green-700/50",
    created: "bg-yellow-900/40 text-yellow-400 border-yellow-700/50",
    failed: "bg-red-900/40 text-red-400 border-red-700/50",
  };
  return (
    <span
      className={`inline-block rounded-full border px-3 py-0.5 text-xs font-medium ${colors[status] ?? "bg-[#2A2A36] text-[#8A8A96] border-[#2A2A36]"}`}
    >
      {status.toUpperCase()}
    </span>
  );
}

export default async function FeesPage() {
  const { token } = await requireSession();

  let dues: DuesResponse = { pending: false };
  let payments: PaymentRow[] = [];

  try {
    [dues, payments] = await Promise.all([
      api<DuesResponse>("/payments/dues", { token }),
      api<PaymentRow[]>("/payments", { token }),
    ]);
  } catch {
    // API may not be running; show empty state.
  }

  return (
    <main className="max-w-4xl mx-auto px-8 pb-16">
      <section className="pt-4 pb-8">
        <div className="text-[#E8C872] tracking-[0.3em] text-xs mb-3">FEES</div>
        <h2 className="serif text-3xl font-black">Fee Payments</h2>
      </section>

      {dues.pending && dues.amount_paise && dues.period && (
        <section className="mb-8 rounded-2xl border border-[#E8C872]/40 bg-[#E8C872]/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] tracking-[0.3em] text-[#E8C872] mb-1">
                PENDING DUES
              </div>
              <div className="serif text-2xl font-bold">
                {formatRupees(dues.amount_paise)}
              </div>
              <div className="text-sm text-[#8A8A96] mt-1">
                Period: {dues.period}
              </div>
            </div>
            <PayButton
              period={dues.period}
              amountPaise={dues.amount_paise}
            />
          </div>
        </section>
      )}

      {!dues.pending && (
        <section className="mb-8 rounded-2xl border border-green-700/40 bg-green-900/10 p-6">
          <div className="flex items-center gap-3">
            <div className="text-2xl">&#10003;</div>
            <div>
              <div className="serif text-lg font-bold text-green-400">
                All dues paid
              </div>
              <p className="text-sm text-[#8A8A96]">
                No pending fees at this time.
              </p>
            </div>
          </div>
        </section>
      )}

      <section>
        <h3 className="serif text-lg font-bold mb-4">Payment History</h3>
        {payments.length === 0 ? (
          <p className="text-[#8A8A96] text-sm">No payments recorded yet.</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[#2A2A36]">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2A2A36] text-left text-[#8A8A96]">
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 font-medium">Period</th>
                  <th className="px-4 py-3 font-medium text-right">Amount</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-[#2A2A36]/50 last:border-0"
                  >
                    <td className="px-4 py-3">
                      {new Date(p.created_at).toLocaleDateString("en-IN")}
                    </td>
                    <td className="px-4 py-3">{p.period}</td>
                    <td className="px-4 py-3 text-right font-medium">
                      {formatRupees(p.amount_paise)}
                    </td>
                    <td className="px-4 py-3">{statusBadge(p.status)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
