import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Core Page Imports
import Index from "./pages/Index";
import BirthdayResults from "./pages/BirthdayResults";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Upgrade from "./pages/Upgrade";
import Pricing from "./pages/Pricing";
import Zodiac from "./pages/Zodiac";
import Birthstone from "./pages/Birthstone";
import MonthHub from "./pages/MonthHub";
import { MONTH_HUB_DATA } from "./data/monthHubData";
import FitnessRhythmPage from "./pages/FitnessRhythmPage";
import { FITNESS_PAGES } from "./data/fitnessPages";
import LifeExpectancy from "./pages/LifeExpectancy";
import CelebrityBirthday from "./pages/CelebrityBirthday";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";
import AgeCalculatorPage from "./pages/AgeCalculatorPage";
import TodaysBirthdaysPage from "./pages/TodaysBirthdaysPage";
import NumerologyPage from "./pages/NumerologyPage";
import PlanetaryAgePage from "./pages/PlanetaryAgePage";
import Methodology from "./pages/Methodology";
import EditorialPolicy from "./pages/EditorialPolicy";
import ZodiacSign from "./pages/ZodiacSign";
import BirthstonePage from "./pages/BirthstonePage";
import NumerologyNumber from "./pages/NumerologyNumber";
import GenerationPage from "./pages/Generation";
import BirthdayDate from "./pages/BirthdayDate";
import BirthdayHub from "./pages/BirthdayHub";
import BirthdayMonthPage from "./pages/BirthdayMonthPage";
import BirthdayDatePage from "./pages/BirthdayDatePage";
import Leaderboard from "./pages/Leaderboard";
import FamilyDashboard from "./pages/FamilyDashboard";
import GiftReport from "./pages/GiftReport";
import BiologicalAge from "./pages/BiologicalAge";
import CountryComparison from "./pages/CountryComparison";
import BirthdayReport from "./pages/BirthdayReport";
import ReportView from "./pages/ReportView";
import ChineseZodiac from "./pages/ChineseZodiac";
import ChineseZodiacSign from "./pages/ChineseZodiacSign";
import VedicZodiac from "./pages/VedicZodiac";
import VedicZodiacSign from "./pages/VedicZodiacSign";
import HowLongWillILive from '@/pages/answers/HowLongWillILive';
import WhatIsMyBiologicalAge from '@/pages/answers/WhatIsMyBiologicalAge';
import WhoSharesMyBirthday from '@/pages/answers/WhoSharesMyBirthday';
import HowOldAmIOnMars from '@/pages/answers/HowOldAmIOnMars';
import WhatIsMyZodiacSign from '@/pages/answers/WhatIsMyZodiacSign';
import WhatIsMyLifePathNumber from '@/pages/answers/WhatIsMyLifePathNumber';
import HowToCalculateAge from '@/pages/answers/HowToCalculateAge';
import WhatGenerationAmI from '@/pages/answers/WhatGenerationAmI';
import HowToLiveLonger from '@/pages/answers/HowToLiveLonger';
import WhatIsBMI from '@/pages/answers/WhatIsBMI';
import WhatIsLifeExpectancy from '@/pages/answers/WhatIsLifeExpectancy';
import HowDoesStressAffectLifeExpectancy from '@/pages/answers/HowDoesStressAffectLifeExpectancy';
import HowManyDaysUntilMyBirthday from '@/pages/answers/HowManyDaysUntilMyBirthday';
import TarotByBirthday from '@/pages/TarotByBirthday';
import MoonSignPage from '@/pages/MoonSignPage';
import NameNumerologyPage from '@/pages/NameNumerologyPage';
import BiorhythmPage from '@/pages/BiorhythmPage';
import CompatibilityPage from '@/pages/CompatibilityPage';
import RashiRatnaPage from '@/pages/RashiRatnaPage';
import BornOnDay from '@/pages/BornOnDay';
import BornOnDayIndia from '@/pages/BornOnDayIndia';
import BornOnIndex from '@/pages/BornOnIndex';
import BornOnIndiaIndex from '@/pages/BornOnIndiaIndex';
import AnswersIndex from '@/pages/AnswersIndex';
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
          </BrowserRouter>
        </BirthDateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;