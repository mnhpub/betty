import { notFound, redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/session";
import { getMemberJourney } from "@/lib/lms";
import { getDictionary } from "@/lib/i18n/dictionaries";
import { isLocale } from "@/lib/i18n/locales";
import JourneyTimeline from "./JourneyTimeline";

// Demo view of the one seeded Prayer of Freedom member journey (packages/schema-etl) — not
// personalized per logged-in user. Real member journeys land with TPOF-3/TPOF-6.
export default async function JourneysPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const user = await getCurrentUser();
  if (!user) {
    redirect(`/${locale}/login`);
  }

  const [journey, dict] = await Promise.all([getMemberJourney(), getDictionary(locale)]);

  return <JourneyTimeline journey={journey} dict={dict.journeys} />;
}
