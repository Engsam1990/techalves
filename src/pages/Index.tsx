import Layout from "@/components/layout/Layout";
import HeroCarousel from "@/components/home/HeroCarousel";
import CategoryStrip from "@/components/home/CategoryStrip";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import Seo from "@/components/seo/Seo";
import { createOrganizationSchema, createWebsiteSchema, createWebPageSchema } from "@/lib/seo";

const Index = () => {
  return (
    <Layout>
      <Seo
        title="Computers, Laptops, Phones & Office Equipment in Kenya"
        description="Shop laptops, desktops, smartphones, tablets, cameras and office equipment in Kenya from TECHALVES Solutions. Browse new, refurbished and ex-UK devices backed by warranty support."
        canonicalPath="/"
        keywords={["computers in Kenya", "laptops in Kenya", "phones in Kenya", "refurbished laptops Kenya", "office equipment Kenya"]}
        structuredData={[
          createOrganizationSchema(),
          createWebsiteSchema(),
          createWebPageSchema("TECHALVES Solutions Home", "/", "Shop laptops, phones, desktops and office equipment in Kenya from TECHALVES Solutions."),
        ]}
      />
      <HeroCarousel />
      <CategoryStrip />
      <FeaturedProducts />
    </Layout>
  );
};

export default Index;
