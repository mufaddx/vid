"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BlogPostFormValues = {
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  categoryId: string;
  tags: string;
  authorName: string;
  coverImageUrl: string;
  readingMinutes: number;
  seoTitle: string;
  seoDescription: string;
  featured: boolean;
  status: "DRAFT" | "PUBLISHED";
};

export function BlogPostForm({
  action,
  categories,
  initial,
  submitLabel,
}: {
  action: (formData: FormData) => void;
  categories: { id: string; name: string }[];
  initial?: Partial<BlogPostFormValues>;
  submitLabel: string;
}) {
  const [categoryId, setCategoryId] = useState(initial?.categoryId ?? "");
  const [status, setStatus] = useState<"DRAFT" | "PUBLISHED">(initial?.status ?? "DRAFT");
  const [featured, setFeatured] = useState(initial?.featured ?? false);

  return (
    <form action={action} className="grid lg:grid-cols-[2fr_1fr] gap-8">
      <input type="hidden" name="categoryId" value={categoryId} />
      <input type="hidden" name="status" value={status} />
      <input type="hidden" name="featured" value={featured ? "true" : "false"} />

      <div className="space-y-5">
        <div className="space-y-1.5">
          <Label>Title *</Label>
          <Input name="title" defaultValue={initial?.title} required />
        </div>
        <div className="space-y-1.5">
          <Label>URL Slug</Label>
          <Input name="slug" defaultValue={initial?.slug} placeholder="auto-generated from title if left blank" />
        </div>
        <div className="space-y-1.5">
          <Label>Excerpt *</Label>
          <Textarea name="excerpt" defaultValue={initial?.excerpt} rows={2} required />
        </div>
        <div className="space-y-1.5">
          <Label>Content (HTML) *</Label>
          <Textarea name="content" defaultValue={initial?.content} rows={18} required className="font-mono text-xs" />
          <p className="text-xs text-neutral-400">
            Basic HTML — use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;a&gt;.
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
          <div className="flex items-center justify-between">
            <Label>Status</Label>
            <Select value={status} onValueChange={(v) => setStatus(v as "DRAFT" | "PUBLISHED")}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="PUBLISHED">Published</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <Label>Featured</Label>
            <Switch checked={featured} onCheckedChange={setFeatured} />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger className="w-full"><SelectValue placeholder="No category" /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Tags</Label>
          <Input name="tags" defaultValue={initial?.tags} placeholder="comma, separated, tags" />
        </div>
        <div className="space-y-1.5">
          <Label>Author</Label>
          <Input name="authorName" defaultValue={initial?.authorName || "VIDLIX Team"} />
        </div>
        <div className="space-y-1.5">
          <Label>Cover Image URL</Label>
          <Input name="coverImageUrl" defaultValue={initial?.coverImageUrl} placeholder="https://…" />
        </div>
        <div className="space-y-1.5">
          <Label>Reading Time (minutes)</Label>
          <Input name="readingMinutes" type="number" min={1} max={60} defaultValue={initial?.readingMinutes ?? 4} />
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4 space-y-4">
          <div className="text-xs font-semibold text-neutral-500">SEO</div>
          <div className="space-y-1.5">
            <Label className="text-xs">SEO Title</Label>
            <Input name="seoTitle" defaultValue={initial?.seoTitle} placeholder="Defaults to article title" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs">SEO Description</Label>
            <Textarea name="seoDescription" defaultValue={initial?.seoDescription} rows={2} placeholder="Defaults to excerpt" />
          </div>
        </div>

        <Button type="submit" className="w-full">{submitLabel}</Button>
      </div>
    </form>
  );
}
