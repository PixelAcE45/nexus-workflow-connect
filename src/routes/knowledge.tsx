import { createFileRoute } from "@tanstack/react-router";
import { BookOpen, FileText, Plus, Search, Sparkles } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { GlassPanel, IconTile, PageHeader, SectionTitle } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/knowledge")({
  head: () => ({
    meta: [
      { title: "Knowledge — Nexus AI OS" },
      {
        name: "description",
        content:
          "The Nexus knowledge hub: documents, notes and research the assistant can reason over.",
      },
      { property: "og:title", content: "Knowledge — Nexus AI OS" },
      { property: "og:description", content: "Documents, notes and research the assistant can reason over." },
    ],
  }),
  component: KnowledgePage,
});

const collections = [
  { name: "Product", count: 24, tone: "violet" as const },
  { name: "Research", count: 11, tone: "azure" as const },
  { name: "Operations", count: 16, tone: "mint" as const },
  { name: "Client notes", count: 9, tone: "amber" as const },
];

const documents = [
  { title: "Nexus documentation", meta: "Product · updated 2h ago" },
  { title: "Meeting notes — May 10", meta: "Operations · updated 5h ago" },
  { title: "AI research paper summary", meta: "Research · updated 1d ago" },
  { title: "Brand & voice guidelines", meta: "Product · updated 3d ago" },
  { title: "Acme Corp. account history", meta: "Client notes · updated 5d ago" },
];

function KnowledgePage() {
  const [query, setQuery] = useState("");
  const filtered = documents.filter((doc) =>
    doc.title.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="INTELLIGENCE"
        title="Knowledge"
        description="Everything Nexus reads before it answers. Organised by collection, searchable in plain language."
        actions={
          <Button
            onClick={() => toast.success("Add to knowledge", { description: "Uploads arrive with the backend." })}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            <Plus className="h-4 w-4" /> Add document
          </Button>
        }
      />

      <GlassPanel className="flex items-center gap-3 rounded-xl px-4 py-2.5">
        <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search the knowledge base"
          className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
      </GlassPanel>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {collections.map((collection) => (
          <GlassPanel
            key={collection.name}
            interactive
            className="cursor-pointer p-5"
            onClick={() => toast(`${collection.name} collection`, { description: `${collection.count} documents` })}
          >
            <IconTile tone={collection.tone}>
              <BookOpen className="h-[1.05rem] w-[1.05rem]" />
            </IconTile>
            <p className="mt-5 truncate text-sm font-semibold">{collection.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{collection.count} documents</p>
          </GlassPanel>
        ))}
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <GlassPanel className="p-5">
          <SectionTitle title="Recent documents" />
          <ul className="mt-4 divide-y divide-[var(--hairline)]">
            {filtered.map((doc) => (
              <li key={doc.title}>
                <button
                  type="button"
                  onClick={() => toast(doc.title, { description: "Document viewer coming soon." })}
                  className="flex w-full items-center gap-3 px-1 py-3 text-left transition-colors hover:bg-glass"
                >
                  <IconTile tone="azure" className="h-9 w-9">
                    <FileText className="h-4 w-4" />
                  </IconTile>
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-medium">{doc.title}</span>
                    <span className="block truncate text-xs text-muted-foreground">{doc.meta}</span>
                  </span>
                </button>
              </li>
            ))}
            {filtered.length === 0 ? (
              <li className="py-8 text-center text-sm text-muted-foreground">
                Nothing matches “{query}”.
              </li>
            ) : null}
          </ul>
        </GlassPanel>

        <GlassPanel className="p-5">
          <div className="flex items-center gap-3">
            <IconTile tone="violet">
              <Sparkles className="h-[1.05rem] w-[1.05rem]" />
            </IconTile>
            <div className="min-w-0">
              <p className="text-sm font-medium">Ask your knowledge</p>
              <p className="text-xs text-muted-foreground">Grounded answers with citations</p>
            </div>
          </div>
          <p className="mt-4 text-sm text-muted-foreground">
            Nexus indexes every document you add so the assistant can answer from your own material
            instead of guessing.
          </p>
        </GlassPanel>
      </div>
    </div>
  );
}
