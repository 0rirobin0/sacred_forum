import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "হাজী বাড়ি জামে মসজিদ উন্নয়ন ফোরাম",
  description:
    "হাজী বাড়ি জামে মসজিদের জন্য বাংলা-প্রথম ফান্ড, সদস্য, খরচ ও স্বচ্ছতা ব্যবস্থাপনা পোর্টাল।",
  icons: {
    icon: "/icon.svg",
    shortcut: "/icon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="bn" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
