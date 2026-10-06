import { Link, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { UtilityLayout } from "@/components/central";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);
  }, [location.pathname]);

  return (
    <UtilityLayout
      theme="neutral"
      testId="not-found-page"
      breadcrumb={{ current: 'Not Found' }}
      h1="Page Not Found"
    >
      <div className="flex items-center justify-center px-4 py-12">
        <div className="text-center max-w-lg">
          <img
            src="/bornclock-logo.png"
            alt="BornClock"
            className="h-12 w-auto mx-auto mb-3"
          />
          <p className="text-sm text-muted-foreground mb-8">Your Birthday Intelligence Platform</p>
          <div className="text-8xl font-black gradient-text-primary mb-4">404</div>
          <p className="text-muted-foreground mb-8">
            The page you're looking for doesn't exist or has been moved.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              to="/"
              className="bg-primary text-primary-foreground px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity"
            >
              Go Home
            </Link>
            <Link
              to="/age-calculator"
              className="bg-muted text-muted-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted/80 transition-colors"
            >
              Age Calculator
            </Link>
            <Link
              to="/blog"
              className="bg-muted text-muted-foreground px-6 py-3 rounded-xl font-semibold hover:bg-muted/80 transition-colors"
            >
              Blog
            </Link>
          </div>
        </div>
      </div>
    </UtilityLayout>
  );
};

export default NotFound;
