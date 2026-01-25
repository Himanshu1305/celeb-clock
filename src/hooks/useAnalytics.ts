import React, { useCallback, useEffect, useRef, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { hasAnalyticsConsent } from '@/components/CookieConsent';

// Generate a session ID for anonymous tracking
const getSessionId = (): string => {
  let sessionId = sessionStorage.getItem('analytics_session_id');
  if (!sessionId) {
    sessionId = crypto.randomUUID();
    sessionStorage.setItem('analytics_session_id', sessionId);
  }
  return sessionId;
};

interface AnalyticsMetadata {
  [key: string]: string | number | boolean | undefined;
}

export const useAnalytics = () => {
  const location = useLocation();
  const lastTrackedPath = useRef<string>('');

  const trackEvent = useCallback(async (
    eventType: 'page_view' | 'feature_use' | 'blog_read',
    eventName: string,
    metadata?: AnalyticsMetadata
  ) => {
    // Check for analytics consent before tracking
    if (!hasAnalyticsConsent()) {
      console.debug('Analytics tracking skipped: no consent');
      return;
    }
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      await supabase.from('analytics_events').insert({
        user_id: user?.id || null,
        session_id: getSessionId(),
        event_type: eventType,
        event_name: eventName,
        metadata: metadata || {}
      });
    } catch (error) {
      // Silently fail - analytics shouldn't break the app
      console.debug('Analytics tracking failed:', error);
    }
  }, []);

  const trackPageView = useCallback((path?: string) => {
    const pagePath = path || location.pathname;
    trackEvent('page_view', pagePath, {
      referrer: document.referrer,
      timestamp: new Date().toISOString()
    });
  }, [location.pathname, trackEvent]);

  const trackFeatureUse = useCallback((featureName: string, metadata?: AnalyticsMetadata) => {
    trackEvent('feature_use', featureName, {
      page: location.pathname,
      ...metadata
    });
  }, [location.pathname, trackEvent]);

  const trackBlogRead = useCallback((blogSlug: string, metadata?: AnalyticsMetadata) => {
    trackEvent('blog_read', blogSlug, {
      page: location.pathname,
      ...metadata
    });
  }, [location.pathname, trackEvent]);

  // Auto-track page views on route change
  useEffect(() => {
    if (location.pathname !== lastTrackedPath.current) {
      lastTrackedPath.current = location.pathname;
      trackPageView();
    }
  }, [location.pathname, trackPageView]);

  return {
    trackPageView,
    trackFeatureUse,
    trackBlogRead
  };
};

interface AnalyticsProviderProps {
  children: ReactNode;
}

// Provider component to initialize analytics tracking
export const AnalyticsProvider: React.FC<AnalyticsProviderProps> = ({ children }) => {
  useAnalytics();
  return React.createElement(React.Fragment, null, children);
};
