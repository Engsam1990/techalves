import { useParams, Link } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { useBlogPost } from "@/api/hooks";
import { Button } from "@/components/ui/button";
import { Calendar, Clock, ChevronLeft, User } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import QueryErrorState from "@/components/QueryErrorState";
import Seo from "@/components/seo/Seo";
import { createBreadcrumbSchema, stripHtml, toIsoDate, truncateText } from "@/lib/seo";

const BlogPostSkeleton = () => (
  <Layout>
    <Skeleton className="h-64 sm:h-80 w-full" />
    <div className="container py-10">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="flex gap-4">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-4 w-20" />
        </div>
        <Skeleton className="h-6 w-full" />
        <Skeleton className="h-6 w-3/4" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
      </div>
    </div>
  </Layout>
);

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const { data: post, isLoading, isError, refetch } = useBlogPost(slug || "");

  const articleDescription = post ? truncateText(post.excerpt || stripHtml(post.content), 160) : "Read the latest tech article from TECHALVES Solutions.";
  const articlePublishedTime = post ? toIsoDate(post.date) : undefined;
  const articleStructuredData = post
    ? [
        createBreadcrumbSchema([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]),
        {
          "@context": "https://schema.org",
          "@type": "Article",
          headline: post.title,
          description: articleDescription,
          image: post.image,
          datePublished: articlePublishedTime,
          dateModified: articlePublishedTime,
          author: { "@type": "Organization", name: post.author },
        },
      ]
    : undefined;

  if (isLoading) return <BlogPostSkeleton />;

  if (isError) {
    return (
      <Layout>
        <Seo title="Blog Article" description="Blog content is temporarily unavailable." noIndex noFollow />
        <div className="container py-20">
          <QueryErrorState message="Failed to load blog post" onRetry={() => refetch()} />
        </div>
      </Layout>
    );
  }

  if (!post) {
    return (
      <Layout>
        <Seo title="Article Not Found" description="The requested blog article could not be found." noIndex noFollow />
        <div className="container py-20 text-center">
          <h1 className="text-2xl font-display font-bold">Post not found</h1>
          <Link to="/blog"><Button className="mt-4">Back to Blog</Button></Link>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Seo
        title={post.title}
        description={articleDescription}
        canonicalPath={`/blog/${post.slug}`}
        image={post.image}
        type="article"
        publishedTime={articlePublishedTime}
        modifiedTime={articlePublishedTime}
        keywords={[post.category, post.title, "TECHALVES blog"]}
        structuredData={articleStructuredData}
      />
      <div className="relative h-64 sm:h-80 bg-[#030303] overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(${post.image})` }} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#030303]/90 to-[#030303]/45" />
        <div className="relative container h-full flex flex-col justify-end pb-8">
          <Link to="/blog" className="flex items-center gap-1 text-sm text-primary-foreground/70 hover:text-primary-foreground mb-4">
            <ChevronLeft className="h-4 w-4" /> Back to Blog
          </Link>
          <span className="text-sm bg-secondary text-secondary-foreground px-2 py-0.5 rounded w-fit mb-2">{post.category}</span>
          <h1 className="text-2xl sm:text-4xl font-display font-bold text-primary-foreground max-w-3xl">{post.title}</h1>
        </div>
      </div>

      <div className="container py-10">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-4 text-sm text-muted-foreground mb-8">
            <span className="flex items-center gap-1"><User className="h-4 w-4" />{post.author}</span>
            <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />{post.date}</span>
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" />{post.readTime}</span>
          </div>
          <article
            className="prose prose-lg max-w-none prose-headings:font-display prose-headings:text-foreground prose-p:text-muted-foreground prose-a:text-primary"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />
        </div>
      </div>
    </Layout>
  );
};

export default BlogPost;
