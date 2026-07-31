import { lazy, Suspense } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Core Page Imports
import Index from "./pages/Index";
const BirthdayResults = lazy(() => import("./pages/BirthdayResults"));
const Auth = lazy(() => import("./pages/Auth"));
const Profile = lazy(() => import("./pages/Profile"));
const Admin = lazy(() => import("./pages/Admin"));
const Upgrade = lazy(() => import("./pages/Upgrade"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Zodiac = lazy(() => import("./pages/Zodiac"));
const Birthstone = lazy(() => import("./pages/Birthstone"));
const MonthHub = lazy(() => import("./pages/MonthHub"));
import { MONTH_HUB_DATA } from "./data/monthHubData";
const FitnessRhythmPage = lazy(() => import("./pages/FitnessRhythmPage"));
import { FITNESS_PAGES } from "./data/fitnessPages";
const LifeExpectancy = lazy(() => import("./pages/LifeExpectancy"));
const CelebrityBirthday = lazy(() => import("./pages/CelebrityBirthday"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const About = lazy(() => import("./pages/About"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const FAQ = lazy(() => import("./pages/FAQ"));
const Contact = lazy(() => import("./pages/Contact"));
const NotFound = lazy(() => import("./pages/NotFound"));
const AgeCalculatorPage = lazy(() => import("./pages/AgeCalculatorPage"));
const TodaysBirthdaysPage = lazy(() => import("./pages/TodaysBirthdaysPage"));
const NumerologyPage = lazy(() => import("./pages/NumerologyPage"));
const PlanetaryAgePage = lazy(() => import("./pages/PlanetaryAgePage"));
const Methodology = lazy(() => import("./pages/Methodology"));
const EditorialPolicy = lazy(() => import("./pages/EditorialPolicy"));
const ZodiacSign = lazy(() => import("./pages/ZodiacSign"));
const BirthstonePage = lazy(() => import("./pages/BirthstonePage"));
const NumerologyNumber = lazy(() => import("./pages/NumerologyNumber"));
const GenerationPage = lazy(() => import("./pages/Generation"));
const BirthdayDate = lazy(() => import("./pages/BirthdayDate"));
const BirthdayHub = lazy(() => import("./pages/BirthdayHub"));
const BirthdayMonthPage = lazy(() => import("./pages/BirthdayMonthPage"));
const BirthdayDatePage = lazy(() => import("./pages/BirthdayDatePage"));
const Leaderboard = lazy(() => import("./pages/Leaderboard"));
const FamilyDashboard = lazy(() => import("./pages/FamilyDashboard"));
const GiftReport = lazy(() => import("./pages/GiftReport"));
const CoachLandingPage = lazy(() => import("./pages/CoachLandingPage"));
const BiologicalAge = lazy(() => import("./pages/BiologicalAge"));
const CountryComparison = lazy(() => import("./pages/CountryComparison"));
const BirthdayReport = lazy(() => import("./pages/BirthdayReport"));
const ReportView = lazy(() => import("./pages/ReportView"));
const ChineseZodiac = lazy(() => import("./pages/ChineseZodiac"));
const ChineseZodiacSign = lazy(() => import("./pages/ChineseZodiacSign"));
const VedicZodiac = lazy(() => import("./pages/VedicZodiac"));
const VedicZodiacSign = lazy(() => import("./pages/VedicZodiacSign"));
const HowLongWillILive = lazy(() => import('@/pages/answers/HowLongWillILive'));
const WhatIsMyBiologicalAge = lazy(() => import('@/pages/answers/WhatIsMyBiologicalAge'));
const WhoSharesMyBirthday = lazy(() => import('@/pages/answers/WhoSharesMyBirthday'));
const HowOldAmIOnMars = lazy(() => import('@/pages/answers/HowOldAmIOnMars'));
const WhatIsMyZodiacSign = lazy(() => import('@/pages/answers/WhatIsMyZodiacSign'));
const WhatIsMyLifePathNumber = lazy(() => import('@/pages/answers/WhatIsMyLifePathNumber'));
const HowToCalculateAge = lazy(() => import('@/pages/answers/HowToCalculateAge'));
const WhatGenerationAmI = lazy(() => import('@/pages/answers/WhatGenerationAmI'));
const HowToLiveLonger = lazy(() => import('@/pages/answers/HowToLiveLonger'));
const WhatIsBMI = lazy(() => import('@/pages/answers/WhatIsBMI'));
const WhatIsLifeExpectancy = lazy(() => import('@/pages/answers/WhatIsLifeExpectancy'));
const HowDoesStressAffectLifeExpectancy = lazy(() => import('@/pages/answers/HowDoesStressAffectLifeExpectancy'));
const HowManyDaysUntilMyBirthday = lazy(() => import('@/pages/answers/HowManyDaysUntilMyBirthday'));
const TarotByBirthday = lazy(() => import('@/pages/TarotByBirthday'));
const MoonSignPage = lazy(() => import('@/pages/MoonSignPage'));
const NameNumerologyPage = lazy(() => import('@/pages/NameNumerologyPage'));
const BiorhythmPage = lazy(() => import('@/pages/BiorhythmPage'));
const CompatibilityPage = lazy(() => import('@/pages/CompatibilityPage'));
const RashiRatnaPage = lazy(() => import('@/pages/RashiRatnaPage'));
const BornOnDay = lazy(() => import('@/pages/BornOnDay'));
const BornOnDayIndia = lazy(() => import('@/pages/BornOnDayIndia'));
const BornOnIndex = lazy(() => import('@/pages/BornOnIndex'));
const BornOnIndiaIndex = lazy(() => import('@/pages/BornOnIndiaIndex'));
const AnswersIndex = lazy(() => import('@/pages/AnswersIndex'));
import { AdminRoute } from "@/components/AdminRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
import { CurrencyAdminToggle } from "@/components/CurrencyAdminToggle";
import { BirthdayDiscountBanner } from "@/components/BirthdayDiscountBanner";
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
            <Suspense fallback={<div className="min-h-screen" aria-hidden="true" />}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/results" element={<BirthdayResults />} />
              <Route path="/age-calculator" element={<AgeCalculatorPage />} />
              <Route path="/todays-birthdays" element={<TodaysBirthdaysPage />} />
              <Route path="/numerology" element={<NumerologyPage />} />
              <Route path="/numerology/:number" element={<NumerologyNumber />} />
              <Route path="/generation" element={<GenerationPage />} />
              <Route path="/planetary-age" element={<PlanetaryAgePage />} />
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
              <Route path="/born-on" element={<BornOnIndex />} />
              <Route path="/born-on/india" element={<BornOnIndiaIndex />} />
              <Route path="/born-on/:slug/india" element={<BornOnDayIndia />} />
              <Route path="/born-on/:slug" element={<BornOnDay />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
            </Suspense>
          </BrowserRouter>
        </BirthDateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;