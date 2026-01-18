import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { BirthDateProvider } from "@/context/BirthDateContext";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Upgrade from "./pages/Upgrade";
import Zodiac from "./pages/Zodiac";
import Birthstone from "./pages/Birthstone";
import LifeExpectancy from "./pages/LifeExpectancy";
import CelebrityBirthday from "./pages/CelebrityBirthday";
import About from "./pages/About";
import Privacy from "./pages/Privacy";
import Terms from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <BirthDateProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
          <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/upgrade" element={<Upgrade />} />
          <Route path="/zodiac" element={<Zodiac />} />
          <Route path="/birthstone" element={<Birthstone />} />
          <Route path="/life-expectancy" element={<LifeExpectancy />} />
          <Route path="/celebrity-birthday" element={<CelebrityBirthday />} />
          <Route path="/about" element={<About />} />
          <Route path="/privacy" element={<Privacy />} />
          <Route path="/terms" element={<Terms />} />
          <Route path="/faq" element={<FAQ />} />
          <Route path="/contact" element={<Contact />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
  </HelmetProvider>
);

export default App;
