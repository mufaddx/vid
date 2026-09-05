import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { BlogPostForm } from "@/components/admin/blog/blog-post-form";
import { createBlogPostAction } from "@/server/actions/blog";

export default async function NewBlogPostPage() {
  const categories = await prisma.blogCategory.findMany({ orderBy: { name: "asc" } });

  return (
    <div>
      <PageHeader title="New Blog Post" description="Write and publish a new article." />
      <div className="p-8">
        <BlogPostForm action={createBlogPostAction} categories={categories} submitLabel="Create Post" />
      </div>
    </div>
  );
}
