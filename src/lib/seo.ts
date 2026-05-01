import { siteConfig } from "@/config/site";

export const getSiteOrigin = () => {
  if (typeof window !== "undefined" && window.location.origin) return window.location.origin;
  return siteConfig.siteUrl || "";
};

export const toAbsoluteUrl = (value?: string) => {
  if (!value) return "";
  if (/^https?:\/\//i.test(value)) return value;
  if (value.startsWith("//")) return `https:${value}`;
  const origin = getSiteOrigin();
  if (!origin) return value;
  return `${origin}${value.startsWith("/") ? value : `/${value}`}`;
};

export const buildCanonicalUrl = (path?: string) => {
  const origin = getSiteOrigin();
  const cleanPath = path && path.length > 0 ? path : typeof window !== "undefined" ? `${window.location.pathname}${window.location.search}` : "/";
  if (!origin) return cleanPath;
  return `${origin}${cleanPath.startsWith("/") ? cleanPath : `/${cleanPath}`}`;
};

export const buildSeoTitle = (title?: string) => {
  if (!title) return siteConfig.defaultTitle;
  return title.includes(siteConfig.businessName) ? title : `${title} | ${siteConfig.businessName}`;
};

export const stripHtml = (value: string) => value.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();

export const truncateText = (value: string, limit = 160) => {
  if (value.length <= limit) return value;
  return `${value.slice(0, limit - 1).trim()}…`;
};

export const toIsoDate = (value?: string) => {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
};

export const createBreadcrumbSchema = (items: Array<{ name: string; path: string }>) => ({
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, index) => ({
    "@type": "ListItem",
    position: index + 1,
    name: item.name,
    item: buildCanonicalUrl(item.path),
  })),
});

export const createOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteConfig.businessName,
  url: buildCanonicalUrl("/"),
  logo: toAbsoluteUrl(siteConfig.defaultOgImage),
  email: siteConfig.supportEmail,
  telephone: `+${siteConfig.supportPhoneE164}`,
  address: {
    "@type": "PostalAddress",
    addressLocality: siteConfig.location,
    addressCountry: "KE",
  },
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    telephone: `+${siteConfig.supportPhoneE164}`,
    email: siteConfig.supportEmail,
    areaServed: "KE",
    availableLanguage: ["en"],
  },
});

export const createWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: siteConfig.businessName,
  url: buildCanonicalUrl("/"),
  potentialAction: {
    "@type": "SearchAction",
    target: `${buildCanonicalUrl("/search")}?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
});

export const createWebPageSchema = (name: string, path: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "WebPage",
  name,
  url: buildCanonicalUrl(path),
  description,
});
