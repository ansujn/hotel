import { cookies } from "next/headers";
import { ClipStudioClient } from "./clip-studio-client";

export const metadata = { title: "Auto-Clip Studio — Vik Theatre" };

export default async function ClipStudioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? "";

  return <ClipStudioClient token={token} />;
}
