import { NewMemberRequestForm } from "@/components/forms/new-member-request-form";
import { PublicShell } from "@/components/public-shell";

export default function NewMemberPage() {
  return (
    <PublicShell activePath="/new-member">
      <section className="container-shell pb-24 pt-12">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
              <div className="space-y-5">
                <span className="section-kicker">New Member Request</span>
                <h1 className="headline-display text-5xl font-black text-primary">
                  নতুন সদস্য হোন
                </h1>
              </div>

              <div className="rounded-[1.4rem] border border-amber-200 bg-amber-50 px-4 py-3 text-right shadow-[0_10px_24px_rgba(0,0,0,0.04)] sm:max-w-60">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-amber-700">
                  Alert
                </p>
                <p className="mt-2 text-sm font-bold text-primary bengali-copy">
                  আবেদন পাঠানোর পর ১ বা ২ দিন অপেক্ষা করুন। এডমিন নিশ্চিত হলে যোগাযোগ করবেন।
                </p>
              </div>
            </div>
            <p className="text-lg text-muted-foreground bengali-copy">
              নাম, মোবাইল নম্বর, ঠিকানা এবং ঐচ্ছিক নোট দিয়ে আবেদন পাঠান। এডমিন
              অনুমোদনের পর সদস্য তালিকায় যুক্ত হয়ে যাবেন।
            </p>
            <div className="card-muted p-6">
              <p className="text-sm text-muted-foreground bengali-copy">
                ডুপ্লিকেট মোবাইল নম্বর এড়াতে এডমিন রিভিউ করা হবে। যাচাইয়ের পর
                সদস্যদের অফিসিয়াল তালিকায় আপনাকে যোগ করা হবে।
              </p>
            </div>
          </div>

          <div className="card-soft p-7 md:p-8">
            <NewMemberRequestForm />
          </div>
        </div>
      </section>
    </PublicShell>
  );
}
