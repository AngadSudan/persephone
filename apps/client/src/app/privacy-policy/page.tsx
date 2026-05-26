import Footer from "@/components/General/Footer";
import { LandingNavbar } from "@/components/General/LandingNavbar";
import Link from "next/link";

const policySections = [
  {
    title: "1. Information We Collect",
    points: [
      "Account information such as your name, email address, and profile details.",
      "Usage data including pages visited, actions taken, and device/browser metadata.",
      "Content you provide, such as resumes, interview responses, and uploaded files.",
    ],
  },
  {
    title: "2. How We Use Information",
    points: [
      "To operate and improve the platform, personalize your experience, and secure accounts.",
      "To power interview workflows, recommendations, and analytics features.",
      "To communicate product updates, support responses, and service-related notices.",
    ],
  },
  {
    title: "3. Data Sharing",
    points: [
      "We do not sell your personal information.",
      "Data may be shared with trusted service providers that help us run the platform.",
      "Information may be disclosed if required by law or to protect users and platform integrity.",
    ],
  },
  {
    title: "4. Data Security and Retention",
    points: [
      "We use technical and organizational safeguards to protect your data.",
      "Data is retained only as long as necessary for product operations, legal obligations, and dispute resolution.",
      "You can request deletion or correction of your personal information, subject to applicable law.",
    ],
  },
  {
    title: "5. Your Rights",
    points: [
      "You can access, update, or request deletion of your account data.",
      "You can contact us for privacy-related requests and concerns.",
      "You can choose whether to receive optional product communications.",
    ],
  },
  {
    title: "6. Contact",
    points: [
      "For any privacy questions, contact support@persephone.com.",
      "If policies change materially, we will post an updated notice on this page.",
      "Last updated: May 26, 2026.",
    ],
  },
];

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen bg-(--bg-primary) text-(--text-primary) font-mono">
      <LandingNavbar />

      <section className="relative overflow-hidden px-4 pb-14 pt-28 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-56 w-56 -translate-x-1/2 rounded-full bg-(--hero-primary)/15 blur-3xl" />
          <div className="absolute -bottom-16 right-6 h-44 w-44 rounded-full bg-(--hero-primary)/10 blur-3xl" />
        </div>

        <div className="relative mx-auto w-full max-w-5xl">
          <div className="rounded-3xl border border-(--border-faded) bg-(--bg-secondary)/90 p-6 shadow-2xl shadow-black/30 backdrop-blur-sm sm:p-10">
            <p className="mb-4 inline-flex items-center rounded-full border border-(--border-green)/40 bg-(--hero-primary-faded) px-3 py-1 text-xs tracking-[0.18em] text-(--text-special)">
              PRIVACY POLICY
            </p>

            <h1 className="text-3xl font-bold leading-tight text-(--text-primary) sm:text-5xl">
              Your data, handled with care.
            </h1>

            <p className="mt-5 max-w-3xl text-sm leading-7 text-(--text-secondary) sm:text-base">
              This Privacy Policy explains what information Persephone collects,
              how it is used, and the choices you have. We are committed to
              transparent data practices and a safe, reliable interview
              experience.
            </p>

            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Link
                href="/"
                className="rounded-full border border-(--border-faded) px-5 py-2 text-sm text-(--text-primary) transition-all duration-300 hover:border-(--border-special) hover:text-(--text-special)"
              >
                Back to Home
              </Link>
              <a
                href="mailto:support@persephone.com"
                className="rounded-full border border-(--border-green) bg-(--hero-primary-faded) px-5 py-2 text-sm text-(--text-special) transition-all duration-300 hover:bg-(--hover-special)"
              >
                Contact Support
              </a>
            </div>
          </div>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {policySections.map((section) => (
              <article
                key={section.title}
                className="group rounded-2xl border border-(--border-faded) bg-(--bg-secondary)/65 p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-(--border-special)/50"
              >
                <h2 className="mb-3 text-base font-semibold text-(--text-primary) sm:text-lg">
                  {section.title}
                </h2>
                <ul className="space-y-2 text-sm leading-6 text-(--text-secondary)">
                  {section.points.map((point) => (
                    <li key={point} className="flex gap-2">
                      <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-(--text-special)" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
