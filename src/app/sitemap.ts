import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://vidlix.in";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes = [
    "",
    "/creators",
    "/for-brands",
    "/for-creators",
    "/how-it-works",
    "/about",
    "/contact",
    "/faq",
    "/blog",
    "/legal",
    "/brand-inquiry",
    "/creator-inquiry",
  ].map((path) => ({
    url: `${SITE_URL}${path}`,
    lastModified: new Date(),
  }));

  const [creators, posts, legalPages] = await Promise.all([
    prisma.creator.findMany({ where: { status: "ACTIVE" }, select: { slug: true, updatedAt: true } }),
    prisma.blogPost.findMany({ where: { status: "PUBLISHED" }, select: { slug: true, updatedAt: true } }),
    prisma.legalPage.findMany({ select: { slug: true, updatedAt: true } }),
  ]);

  return [
    ...staticRoutes,
    ...creators.map((c) => ({ url: `${SITE_URL}/creators/${c.slug}`, lastModified: c.updatedAt })),
    ...posts.map((p) => ({ url: `${SITE_URL}/blog/${p.slug}`, lastModified: p.updatedAt })),
    ...legalPages.map((l) => ({ url: `${SITE_URL}/legal/${l.slug}`, lastModified: l.updatedAt })),
  ];
}
