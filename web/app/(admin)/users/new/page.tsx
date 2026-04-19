import { requireSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import { NewUserForm } from "./new-user-form";

export default async function AdminNewUserPage() {
  const { user } = await requireSession();
  if (user.role !== "admin" && user.role !== "instructor") {
    redirect("/home");
  }

  return (
    <main className="max-w-3xl mx-auto px-4 md:px-8 py-6 md:py-10">
      <div className="mb-6 md:mb-8">
        <div className="text-[10px] tracking-[0.35em] text-[#E8C872] uppercase mb-2">
          Admin
        </div>
        <h1 className="serif text-2xl md:text-4xl font-black">Add a user</h1>
        <p className="text-sm text-[#8A8A96] mt-1">
          Create a student, parent, or instructor account. A default password is
          generated and emailed to them. They&rsquo;ll be asked to change it on first
          login.
        </p>
      </div>
      <NewUserForm />
    </main>
  );
}
