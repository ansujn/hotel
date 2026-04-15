"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/Button";

export function LogoutButton() {
  const router = useRouter();
  const onLogout = async () => {
    await fetch("/api/auth/session", { method: "DELETE" });
    router.replace("/");
    router.refresh();
  };
  return (
    <Button variant="ghost" size="md" onClick={onLogout}>
      Logout
    </Button>
  );
}
