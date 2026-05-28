import { redirect } from "next/navigation";
import { cookies } from "next/headers";

import { AdminLoginForm } from "@/components/forms/admin-login-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default async function AdminLoginPage() {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get("sf_admin")?.value === "1";

  if (isLoggedIn) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <p className="section-kicker">Admin Authentication</p>
          <CardTitle className="text-3xl sm:text-4xl">অ্যাডমিন লগইন</CardTitle>
          <p className="mt-4 text-sm text-muted-foreground bengali-copy">
            `ADMIN_USERNAME` এবং `ADMIN_PASSWORD` দিয়ে এই প্যানেলে প্রবেশ করুন।
          </p>
        </CardHeader>
        <CardContent>
          <AdminLoginForm />
        </CardContent>
      </Card>
    </main>
  );
}
