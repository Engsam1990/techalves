import { Link } from "react-router-dom";
import logo from "@assets/logo.png";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useCategories } from "@/api/hooks";

const socialLinks = [
  {
    name: "Facebook",
    href: "https://www.facebook.com/share/1DxtebTjy7",
    icon: "/assets/facebook.svg",
    wrapperClass: "bg-white/5 ring-white/10 hover:bg-brand-yellow/20",
    iconClass: "h-5 w-5",
  },
  {
    name: "X",
    href: "",
    icon: "/assets/x.svg",
    wrapperClass: "bg-white/5 ring-white/10 hover:bg-brand-yellow/20",
    iconClass: "h-4.5 w-4.5",
  },
  {
    name: "Instagram",
    href: "https://www.instagram.com/kitonga_daniel.1?igsh=ODF4ejNrd3NuaXY3",
    icon: "/assets/instagram.svg",
    wrapperClass: "bg-white/5 ring-white/10 hover:bg-brand-yellow/20",
    iconClass: "h-5 w-5",
  },
  {
    name: "TikTok",
    href: "https://www.tiktok.com/@kitonga_daniel?_r=1&_t=ZS-94veHMW9g8t",
    icon: "/assets/tiktok.svg",
    wrapperClass: "bg-white/5 ring-white/10 hover:bg-brand-yellow/20",
    iconClass: "h-5 w-5",
  },
];

const Footer = () => {
  const { data: categories = [] } = useCategories();

  return (
    <footer className="bg-[#030303] text-primary-foreground">
      <div className="container py-10 sm:py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-4">
            <Link to="/">
              <img src={logo} alt="TECHALVES Solutions" className="h-12 w-auto sm:h-14" />
            </Link>
            <p className="max-w-xs text-sm text-primary-foreground/70">
              Your trusted tech partner — quality laptops, phones, desktops, and accessories at the best prices.
            </p>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`group flex h-10 w-10 items-center justify-center rounded-full ring-1 shadow-sm backdrop-blur-sm transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 ${social.wrapperClass}`}
                >
                  <img
                    src={social.icon}
                    alt={social.name}
                    className={`${social.iconClass} h-5 w-5 transition-transform duration-300 group-hover:scale-110`}
                  />
                </a>
              ))}
            </div>
          </div>
<div className="grid grid-cols-2 gap-8 lg:col-span-2">
          <div>
            <h4 className="mb-4 text-lg font-display font-semibold">Categories</h4>
            <ul className="space-y-2.5">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <Link to={`/category/${cat.slug}`} className="text-sm text-primary-foreground/70 transition-colors hover:text-brand-yellow">
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="mb-4 text-lg font-display font-semibold">Quick Links</h4>
            <ul className="space-y-2.5">
              {[
                { label: "About Us", to: "/about" },
                { label: "Contact", to: "/contact" },
                { label: "Blog", to: "/blog" },
                { label: "Return & Warranty Policy", to: "/warranty" },
              ].map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-sm text-primary-foreground/70 transition-colors hover:text-brand-yellow">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
</div>
          <div>
            <h4 className="mb-4 text-lg font-display font-semibold">Newsletter</h4>
            <p className="mb-3 text-sm text-primary-foreground/70">Get the latest deals and tech tips delivered to your inbox.</p>
            <div className="flex gap-2">
              <Input
                placeholder="Your email"
                className="border-white/10 bg-white/5 text-primary-foreground placeholder:text-primary-foreground/35"
              />
              <Button variant="highlight" className="shrink-0 font-semibold">Subscribe</Button>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-primary-foreground/50">
          © {new Date().getFullYear()} TECHALVES Solutions. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
