import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { requireSession } from "@/lib/auth";
import { AdminNav } from "@/components/AdminNav";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = await requireSession();
  if (user.role !== "admin" && user.role !== "instructor") {
    redirect("/home");
  }

  // Derive active tab from the URL path.
  const h = await headers();
  const path = h.get("x-pathname") ?? h.get("x-invoke-path") ?? "";
  const active = path.startsWith("/upload")
    ? "/upload"
    : path.startsWith("/batches")
      ? "/batches"
      : path.startsWith("/social")
        ? "/social"
        : path.startsWith("/clips")
          ? "/clips"
          : "/students";

  return (
    <div className="min-h-screen">
      <AdminNav user={user} active={active} />
      {children}
    </div>
  );
}
