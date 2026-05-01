import { useEffect } from "react";
import { siteConfig } from "@/config/site";
import { buildCanonicalUrl, buildSeoTitle, toAbsoluteUrl } from "@/lib/seo";

type JsonLd = Record<string, unknown>;

interface SeoProps {
  title?: string;
  description?: string;
  image?: string;
  canonicalPath?: string;
  type?: "website" | "article" | "product" | "profile";
  keywords?: string[];
  robots?: string;
  noIndex?: boolean;
  noFollow?: boolean;
  publishedTime?: string;
  modifiedTime?: string;
  structuredData?: JsonLd | JsonLd[];
}

const setMetaTag = (selector: string, attribute: "name" | "property", key: string, content?: string) => {
  if (!content) return;
  let tag = document.head.querySelector<HTMLMetaElement>(selector);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attribute, key);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
};

const setLinkTag = (rel: string, href: string) => {
  let tag = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!tag) {
    tag = document.createElement("link");
    tag.setAttribute("rel", rel);
    document.head.appendChild(tag);
  }
  tag.setAttribute("href", href);
};

const Seo = ({ title, description, image, canonicalPath, type = "website", keywords, robots, noIndex = false, noFollow = false, publishedTime, modifiedTime, structuredData }: SeoProps) => {
  useEffect(() => {
    const metaTitle = buildSeoTitle(title);
    const metaDescription = description ?? siteConfig.defaultDescription;
    const metaKeywords = (keywords?.length ? keywords : siteConfig.defaultKeywords).join(", ");
    const metaImage = toAbsoluteUrl(image ?? siteConfig.defaultOgImage);
    const canonicalUrl = buildCanonicalUrl(canonicalPath);
    const robotsContent = robots ?? `${noIndex ? "noindex" : "index"},${noFollow ? "nofollow" : "follow"}`;

    document.title = metaTitle;
    document.documentElement.lang = siteConfig.language;

    setMetaTag('meta[name="description"]', "name", "description", metaDescription);
    setMetaTag('meta[name="keywords"]', "name", "keywords", metaKeywords);
    setMetaTag('meta[name="author"]', "name", "author", siteConfig.businessName);
    setMetaTag('meta[name="robots"]', "name", "robots", robotsContent);
    setMetaTag('meta[name="theme-color"]', "name", "theme-color", siteConfig.themeColor);
    setMetaTag('meta[property="og:title"]', "property", "og:title", metaTitle);
    setMetaTag('meta[property="og:description"]', "property", "og:description", metaDescription);
    setMetaTag('meta[property="og:type"]', "property", "og:type", type);
    setMetaTag('meta[property="og:url"]', "property", "og:url", canonicalUrl);
    setMetaTag('meta[property="og:image"]', "property", "og:image", metaImage);
    setMetaTag('meta[property="og:site_name"]', "property", "og:site_name", siteConfig.businessName);
    setMetaTag('meta[property="og:locale"]', "property", "og:locale", siteConfig.locale);
    setMetaTag('meta[name="twitter:card"]', "name", "twitter:card", siteConfig.twitterCard);
    setMetaTag('meta[name="twitter:title"]', "name", "twitter:title", metaTitle);
    setMetaTag('meta[name="twitter:description"]', "name", "twitter:description", metaDescription);
    setMetaTag('meta[name="twitter:image"]', "name", "twitter:image", metaImage);

    if (siteConfig.twitterSite) {
      setMetaTag('meta[name="twitter:site"]', "name", "twitter:site", siteConfig.twitterSite);
    }
    if (publishedTime) {
      setMetaTag('meta[property="article:published_time"]', "property", "article:published_time", publishedTime);
    }
    if (modifiedTime) {
      setMetaTag('meta[property="article:modified_time"]', "property", "article:modified_time", modifiedTime);
    }

    setLinkTag("canonical", canonicalUrl);

    document.head.querySelectorAll('script[data-seo-jsonld="true"]').forEach((element) => element.parentNode?.removeChild(element));
    const scripts = (Array.isArray(structuredData) ? structuredData : structuredData ? [structuredData] : []).filter(Boolean);
    scripts.forEach((entry) => {
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.dataset.seoJsonld = "true";
      script.text = JSON.stringify(entry);
      document.head.appendChild(script);
    });
  }, [canonicalPath, description, image, keywords, modifiedTime, noFollow, noIndex, publishedTime, robots, structuredData, title, type]);

  return null;
};

export default Seo;
