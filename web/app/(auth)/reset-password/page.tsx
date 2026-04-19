import { Suspense } from "react";
import { ResetPasswordForm } from "./reset-form";

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-sm text-[#8A8A96]">Loading…</div>}>
          <ResetPasswordForm />
        </Suspense>
      </div>
    </main>
  );
}
