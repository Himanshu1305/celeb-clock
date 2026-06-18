import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";

// Core Page Imports
import Index from "./pages/Index";
import BirthdayResults from "./pages/BirthdayResults";
import Auth from "./pages/Auth";
import Profile from "./pages/Profile";
import Admin from "./pages/Admin";
import Upgrade from "./pages/Upgrade";
import Zodiac from "./pages/Zodiac";
import Birthstone from "./pages/Birthstone";
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
import TarotByBirthday from '@/pages/TarotByBirthday';
import MoonSignPage from '@/pages/MoonSignPage';
import NameNumerologyPage from '@/pages/NameNumerologyPage';
import BiorhythmPage from '@/pages/BiorhythmPage';
import CompatibilityPage from '@/pages/CompatibilityPage';
import { AdminRoute } from "@/components/AdminRoute";
import { ScrollToTop } from "@/components/ScrollToTop";
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
              <Route path="/zodiac" element={<Zodiac />} />
              <Route path="/zodiac/:sign" element={<ZodiacSign />} />
              <Route path="/birthstone" element={<Birthstone />} />
              <Route path="/birthstone/:month" element={<BirthstonePage />} />
              <Route path="/life-expectancy" element={<LifeExpectancy />} />
              <Route path="/celebrity-birthday" element={<CelebrityBirthday />} />
              <Route path="/birthday" element={<BirthdayHub />} />
              <Route path="/birthday/:date" element={<BirthdayDate />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/blog/:slug" element={<BlogPost />} />
              <Route path="/about" element={<About />} />
              <Route path="/privacy" element={<Privacy />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/methodology" element={<Methodology />} />
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
              <Route path="/tarot-card-by-birthday" element={<TarotByBirthday />} />
              <Route path="/moon-sign" element={<MoonSignPage />} />
              <Route path="/name-numerology" element={<NameNumerologyPage />} />
              <Route path="/biorhythm" element={<BiorhythmPage />} />
              <Route path="/compatibility" element={<CompatibilityPage />} />
              <Route path="/compatibility/:sign1/:sign2" element={<CompatibilityPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </BirthDateProvider>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
);

export default App;