import { cookies } from "next/headers";

export async function requireAdminSession() {
  const cookieStore = await cookies();
  return cookieStore.get("sf_admin")?.value === "1";
}
