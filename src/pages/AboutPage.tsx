import Layout from "@/components/layout/Layout";
import { ShieldCheck, Users, Award, Zap } from "lucide-react";
import { motion } from "framer-motion";
import Seo from "@/components/seo/Seo";
import { createOrganizationSchema, createWebPageSchema } from "@/lib/seo";

const values = [
  { icon: ShieldCheck, title: "Quality Guaranteed", description: "Every product is rigorously tested before it reaches you. We stand behind our products with warranty coverage." },
  { icon: Users, title: "Customer First", description: "Our team is dedicated to providing exceptional service — from product selection to after-sales support." },
  { icon: Award, title: "Best Prices", description: "We source directly from manufacturers and trusted suppliers to offer you the most competitive prices in Kenya." },
  { icon: Zap, title: "Fast Delivery", description: "Same-day delivery in Nairobi and next-day delivery to major towns across Kenya." },
];

const AboutPage = () => {
  return (
    <Layout>
      <Seo
        title="About TECHALVES Solutions"
        description="Learn more about TECHALVES Solutions, a Nairobi-based tech retailer serving Kenya with laptops, phones, desktops, office equipment, warranty support and business technology solutions."
        canonicalPath="/about"
        keywords={["about TECHALVES Solutions", "tech shop Kenya", "computer shop Nairobi"]}
        structuredData={[createOrganizationSchema(), createWebPageSchema("About TECHALVES Solutions", "/about", "Learn about TECHALVES Solutions and its mission to make quality technology accessible in Kenya.")]}
      />
      <div className="relative h-48 bg-[#030303] overflow-hidden">
        <div className="relative container h-full flex flex-col justify-center">
          <h1 className="text-3xl font-display font-bold text-primary-foreground">About Us</h1>
          <p className="text-primary-foreground/70 mt-1">Your trusted tech partner in Kenya</p>
        </div>
      </div>

      <div className="container py-12 space-y-16">
        {/* Story */}
        <section className="max-w-3xl mx-auto text-center space-y-4">
          <h2 className="text-2xl font-display font-bold">Our Story</h2>
          <p className="text-muted-foreground leading-relaxed">
            TECHALVES Solutions was founded with a simple mission: to make quality technology accessible to everyone in Kenya. 
            We noticed that many people were paying premium prices for devices they could get at much better value — especially 
            in the refurbished and ex-UK market, where perception didn't match reality.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            We set out to change that by offering thoroughly tested, warranty-backed devices at fair prices. Today, we serve 
            thousands of customers across Kenya, from individual buyers to corporate clients, providing everything from laptops 
            and phones to complete office setups and security systems.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-2xl font-display font-bold text-center mb-10">Why Choose TECHALVES?</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v, i) => (
              <motion.div
                key={v.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="rounded-xl border bg-card p-6 text-center space-y-3"
              >
                <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto">
                  <v.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-display font-semibold">{v.title}</h3>
                <p className="text-sm text-muted-foreground">{v.description}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section className="rounded-2xl bg-[#030303] text-primary-foreground p-8 sm:p-12">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
            {[
              { value: "5,000+", label: "Happy Customers" },
              { value: "500+", label: "Products" },
              { value: "3+", label: "Years in Business" },
              { value: "98%", label: "Satisfaction Rate" },
            ].map((stat) => (
              <div key={stat.label}>
                <p className="text-3xl sm:text-4xl font-display font-bold text-secondary">{stat.value}</p>
                <p className="text-sm text-primary-foreground/70 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
    </Layout>
  );
};

export default AboutPage;
