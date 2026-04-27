import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    username?: string;
    password?: string;
  };

  const username = process.env.ADMIN_USERNAME ?? "admin";
  const password = process.env.ADMIN_PASSWORD ?? "change-me";

  if (body.username !== username || body.password !== password) {
    return NextResponse.json(
      { message: "সঠিক ইউজারনেম বা পাসওয়ার্ড দিন।" },
      { status: 401 },
    );
  }

  const cookieStore = await cookies();
  cookieStore.set("sf_admin", "1", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });

  return NextResponse.json({ ok: true });
}
