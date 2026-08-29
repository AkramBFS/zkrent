import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export default async function LandlordDashboard() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  if (session.user.role !== "LANDLORD") {
    redirect("/unauthorized");
  }

  return (
    <main className="p-8 max-w-4xl mx-auto">
      <h1 className="font-serif text-3xl font-bold text-[#231F20] mb-2">
        Welcome, {session.user.name || session.user.email}
      </h1>
      <p className="font-mono text-sm text-[#3D3531]">
        Role: <span className="font-bold text-[#B86A36]">{session.user.role}</span>
      </p>
    </main>
  );
}
