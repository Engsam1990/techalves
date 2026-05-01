import { describe, expect, it } from "vitest";
import { buildWhatsAppUrl, siteConfig } from "@/config/site";

describe("site config", () => {
  it("creates a WhatsApp URL using the configured number", () => {
    const url = buildWhatsAppUrl("Hello Techalves");
    expect(url).toContain(`wa.me/${siteConfig.supportPhoneE164}`);
    expect(decodeURIComponent(url)).toContain("Hello Techalves");
  });
});
