import Layout from "@/components/layout/Layout";
import { ShieldCheck, RotateCcw, Clock, AlertTriangle } from "lucide-react";
import Seo from "@/components/seo/Seo";
import { createWebPageSchema } from "@/lib/seo";

const WarrantyPage = () => {
  return (
    <Layout>
      <Seo
        title="Return & Warranty Policy"
        description="Read the TECHALVES Solutions return, replacement and warranty policy for new, refurbished and ex-UK devices sold in Kenya."
        canonicalPath="/warranty"
        keywords={["warranty policy Kenya", "return policy laptops Kenya", "TECHALVES warranty"]}
        structuredData={createWebPageSchema("Return & Warranty Policy", "/warranty", "Read the TECHALVES Solutions return and warranty policy for devices sold in Kenya.")}
      />
      <div className="relative h-48 bg-[#030303] overflow-hidden">
        <div className="relative container h-full flex flex-col justify-center">
          <h1 className="text-3xl font-display font-bold text-primary-foreground">Return & Warranty Policy</h1>
          <p className="text-primary-foreground/70 mt-1">Our commitment to your satisfaction</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="max-w-3xl mx-auto space-y-10">
          {/* Summary cards */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { icon: RotateCcw, title: "7-Day Returns", desc: "Return within 7 days for a full refund" },
              { icon: ShieldCheck, title: "Warranty Coverage", desc: "3-12 months depending on product" },
              { icon: Clock, title: "Quick Resolution", desc: "Issues resolved within 48 hours" },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="rounded-xl border bg-card p-5 text-center space-y-2">
                <Icon className="h-8 w-8 text-primary mx-auto" />
                <h3 className="font-display font-semibold">{title}</h3>
                <p className="text-sm text-muted-foreground">{desc}</p>
              </div>
            ))}
          </div>

          {/* Warranty details */}
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold">Warranty Coverage</h2>
            <div className="rounded-lg border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Product Type</th>
                    <th className="text-left p-3 font-medium">Warranty Period</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["New Products (with manufacturer warranty)", "As per manufacturer (typically 1 year)"],
                    ["Refurbished Laptops & Desktops", "6 months TECHALVES warranty"],
                    ["Ex-UK Laptops & Desktops", "3 months TECHALVES warranty"],
                    ["Refurbished Phones & Tablets", "3 months TECHALVES warranty"],
                    ["Accessories & Peripherals", "1 month TECHALVES warranty"],
                  ].map(([type, period], i) => (
                    <tr key={i} className="border-t">
                      <td className="p-3">{type}</td>
                      <td className="p-3 text-muted-foreground">{period}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* What's covered */}
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold">What's Covered</h2>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Hardware defects and malfunctions under normal use",
                "Display issues (dead pixels, backlight failure)",
                "Battery failure within warranty period",
                "Charging port and connector issues",
                "Storage drive and memory failures",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* What's not covered */}
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold">What's Not Covered</h2>
            <ul className="space-y-2 text-muted-foreground">
              {[
                "Physical damage (drops, spills, cracks)",
                "Software issues (viruses, OS reinstallation)",
                "Unauthorized modifications or repairs",
                "Normal wear and tear (cosmetic scratches, key fading)",
                "Accessories not purchased from TECHALVES",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <AlertTriangle className="h-5 w-5 text-destructive shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Return policy */}
          <section className="space-y-4">
            <h2 className="text-xl font-display font-bold">Return Policy</h2>
            <div className="space-y-3 text-muted-foreground">
              <p>We offer a <strong className="text-foreground">7-day return policy</strong> from the date of delivery. To be eligible for a return:</p>
              <ul className="list-disc list-inside space-y-1 ml-2">
                <li>The product must be in its original condition with all accessories</li>
                <li>You must have the original receipt or proof of purchase</li>
                <li>The product must not show signs of physical damage or misuse</li>
              </ul>
              <p>To initiate a return, contact us via WhatsApp or email with your order details and reason for return. We aim to process all returns within 48 hours.</p>
            </div>
          </section>
        </div>
      </div>
    </Layout>
  );
};

export default WarrantyPage;
