import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { EmptyState } from "@/components/empty-state";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/lib/format";
import { Newspaper, Plus } from "lucide-react";
import { createBlogCategoryAction, toggleBlogPostStatusAction } from "@/server/actions/blog";
import { Input } from "@/components/ui/input";

export default async function AdminBlogPage() {
  const [posts, categories] = await Promise.all([
    prisma.blogPost.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.blogCategory.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <PageHeader
        title="Blog"
        description="Manage published articles, drafts and categories."
        actions={
          <Button asChild>
            <Link href="/admin/blog/new"><Plus className="size-4" /> New Post</Link>
          </Button>
        }
      />

      <div className="p-8 space-y-8">
        <div className="rounded-xl border border-neutral-200 bg-white p-5">
          <h3 className="text-sm font-semibold text-neutral-700 mb-3">Categories</h3>
          <div className="flex flex-wrap items-center gap-2 mb-4">
            {categories.map((c) => (
              <span key={c.id} className="text-xs px-2.5 py-1 rounded-full bg-violet-50 text-violet-700 border border-violet-100">
                {c.name}
              </span>
            ))}
            {categories.length === 0 ? <span className="text-sm text-neutral-400">No categories yet.</span> : null}
          </div>
          <form action={createBlogCategoryAction} className="flex items-center gap-2 max-w-sm">
            <Input name="name" placeholder="New category name" required className="h-9" />
            <Button type="submit" variant="outline" size="sm">Add</Button>
          </form>
        </div>

        {posts.length === 0 ? (
          <EmptyState icon={Newspaper} title="No blog posts yet" description="Create your first article to get started." />
        ) : (
          <div className="rounded-xl border border-neutral-200 bg-white overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Published</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell className="font-medium">
                      <Link href={`/admin/blog/${post.id}`} className="hover:text-violet-700">{post.title}</Link>
                      {post.featured ? <span className="ml-2 text-[10px] px-1.5 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100">FEATURED</span> : null}
                    </TableCell>
                    <TableCell className="text-neutral-500 text-sm">{post.category?.name ?? "—"}</TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${post.status === "PUBLISHED" ? "bg-emerald-50 text-emerald-700 border border-emerald-100" : "bg-neutral-100 text-neutral-500 border border-neutral-200"}`}>
                        {post.status}
                      </span>
                    </TableCell>
                    <TableCell className="text-neutral-500 text-sm">{post.publishedAt ? formatDate(post.publishedAt) : "—"}</TableCell>
                    <TableCell className="text-right">
                      <form action={toggleBlogPostStatusAction.bind(null, post.id)} className="inline">
                        <Button type="submit" variant="ghost" size="sm">
                          {post.status === "PUBLISHED" ? "Unpublish" : "Publish"}
                        </Button>
                      </form>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={`/admin/blog/${post.id}`}>Edit</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}
