import { Suspense } from "react";
import { requireSession } from "@/lib/auth";
import { ChangePasswordForm } from "./change-form";

export default async function ChangePasswordPage() {
  const { user } = await requireSession();
  return (
    <main className="min-h-screen grid place-items-center p-8">
      <div className="w-full max-w-md">
        <Suspense fallback={<div className="text-sm text-[#8A8A96]">Loading…</div>}>
          <ChangePasswordForm
            mustChange={user.must_change_password ?? false}
            name={user.name ?? ""}
          />
        </Suspense>
      </div>
    </main>
  );
}
