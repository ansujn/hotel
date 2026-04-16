import { cookies } from "next/headers";
import { SocialHubClient } from "./social-hub-client";

export const metadata = { title: "Social Hub — Vik Theatre" };

export default async function SocialHubPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value ?? "";

  return <SocialHubClient token={token} />;
}
