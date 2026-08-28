import { Suspense } from "react";
import { lazyWithReload, ChunkErrorBoundary } from "@/lib/lazyWithRetry";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Core Page Imports
import Index from "./pages/Index";
const BirthdayResults = lazyWithReload(() => import("./pages/BirthdayResults"));
const Auth = lazyWithReload(() => import("./pages/Auth"));
const Profile = lazyWithReload(() => import("./pages/Profile"));
const Admin = lazyWithReload(() => import("./pages/Admin"));
const Upgrade = lazyWithReload(() => import("./pages/Upgrade"));
const Pricing = lazyWithReload(() => import("./pages/Pricing"));
const Zodiac = lazyWithReload(() => import("./pages/Zodiac"));
const Birthstone = lazyWithReload(() => import("./pages/Birthstone"));
const MonthHub = lazyWithReload(() => import("./pages/MonthHub"));
const MonthsHubPage = lazyWithReload(() => import("./pages/MonthsHubPage"));
import { MONTH_HUB_DATA } from "./data/monthHubData";
const FitnessRhythmPage = lazyWithReload(() => import("./pages/FitnessRhythmPage"));
import { FITNESS_PAGES } from "./data/fitnessPages";
const LifeExpectancy = lazyWithReload(() => import("./pages/LifeExpectancy"));
const CelebrityBirthday = lazyWithReload(() => import("./pages/CelebrityBirthday"));
const Blog = lazyWithReload(() => import("./pages/Blog"));
const BlogPost = lazyWithReload(() => import("./pages/BlogPost"));
const About = lazyWithReload(() => import("./pages/About"));
const Privacy = lazyWithReload(() => import("./pages/Privacy"));
const Terms = lazyWithReload(() => import("./pages/Terms"));
const FAQ = lazyWithReload(() => import("./pages/FAQ"));
const Contact = lazyWithReload(() => import("./pages/Contact"));
const NotFound = lazyWithReload(() => import("./pages/NotFound"));
const AgeCalculatorPage = lazyWithReload(() => import("./pages/AgeCalculatorPage"));
const AgeInDays = lazyWithReload(() => import("./pages/AgeInDays"));
const AgeInSeconds = lazyWithReload(() => import("./pages/AgeInSeconds"));
const BirthdayCountdown = lazyWithReload(() => import("./pages/BirthdayCountdown"));
const BiologicalAgeVsChronologicalAge = lazyWithReload(() => import("./pages/BiologicalAgeVsChronologicalAge"));
const LifeExpectancyIndiaVsUsa = lazyWithReload(() => import("./pages/LifeExpectancyIndiaVsUsa"));
const SunVsMoonSign = lazyWithReload(() => import("./pages/SunVsMoonSign"));
const TodaysBirthdaysPage = lazyWithReload(() => import("./pages/TodaysBirthdaysPage"));
const NumerologyPage = lazyWithReload(() => import("./pages/NumerologyPage"));
const PlanetaryAgePage = lazyWithReload(() => import("./pages/PlanetaryAgePage"));
const WeightOnPlanetsPage = lazyWithReload(() => import("./pages/WeightOnPlanetsPage"));
const Methodology = lazyWithReload(() => import("./pages/Methodology"));
const EditorialPolicy = lazyWithReload(() => import("./pages/EditorialPolicy"));
const ZodiacSign = lazyWithReload(() => import("./pages/ZodiacSign"));
const BirthstonePage = lazyWithReload(() => import("./pages/BirthstonePage"));
const NumerologyNumber = lazyWithReload(() => import("./pages/NumerologyNumber"));
const GenerationPage = lazyWithReload(() => import("./pages/Generation"));
const BirthdayDate = lazyWithReload(() => import("./pages/BirthdayDate"));
const BirthdayHub = lazyWithReload(() => import("./pages/BirthdayHub"));
const BirthdayMonthPage = lazyWithReload(() => import("./pages/BirthdayMonthPage"));
const BirthdayDatePage = lazyWithReload(() => import("./pages/BirthdayDatePage"));
const Leaderboard = lazyWithReload(() => import("./pages/Leaderboard"));
const FamilyDashboard = lazyWithReload(() => import("./pages/FamilyDashboard"));
const GiftReport = lazyWithReload(() => import("./pages/GiftReport"));
const CoachLandingPage = lazyWithReload(() => import("./pages/CoachLandingPage"));
const BiologicalAge = lazyWithReload(() => import("./pages/BiologicalAge"));
const CountryComparison = lazyWithReload(() => import("./pages/CountryComparison"));
const BirthdayReport = lazyWithReload(() => import("./pages/BirthdayReport"));
const ReportView = lazyWithReload(() => import("./pages/ReportView"));
const ChineseZodiac = lazyWithReload(() => import("./pages/ChineseZodiac"));
const ChineseZodiacSign = lazyWithReload(() => import("./pages/ChineseZodiacSign"));
const VedicZodiac = lazyWithReload(() => import("./pages/VedicZodiac"));
const VedicZodiacSign = lazyWithReload(() => import("./pages/VedicZodiacSign"));
const HowLongWillILive = lazyWithReload(() => import('@/pages/answers/HowLongWillILive'));
const WhatIsMyBiologicalAge = lazyWithReload(() => import('@/pages/answers/WhatIsMyBiologicalAge'));
const WhoSharesMyBirthday = lazyWithReload(() => import('@/pages/answers/WhoSharesMyBirthday'));
const HowOldAmIOnMars = lazyWithReload(() => import('@/pages/answers/HowOldAmIOnMars'));
const WhatIsMyZodiacSign = lazyWithReload(() => import('@/pages/answers/WhatIsMyZodiacSign'));
const WhatIsMyLifePathNumber = lazyWithReload(() => import('@/pages/answers/WhatIsMyLifePathNumber'));
const HowToCalculateAge = lazyWithReload(() => import('@/pages/answers/HowToCalculateAge'));
const WhatGenerationAmI = lazyWithReload(() => import('@/pages/answers/WhatGenerationAmI'));
const HowToLiveLonger = lazyWithReload(() => import('@/pages/answers/HowToLiveLonger'));
const WhatIsBMI = lazyWithReload(() => import('@/pages/answers/WhatIsBMI'));
const WhatIsLifeExpectancy = lazyWithReload(() => import('@/pages/answers/WhatIsLifeExpectancy'));
const HowDoesStressAffectLifeExpectancy = lazyWithReload(() => import('@/pages/answers/HowDoesStressAffectLifeExpectancy'));
const HowManyDaysUntilMyBirthday = lazyWithReload(() => import('@/pages/answers/HowManyDaysUntilMyBirthday'));
const WhatIsMyMoonSign = lazyWithReload(() => import('@/pages/answers/WhatIsMyMoonSign'));
const WhatAffectsLifeExpectancyMost = lazyWithReload(() => import('@/pages/answers/WhatAffectsLifeExpectancyMost'));
const WhatIsEpigeneticAge = lazyWithReload(() => import('@/pages/answers/WhatIsEpigeneticAge'));
const WhatIsVedicAstrology = lazyWithReload(() => import('@/pages/answers/WhatIsVedicAstrology'));
const TarotByBirthday = lazyWithReload(() => import('@/pages/TarotByBirthday'));
const MoonSignPage = lazyWithReload(() => import('@/pages/MoonSignPage'));
const NameNumerologyPage = lazyWithReload(() => import('@/pages/NameNumerologyPage'));
const BiorhythmPage = lazyWithReload(() => import('@/pages/BiorhythmPage'));
const CompatibilityPage = lazyWithReload(() => import('@/pages/CompatibilityPage'));
const RashiRatnaPage = lazyWithReload(() => import('@/pages/RashiRatnaPage'));
const BornOnDay = lazyWithReload(() => import('@/pages/BornOnDay'));
const BornOnDayIndia = lazyWithReload(() => import('@/pages/BornOnDayIndia'));
const BornOnIndex = lazyWithReload(() => import('@/pages/BornOnIndex'));
const BornOnIndiaIndex = lazyWithReload(() => import('@/pages/BornOnIndiaIndex'));
const AnswersIndex = lazyWithReload(() => import('@/pages/AnswersIndex'));
import { AdminRoute } from "@/components/AdminRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CurrencyAdminToggle } from "@/components/CurrencyAdminToggle";
import { BirthdayDiscountBanner } from "@/components/BirthdayDiscountBanner";
import { MissingStateModal } from "@/components/MissingStateModal";
import { CookieConsent } from "@/components/CookieConsent";
import { BirthDateProvider } from "./context/BirthDateContext";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <CookieConsent />
        <BirthDateProvider>
          <BrowserRouter>
            <ScrollToTop />
            <CurrencyAdminToggle />
            <BirthdayDiscountBanner />
            {/* One-time GST place-of-supply capture. Self-gates: renders only for a
                logged-in premium user with no buyer_state_code (radix portals to
                body, so it overlays everything). Invisible during prerender (no session). */}
            <MissingStateModal />
            <ChunkErrorBoundary>
            <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/results" element={<BirthdayResults />} />
              <Route path="/age-calculator" element={<AgeCalculatorPage />} />
              <Route path="/age-in-days" element={<AgeInDays />} />
              <Route path="/age-in-seconds" element={<AgeInSeconds />} />
              <Route path="/birthday-countdown" element={<BirthdayCountdown />} />
              <Route path="/biological-age-vs-chronological-age" element={<BiologicalAgeVsChronologicalAge />} />
              <Route path="/life-expectancy-india-vs-usa" element={<LifeExpectancyIndiaVsUsa />} />
              <Route path="/sun-vs-moon-sign" element={<SunVsMoonSign />} />
              <Route path="/todays-birthdays" element={<TodaysBirthdaysPage />} />
              <Route path="/numerology" element={<NumerologyPage />} />
              <Route path="/numerology/:number" element={<NumerologyNumber />} />
              <Route path="/generation" element={<GenerationPage />} />
              <Route path="/planetary-age" element={<PlanetaryAgePage />} />
              <Route path="/weight-on-planets" element={<WeightOnPlanetsPage />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
              <Route path="/upgrade" element={<Upgrade />} />
              <Route path="/pricing" element={<Pricing />} />
              <Route path="/zodiac" element={<Zodiac />} />
              <Route path="/zodiac/:sign" element={<ZodiacSign />} />
              <Route path="/birthstone" element={<Birthstone />} />
              <Route path="/birthstone/:month" element={<BirthstonePage />} />
              <Route path="/life-expectancy" element={<LifeExpectancy />} />
              <Route path="/celebrity-birthday" element={<CelebrityBirthday />} />
              <Route path="/birthday" element={<BirthdayHub />} />
              <Route path="/birthday/:month/:day" element={<BirthdayDatePage />} />
              <Route path="/birthday/:month" element={<BirthdayMonthPage />} />
              <Route path="/birthday/:date" element={<BirthdayDate />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/how-it-works" element={<Methodology />} />
              {/* Legacy path — 301'd at the edge by the Worker; this client
                  fallback covers dev + any direct SPA nav so it never 404s. */}
              <Route path="/methodology" element={<Navigate to="/how-it-works" replace />} />
              <Route path="/editorial-policy" element={<EditorialPolicy />} />
              <Route path="/leaderboard" element={<Leaderboard />} />
              <Route path="/family" element={<FamilyDashboard />} />
              <Route path="/gift" element={<GiftReport />} />
              <Route path="/coach" element={<CoachLandingPage />} />
              <Route path="/biological-age" element={<BiologicalAge />} />
              <Route path="/country-comparison" element={<CountryComparison />} />
              <Route path="/birthday-report" element={<BirthdayReport />} />
              <Route path="/report/:slug" element={<ReportView />} />
              <Route path="/chinese-zodiac" element={<ChineseZodiac />} />
              <Route path="/chinese-zodiac/:animal" element={<ChineseZodiacSign />} />
              <Route path="/vedic-zodiac" element={<VedicZodiac />} />
              <Route path="/vedic-zodiac/:rashi" element={<VedicZodiacSign />} />
              <Route path="/answers" element={<AnswersIndex />} />
              <Route path="/answers/how-long-will-i-live" element={<HowLongWillILive />} />
              <Route path="/answers/what-is-my-biological-age" element={<WhatIsMyBiologicalAge />} />
              <Route path="/answers/who-shares-my-birthday" element={<WhoSharesMyBirthday />} />
              <Route path="/answers/how-old-am-i-on-mars" element={<HowOldAmIOnMars />} />
              <Route path="/answers/what-is-my-zodiac-sign" element={<WhatIsMyZodiacSign />} />
              <Route path="/answers/what-is-my-life-path-number" element={<WhatIsMyLifePathNumber />} />
              <Route path="/answers/how-to-calculate-age" element={<HowToCalculateAge />} />
              <Route path="/answers/what-generation-am-i" element={<WhatGenerationAmI />} />
              <Route path="/answers/how-to-live-longer" element={<HowToLiveLonger />} />
              <Route path="/answers/what-is-bmi" element={<WhatIsBMI />} />
              <Route path="/answers/what-is-life-expectancy" element={<WhatIsLifeExpectancy />} />
              <Route path="/answers/how-does-stress-affect-life-expectancy" element={<HowDoesStressAffectLifeExpectancy />} />
              <Route path="/answers/how-many-days-until-my-birthday" element={<HowManyDaysUntilMyBirthday />} />
              <Route path="/answers/what-is-my-moon-sign" element={<WhatIsMyMoonSign />} />
              <Route path="/answers/what-affects-life-expectancy-most" element={<WhatAffectsLifeExpectancyMost />} />
              <Route path="/answers/what-is-epigenetic-age" element={<WhatIsEpigeneticAge />} />
              <Route path="/answers/what-is-vedic-astrology" element={<WhatIsVedicAstrology />} />
              <Route path="/tarot-card-by-birthday" element={<TarotByBirthday />} />
              <Route path="/moon-sign" element={<MoonSignPage />} />
              <Route path="/name-numerology" element={<NameNumerologyPage />} />
              <Route path="/biorhythm" element={<BiorhythmPage />} />
              <Route path="/compatibility" element={<CompatibilityPage />} />
              <Route path="/compatibility/:sign1/:sign2" element={<CompatibilityPage />} />
              <Route path="/rashi-ratna" element={<RashiRatnaPage />} />
              {MONTH_HUB_DATA.map(m => (
                <Route key={m.slug} path={`/born-in-${m.slug}`} element={<MonthHub />} />
              ))}
              {FITNESS_PAGES.map(p => (
                <Route key={p.slug} path={`/${p.slug}`} element={<FitnessRhythmPage />} />
              ))}
              <Route path="/born-in" element={<MonthsHubPage />} />
              <Route path="/born-on" element={<BornOnIndex />} />
              <Route path="/born-on/india" element={<BornOnIndiaIndex />} />
              <Route path="/born-on/:slug/india" element={<BornOnDayIndia />} />
              <Route path="/born-on/:slug" element={<BornOnDay />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
            </ChunkErrorBoundary>
          </BrowserRouter>
        </BirthDateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;