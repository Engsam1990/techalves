import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Phone, Mail, MapPin, Clock, MessageCircle, Loader2 } from "lucide-react";
import { useSubmitContact } from "@/api/hooks";
import { buildWhatsAppUrl, siteConfig } from "@/config/site";
import { toast } from "sonner";
import Seo from "@/components/seo/Seo";
import { createOrganizationSchema, createWebPageSchema } from "@/lib/seo";

const ContactPage = () => {
  const [form, setForm] = useState({ fullName: "", email: "", phone: "", subject: "", message: "" });
  const submitContact = useSubmitContact();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitContact.mutate(form, {
      onSuccess: (data) => {
        toast.success(data.message || "Message sent successfully!");
        setForm({ fullName: "", email: "", phone: "", subject: "", message: "" });
      },
      onError: (err) => {
        toast.error(err.message || "Failed to send message");
      },
    });
  };

  const contactItems = [
    { icon: Phone, label: "Phone", value: siteConfig.supportPhoneDisplay, href: `tel:+${siteConfig.supportPhoneE164}` },
    { icon: Mail, label: "Email", value: siteConfig.supportEmail, href: `mailto:${siteConfig.supportEmail}` },
    { icon: MapPin, label: "Location", value: siteConfig.location, href: "#" },
    { icon: Clock, label: "Business Hours", value: siteConfig.businessHours, href: "#" },
  ];

  return (
    <Layout>
      <Seo
        title="Contact TECHALVES Solutions"
        description="Contact TECHALVES Solutions in Nairobi for product inquiries, support, bulk orders, WhatsApp assistance and after-sales help across Kenya."
        canonicalPath="/contact"
        keywords={["contact TECHALVES Solutions", "tech support Kenya", "computer shop Nairobi contact"]}
        structuredData={[createOrganizationSchema(), createWebPageSchema("Contact TECHALVES Solutions", "/contact", "Contact TECHALVES Solutions for product inquiries, support and bulk orders in Kenya.")]}
      />
      <div className="relative h-48 bg-[#030303] overflow-hidden">
        <div className="relative container h-full flex flex-col justify-center">
          <h1 className="text-3xl font-display font-bold text-primary-foreground">Contact Us</h1>
          <p className="text-primary-foreground/70 mt-1">We'd love to hear from you</p>
        </div>
      </div>

      <div className="container py-12">
        <div className="grid lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-display font-bold mb-4">Get in Touch</h2>
              <p className="text-muted-foreground">Have a question about a product, need support, or want to discuss a bulk order? Reach out through any of the channels below.</p>
            </div>

            <div className="space-y-6">
              {contactItems.map(({ icon: Icon, label, value, href }) => (
                <div key={label} className="flex items-start gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-sm">{label}</h3>
                    <a href={href} className="text-muted-foreground hover:text-primary transition-colors">{value}</a>
                  </div>
                </div>
              ))}
            </div>

            <a href={buildWhatsAppUrl()} target="_blank" rel="noopener noreferrer">
              <Button variant="secondary" size="lg" className="gap-2 font-semibold w-full sm:w-auto mt-4">
                <MessageCircle className="h-5 w-5" />
                Chat on WhatsApp
              </Button>
            </a>
          </div>

          <form onSubmit={handleSubmit} className="rounded-xl border bg-card p-6 sm:p-8 space-y-6">
            <h2 className="text-xl font-display font-bold">Send a Message</h2>
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Full Name</label>
                <Input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <Input name="email" type="email" value={form.email} onChange={handleChange} placeholder="john@example.com" required />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone Number</label>
              <Input name="phone" value={form.phone} onChange={handleChange} placeholder="+254 7XX XXX XXX" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Subject</label>
              <Input name="subject" value={form.subject} onChange={handleChange} placeholder="Product inquiry" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Message</label>
              <Textarea name="message" value={form.message} onChange={handleChange} placeholder="Tell us how we can help..." rows={5} required />
            </div>
            <Button type="submit" size="lg" className="w-full font-semibold" disabled={submitContact.isPending}>
              {submitContact.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
              Send Message
            </Button>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ContactPage;
