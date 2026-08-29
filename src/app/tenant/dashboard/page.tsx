import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function TenantDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "TENANT") {
    redirect("/unauthorized");
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl font-bold text-[#14213D] mb-2">
        Welcome, {session.user.name || session.user.email}
      </h1>
      <p className="font-mono text-sm text-[#4B5A79]">
        Role: <span className="font-bold text-[#4FB3A5]">{session.user.role}</span>
      </p>
    </main>
  );
}
