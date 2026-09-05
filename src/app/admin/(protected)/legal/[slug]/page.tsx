import { notFound } from "next/navigation";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { PageHeader } from "@/components/admin/page-header";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { updateLegalPageAction } from "@/server/actions/legal";

export default async function EditLegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await prisma.legalPage.findUnique({ where: { slug } });
  if (!page) notFound();

  return (
    <div>
      <PageHeader
        title={page.title}
        description={`/legal/${page.slug}`}
        actions={
          <Button asChild variant="outline">
            <Link href={`/legal/${page.slug}`} target="_blank">Preview</Link>
          </Button>
        }
      />
      <div className="p-8 max-w-3xl">
        <form action={updateLegalPageAction.bind(null, slug)} className="space-y-5">
          <div className="space-y-1.5">
            <Label>Title</Label>
            <Input name="title" defaultValue={page.title} required />
          </div>
          <div className="space-y-1.5">
            <Label>Content (HTML)</Label>
            <Textarea name="content" defaultValue={page.content} rows={24} required className="font-mono text-xs" />
            <p className="text-xs text-neutral-400">
              Basic HTML — use &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;/&lt;li&gt;, &lt;strong&gt;, &lt;a&gt;.
            </p>
          </div>
          <Button type="submit">Save Changes</Button>
        </form>
      </div>
    </div>
  );
}
