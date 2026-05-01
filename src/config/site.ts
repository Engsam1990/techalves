const trim = (value: string | undefined) => (value ?? "").trim();

const resolveSiteUrl = () => {
  const envUrl = trim(import.meta.env.VITE_SITE_URL);
  if (envUrl) return envUrl.replace(/\/$/, "");
  if (typeof window !== "undefined" && window.location?.origin) {
    return window.location.origin.replace(/\/$/, "");
  }
  return "http://localhost:8080";
};

export const siteConfig = {
  businessName: "TECHALVES Solutions",
  siteUrl: resolveSiteUrl(),
  language: "en",
  locale: "en_KE",
  themeColor: "#0f172a",
  defaultTitle: "TECHALVES Solutions | Laptops, Phones, Desktops & Office Equipment in Kenya",
  defaultDescription:
    "Buy laptops, computers, phones, tablets, cameras and office equipment in Kenya from TECHALVES Solutions. Shop new, refurbished and ex-UK devices with warranty support.",
  defaultKeywords: [
    "TECHALVES Solutions",
    "laptops in Kenya",
    "refurbished laptops Kenya",
    "ex-UK laptops Kenya",
    "phones and tablets Kenya",
    "computers and desktops Kenya",
    "office equipment Kenya",
  ],
  defaultOgImage: "/og-image.png",
  twitterCard: "summary_large_image",
  twitterSite: trim(import.meta.env.VITE_TWITTER_SITE),
  supportPhoneDisplay: trim(import.meta.env.VITE_SUPPORT_PHONE_DISPLAY) || "+254 768 887 821",
  supportPhoneE164: trim(import.meta.env.VITE_SUPPORT_PHONE_E164) || "254768887821",
  supportEmail: trim(import.meta.env.VITE_SUPPORT_EMAIL) || "danielmutua104@gmail.com",
  location: trim(import.meta.env.VITE_LOCATION) || "Nairobi, Kenya",
  businessHours: trim(import.meta.env.VITE_BUSINESS_HOURS) || "Mon-Sat: 8:00 AM – 6:00 PM",
  supportWhatsAppMessage:
    trim(import.meta.env.VITE_SUPPORT_WHATSAPP_MESSAGE) ||
    "Hi TECHALVES Solutions! I'd like to inquire about your products.",
} as const;

export function buildWhatsAppUrl(message?: string) {
  const text = encodeURIComponent(message ?? siteConfig.supportWhatsAppMessage);
  return `https://wa.me/${siteConfig.supportPhoneE164}?text=${text}`;
}
