import { PublicShell } from "@/components/public-shell";
import { mosqueLocation, mosqueName, softwareName } from "@/lib/site-config";

export default function AboutPage() {
  return (
    <PublicShell activePath="/about">
      <div className="container-shell border-primary/40 lg:border-x">
        <section className="px-4 py-10 sm:px-6 lg:px-10">
          <div className="max-w-3xl space-y-4">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-muted-foreground">
              About
            </p>
            <h1 className="headline-display text-3xl font-extrabold text-primary sm:text-4xl">
              ফোরাম পরিচিতি
            </h1>
            <p className="text-base text-muted-foreground bengali-copy">
              {softwareName} আমাদের এলাকার মসজিদ উন্নয়ন, স্বচ্ছ হিসাব এবং সদস্যদের সহযোগিতামূলক কাজকে
              একত্রিত করার একটি ডিজিটাল উদ্যোগ। এই ফোরামের মাধ্যমে ফান্ড জমা, খরচের বিবরণ ও আপডেট সবাই
              সহজে দেখতে পারেন।
            </p>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="rounded-[2rem] border border-border/70 bg-muted/40 p-6 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
              <h2 className="headline-display text-2xl font-bold text-primary">মসজিদ সম্পর্কে</h2>
              <p className="mt-3 text-sm text-muted-foreground bengali-copy">
                {mosqueName} দীর্ঘদিন ধরে এলাকার ধর্মীয় ও সামাজিক কার্যক্রমের কেন্দ্রবিন্দু। নিয়মিত সালাত,
                শিক্ষা কার্যক্রম এবং সমাজসেবামূলক উদ্যোগের মাধ্যমে মসজিদটি আমাদের কমিউনিটিকে একত্রে রাখে।
              </p>
              <p className="mt-4 text-sm text-muted-foreground bengali-copy">
                আমরা মসজিদ উন্নয়ন তহবিলকে স্বচ্ছ রাখতে এবং প্রয়োজনীয় সংস্কার ও সম্প্রসারণের কাজ দ্রুত
                সম্পন্ন করতে এই ফোরাম পরিচালনা করছি।
              </p>
            </div>

            <div className="rounded-[2rem] border border-border/70 bg-white p-5 shadow-[0_12px_30px_rgba(0,0,0,0.05)]">
              <h2 className="headline-display text-2xl font-bold text-primary">অবস্থান</h2>
              <p className="mt-3 text-sm text-muted-foreground bengali-copy">{mosqueLocation}</p>
        
            </div>
          </div>
        </section>
      </div>
    </PublicShell>
  );
}
