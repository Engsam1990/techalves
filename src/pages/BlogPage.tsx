import { Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useBlogPosts } from "@/api/hooks";
import { Calendar, Clock, ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BlogCardSkeleton from "@/components/skeletons/BlogCardSkeleton";
import QueryErrorState from "@/components/QueryErrorState";
import Seo from "@/components/seo/Seo";
import { createWebPageSchema, stripHtml } from "@/lib/seo";

const BlogPage = () => {
  const { data: blogPosts = [], isLoading, isError, refetch } = useBlogPosts();

  return (
    <Layout>
      <Seo
        title="Tech Blog, Buying Guides & Product Tips"
        description="Read TECHALVES Solutions blog posts for tech tips, buying guides, refurbished laptop advice, smartphone recommendations and security camera setup help in Kenya."
        canonicalPath="/blog"
        keywords={["tech blog Kenya", "laptop buying guide Kenya", "refurbished laptop tips", "TECHALVES blog"]}
        structuredData={createWebPageSchema("TECHALVES Blog", "/blog", "Tech tips, product reviews and buying guides from TECHALVES Solutions.")}
      />
      <div className="relative h-48 bg-[#030303] overflow-hidden">
        <div className="relative container h-full flex flex-col justify-center">
          <h1 className="text-3xl font-display font-bold text-primary-foreground">Blog</h1>
          <p className="text-primary-foreground/70 mt-1">Tech tips, product reviews, and buying guides</p>
        </div>
      </div>

      <div className="container py-12">
        {isError && <QueryErrorState message="Failed to load blog posts" onRetry={() => refetch()} compact />}
        <div className="grid gap-8 md:grid-cols-2">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => <BlogCardSkeleton key={i} />)
            : blogPosts.map((post, i) => (
                <motion.article
                  key={post.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Link to={`/blog/${post.slug}`} className="group block rounded-xl bg-card border overflow-hidden hover:shadow-card transition-all">
                    <div className="aspect-[16/9] overflow-hidden bg-muted">
                      <img src={post.image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                    </div>
                    <div className="p-6 space-y-3">
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded font-medium">{post.category}</span>
                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{post.date}</span>
                        <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{post.readTime}</span>
                      </div>
                      <h2 className="text-xl font-display font-bold group-hover:text-primary transition-colors">{post.title}</h2>
                      <p className="text-sm text-muted-foreground line-clamp-2">{stripHtml(post.excerpt)}</p>
                      <span className="inline-flex items-center gap-1 text-sm font-medium text-primary group-hover:gap-2 transition-all">
                        Read More <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </Link>
                </motion.article>
              ))}
        </div>
      </div>
    </Layout>
  );
};

export default BlogPage;
