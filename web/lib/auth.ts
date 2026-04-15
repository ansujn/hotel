import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { api, type User } from "./api";

export const ACCESS_COOKIE = "access_token";
export const REFRESH_COOKIE = "refresh_token";

export async function getSession(): Promise<{ user: User; token: string } | null> {
  const store = await cookies();
  const token = store.get(ACCESS_COOKIE)?.value;
  if (!token) return null;
  try {
    const user = await api<User>("/me", { token });
    return { user, token };
  } catch {
    return null;
  }
}

export async function requireSession(): Promise<{ user: User; token: string }> {
  const session = await getSession();
  if (!session) redirect("/login");
  return session;
}
