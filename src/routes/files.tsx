import { createFileRoute } from "@tanstack/react-router";
import { FileArchive, FileImage, FileSpreadsheet, FileText, Upload } from "lucide-react";
import { toast } from "sonner";
import { GlassPanel, IconTile, PageHeader, SectionTitle } from "@/components/nexus/glass";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

export const Route = createFileRoute("/files")({
  head: () => ({
    meta: [
      { title: "Files — Nexus AI OS" },
      {
        name: "description",
        content: "Files in Nexus: documents, spreadsheets and assets with storage at a glance.",
      },
      { property: "og:title", content: "Files — Nexus AI OS" },
      { property: "og:description", content: "Documents, spreadsheets and assets in one place." },
    ],
  }),
  component: FilesPage,
});

const files = [
  { name: "Nexus Pro brief.pdf", meta: "2.4 MB · 2h ago", icon: FileText, tone: "azure" as const },
  { name: "Q2 revenue.xlsx", meta: "812 KB · 4h ago", icon: FileSpreadsheet, tone: "mint" as const },
  { name: "Launch keyvisual.png", meta: "6.1 MB · yesterday", icon: FileImage, tone: "violet" as const },
  { name: "Brand assets.zip", meta: "48 MB · 3 days ago", icon: FileArchive, tone: "amber" as const },
  { name: "Interview notes.pdf", meta: "310 KB · 4 days ago", icon: FileText, tone: "azure" as const },
  { name: "Roadmap export.xlsx", meta: "1.1 MB · last week", icon: FileSpreadsheet, tone: "mint" as const },
];

function FilesPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="WORKSPACE"
        title="Files"
        description="Everything your team has shared, kept close to the work it belongs to."
        actions={
          <Button
            onClick={() => toast.success("Upload started", { description: "Storage connects with the backend." })}
            className="brand-gradient rounded-xl text-primary-foreground hover:opacity-90"
          >
            <Upload className="h-4 w-4" /> Upload
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
        <GlassPanel className="p-5">
          <SectionTitle title="Recent files" />
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {files.map((file) => (
              <button
                key={file.name}
                type="button"
                onClick={() => toast(file.name, { description: "Preview coming soon." })}
                className="glass glass-hover flex items-center gap-3 rounded-xl px-3 py-3 text-left"
              >
                <IconTile tone={file.tone}>
                  <file.icon className="h-[1.05rem] w-[1.05rem]" />
                </IconTile>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium">{file.name}</span>
                  <span className="block truncate text-xs text-muted-foreground">{file.meta}</span>
                </span>
              </button>
            ))}
          </div>
        </GlassPanel>

        <aside className="space-y-5">
          <GlassPanel className="p-5">
            <SectionTitle title="Storage" />
            <p className="mt-4 text-2xl font-semibold">58.7 GB</p>
            <p className="text-xs text-muted-foreground">of 200 GB used</p>
            <Progress value={29} className="mt-4 h-1.5 bg-glass" />
          </GlassPanel>

          <GlassPanel
            className="cursor-pointer border-dashed p-8 text-center"
            interactive
            onClick={() => toast("Drop files here once storage is connected.")}
          >
            <Upload className="mx-auto h-5 w-5 text-muted-foreground" />
            <p className="mt-3 text-sm font-medium">Drag files here</p>
            <p className="mt-1 text-xs text-muted-foreground">or click to browse your device</p>
          </GlassPanel>
        </aside>
      </div>
    </div>
  );
}
