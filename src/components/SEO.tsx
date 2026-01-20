import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  author?: string;
  publishedTime?: string;
  modifiedTime?: string;
  section?: string;
  tags?: string[];
  noindex?: boolean;
}

const SITE_NAME = 'Celeb Clock - Age & Birthday Calculator';
const SITE_URL = 'https://celeb-clock.preview.emergentagent.com';
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.png`;
const TWITTER_HANDLE = '@celebclock';

export const SEO = ({ 
  title, 
  description, 
  keywords, 
  canonicalUrl,
  ogImage = DEFAULT_OG_IMAGE,
  ogType = 'website',
  twitterCard = 'summary_large_image',
  author,
  publishedTime,
  modifiedTime,
  section,
  tags = [],
  noindex = false
}: SEOProps) => {
  const fullTitle = `${title} | ${SITE_NAME}`;
  const fullCanonicalUrl = canonicalUrl ? `${SITE_URL}${canonicalUrl}` : undefined;
  
  // Generate JSON-LD structured data
  const generateStructuredData = () => {
    const baseData: any = {
      '@context': 'https://schema.org',
      '@type': ogType === 'article' ? 'Article' : 'WebPage',
      headline: title,
      description: description,
      url: fullCanonicalUrl || SITE_URL,
      image: ogImage,
      publisher: {
        '@type': 'Organization',
        name: SITE_NAME,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_URL}/logo.png`
        }
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': fullCanonicalUrl || SITE_URL
      }
    };

    if (ogType === 'article') {
      baseData.author = {
        '@type': 'Person',
        name: author || 'Celeb Clock Team'
      };
      if (publishedTime) {
        baseData.datePublished = publishedTime;
      }
      if (modifiedTime) {
        baseData.dateModified = modifiedTime;
      }
      if (section) {
        baseData.articleSection = section;
      }
      if (tags.length > 0) {
        baseData.keywords = tags.join(', ');
      }
    }

    return JSON.stringify(baseData);
  };

  // Generate BreadcrumbList structured data
  const generateBreadcrumbData = () => {
    if (!canonicalUrl) return null;
    
    const pathParts = canonicalUrl.split('/').filter(Boolean);
    const items = [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL
      }
    ];

    let currentPath = '';
    pathParts.forEach((part, index) => {
      currentPath += `/${part}`;
      items.push({
        '@type': 'ListItem',
        position: index + 2,
        name: part.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        item: `${SITE_URL}${currentPath}`
      });
    });

    return JSON.stringify({
      '@context': 'https://schema.org',
      '@type': 'BreadcrumbList',
      itemListElement: items
    });
  };

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{fullTitle}</title>
      <meta name="title" content={fullTitle} />
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      {author && <meta name="author" content={author} />}
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      
      {/* Canonical URL */}
      {fullCanonicalUrl && <link rel="canonical" href={fullCanonicalUrl} />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={ogType} />
      <meta property="og:url" content={fullCanonicalUrl || SITE_URL} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:locale" content="en_US" />
      
      {/* Article-specific Open Graph */}
      {ogType === 'article' && publishedTime && (
        <meta property="article:published_time" content={publishedTime} />
      )}
      {ogType === 'article' && modifiedTime && (
        <meta property="article:modified_time" content={modifiedTime} />
      )}
      {ogType === 'article' && author && (
        <meta property="article:author" content={author} />
      )}
      {ogType === 'article' && section && (
        <meta property="article:section" content={section} />
      )}
      {ogType === 'article' && tags.map((tag, index) => (
        <meta key={index} property="article:tag" content={tag} />
      ))}
      
      {/* Twitter */}
      <meta name="twitter:card" content={twitterCard} />
      <meta name="twitter:site" content={TWITTER_HANDLE} />
      <meta name="twitter:creator" content={TWITTER_HANDLE} />
      <meta name="twitter:url" content={fullCanonicalUrl || SITE_URL} />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={title} />
      
      {/* Additional SEO Meta Tags */}
      <meta name="theme-color" content="#8B5CF6" />
      <meta name="apple-mobile-web-app-title" content={SITE_NAME} />
      <meta name="application-name" content={SITE_NAME} />
      
      {/* Structured Data - JSON-LD */}
      <script type="application/ld+json">
        {generateStructuredData()}
      </script>
      
      {/* Breadcrumb Structured Data */}
      {canonicalUrl && (
        <script type="application/ld+json">
          {generateBreadcrumbData()}
        </script>
      )}
    </Helmet>
  );
};

// Specific SEO component for Blog Articles
interface ArticleSEOProps {
  title: string;
  description: string;
  slug: string;
  author: string;
  publishedDate: string;
  modifiedDate?: string;
  category: string;
  tags: string[];
  featuredImage?: string;
}

export const ArticleSEO = ({
  title,
  description,
  slug,
  author,
  publishedDate,
  modifiedDate,
  category,
  tags,
  featuredImage
}: ArticleSEOProps) => {
  return (
    <SEO
      title={title}
      description={description}
      keywords={tags.join(', ')}
      canonicalUrl={`/blog/${slug}`}
      ogType="article"
      ogImage={featuredImage}
      author={author}
      publishedTime={publishedDate}
      modifiedTime={modifiedDate}
      section={category}
      tags={tags}
    />
  );
};

// FAQ Schema for FAQ pages
interface FAQItem {
  question: string;
  answer: string;
}

export const FAQSchema = ({ items }: { items: FAQItem[] }) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map(item => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer
      }
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};

// HowTo Schema for calculator pages
interface HowToStep {
  name: string;
  text: string;
}

export const HowToSchema = ({ 
  name, 
  description, 
  steps 
}: { 
  name: string; 
  description: string; 
  steps: HowToStep[] 
}) => {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name,
    description,
    step: steps.map((step, index) => ({
      '@type': 'HowToStep',
      position: index + 1,
      name: step.name,
      text: step.text
    }))
  };

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(schema)}
      </script>
    </Helmet>
  );
};
