import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { BlogPostForm } from "@/components/admin/blog/blog-post-form";
import { Button } from "@/components/ui/button";
import { updateBlogPostAction, deleteBlogPostAction } from "@/server/actions/blog";
import { Trash2 } from "lucide-react";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [post, categories] = await Promise.all([
    prisma.blogPost.findUnique({ where: { id } }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);
  if (!post) notFound();

  return (
    <div>
      <PageHeader
        title={post.title}
        description={`/blog/${post.slug}`}
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline">
              <Link href={`/blog/${post.slug}`} target="_blank">Preview</Link>
            </Button>
            <form action={deleteBlogPostAction.bind(null, post.id)}>
              <Button type="submit" variant="destructive"><Trash2 className="size-4" /> Delete</Button>
            </form>
          </div>
        }
      />
      <div className="p-8">
        <BlogPostForm
          action={updateBlogPostAction.bind(null, post.id)}
          categories={categories}
          submitLabel="Save Changes"
          initial={{
            title: post.title,
            slug: post.slug,
            excerpt: post.excerpt,
            content: post.content,
            categoryId: post.categoryId ?? "",
            tags: Array.isArray(post.tags) ? (post.tags as string[]).join(", ") : "",
            authorName: post.authorName,
            coverImageUrl: post.coverImageUrl ?? "",
            readingMinutes: post.readingMinutes,
            seoTitle: post.seoTitle ?? "",
            seoDescription: post.seoDescription ?? "",
            featured: post.featured,
            status: post.status,
          }}
        />
      </div>
    </div>
  );
}
