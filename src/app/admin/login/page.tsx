import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminLoginForm } from "@/components/forms/admin-login-form";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("sf_admin")?.value === "1";

  if (isLoggedIn) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <div className="w-full max-w-md rounded-[2rem] border border-border/70 bg-card/90 p-8 shadow-[0_24px_60px_rgba(0,56,32,0.08)]">
        <div className="mb-8 text-center">
          <p className="section-kicker">Admin Authentication</p>
          <h1 className="headline-display text-3xl font-extrabold text-primary sm:text-4xl">
            অ্যাডমিন লগইন
          </h1>
          <p className="mt-4 text-sm text-muted-foreground bengali-copy">
            `ADMIN_USERNAME` এবং `ADMIN_PASSWORD` দিয়ে এই প্যানেলে প্রবেশ করুন।
          </p>
        </div>
        <AdminLoginForm />
      </div>
    </main>
  );
}
