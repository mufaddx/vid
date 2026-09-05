"use server";

import { z } from "zod";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth";
import { slugify } from "@/lib/format";
import { logActivity } from "@/lib/activity";

const postSchema = z.object({
  title: z.string().min(3),
  slug: z.string().optional(),
  excerpt: z.string().min(1),
  content: z.string().min(1),
  categoryId: z.string().optional(),
  tags: z.string().optional(), // comma-separated in the form
  authorName: z.string().optional(),
  coverImageUrl: z.string().optional(),
  readingMinutes: z.coerce.number().int().min(1).max(60).optional(),
  seoTitle: z.string().optional(),
  seoDescription: z.string().optional(),
  featured: z.coerce.boolean().optional(),
  status: z.enum(["DRAFT", "PUBLISHED"]),
});

function parseTags(raw?: string): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
}

export async function createBlogPostAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = postSchema.parse(Object.fromEntries(formData.entries()));
  let slug = data.slug?.trim() ? slugify(data.slug) : slugify(data.title);
  if (await prisma.blogPost.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  const post = await prisma.blogPost.create({
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      categoryId: data.categoryId || undefined,
      tags: parseTags(data.tags),
      authorName: data.authorName || "VIDLIX Team",
      coverImageUrl: data.coverImageUrl || undefined,
      readingMinutes: data.readingMinutes || 4,
      seoTitle: data.seoTitle || undefined,
      seoDescription: data.seoDescription || undefined,
      featured: data.featured ?? false,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? new Date() : null,
    },
  });

  await logActivity({ actorId: session.id, action: `Blog post "${post.title}" created`, entityType: "BlogPost", entityId: post.id });
  redirect(`/admin/blog/${post.id}`);
}

export async function updateBlogPostAction(postId: string, formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = postSchema.parse(Object.fromEntries(formData.entries()));
  const existing = await prisma.blogPost.findUniqueOrThrow({ where: { id: postId } });

  let slug = data.slug?.trim() ? slugify(data.slug) : existing.slug;
  if (slug !== existing.slug && (await prisma.blogPost.findUnique({ where: { slug } }))) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }

  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      slug,
      title: data.title,
      excerpt: data.excerpt,
      content: data.content,
      categoryId: data.categoryId || null,
      tags: parseTags(data.tags),
      authorName: data.authorName || "VIDLIX Team",
      coverImageUrl: data.coverImageUrl || null,
      readingMinutes: data.readingMinutes || 4,
      seoTitle: data.seoTitle || null,
      seoDescription: data.seoDescription || null,
      featured: data.featured ?? false,
      status: data.status,
      publishedAt: data.status === "PUBLISHED" ? existing.publishedAt ?? new Date() : existing.publishedAt,
    },
  });

  await logActivity({ actorId: session.id, action: `Blog post "${data.title}" updated`, entityType: "BlogPost", entityId: postId });
  revalidatePath(`/admin/blog/${postId}`);
  revalidatePath("/blog");
  revalidatePath(`/blog/${slug}`);
}

export async function deleteBlogPostAction(postId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const post = await prisma.blogPost.delete({ where: { id: postId } });
  await logActivity({ actorId: session.id, action: `Blog post "${post.title}" deleted`, entityType: "BlogPost", entityId: postId });
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
  redirect("/admin/blog");
}

export async function toggleBlogPostStatusAction(postId: string): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const post = await prisma.blogPost.findUniqueOrThrow({ where: { id: postId } });
  const nextStatus = post.status === "PUBLISHED" ? "DRAFT" : "PUBLISHED";
  await prisma.blogPost.update({
    where: { id: postId },
    data: {
      status: nextStatus,
      publishedAt: nextStatus === "PUBLISHED" ? post.publishedAt ?? new Date() : post.publishedAt,
    },
  });

  await logActivity({ actorId: session.id, action: `Blog post "${post.title}" set to ${nextStatus}`, entityType: "BlogPost", entityId: postId });
  revalidatePath(`/admin/blog/${postId}`);
  revalidatePath("/admin/blog");
  revalidatePath("/blog");
}

const categorySchema = z.object({ name: z.string().min(2) });

export async function createBlogCategoryAction(formData: FormData): Promise<void> {
  const session = await getSession();
  if (!session) redirect("/admin/login");

  const data = categorySchema.parse(Object.fromEntries(formData.entries()));
  let slug = slugify(data.name);
  if (await prisma.blogCategory.findUnique({ where: { slug } })) {
    slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  }
  await prisma.blogCategory.create({ data: { name: data.name, slug } });
  revalidatePath("/admin/blog");
}
