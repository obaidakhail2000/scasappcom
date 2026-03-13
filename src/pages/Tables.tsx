import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Download, Trash2, Plus, Table2 } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import QRCode from "qrcode";

const APP_DOMAIN = window.location.origin;
const STORAGE_KEY = "meta_automation_qr_codes";

function generateReviewLink(tableId: string) {
  return `${APP_DOMAIN}/review?table=${encodeURIComponent(tableId)}`;
}

interface QREntry {
  id: string;
  name: string;
  tableId: string;
  url: string;
  created: string;
}

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } };
const item = { hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } };

export default function Tables() {
  const [tableName, setTableName] = useState("");
  const [codes, setCodes] = useState<QREntry[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(codes));
  }, [codes]);

  const previewId = tableName.trim().toLowerCase().replace(/\s+/g, "-");
  const previewUrl = previewId ? generateReviewLink(previewId) : "";

  useEffect(() => {
    if (previewCanvasRef.current && previewUrl) {
      QRCode.toCanvas(previewCanvasRef.current, previewUrl, { width: 180, margin: 2 });
    }
  }, [previewUrl]);

  const handleCreate = () => {
    const name = tableName.trim();
    if (!name) return;
    const tableId = name.toLowerCase().replace(/\s+/g, "-");
    const url = generateReviewLink(tableId);
    const entry: QREntry = { id: crypto.randomUUID(), name, tableId, url, created: new Date().toLocaleDateString() };
    setCodes((prev) => [entry, ...prev]);
    setTableName("");
    toast({ title: "✅ Table QR created!", description: `QR code for "${name}" is ready.` });
  };

  const handleDownload = useCallback(async (code: QREntry) => {
    const size = 400;
    const qrCanvas = document.createElement("canvas");
    await QRCode.toCanvas(qrCanvas, code.url, { width: size, margin: 2 });
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = size;
    finalCanvas.height = size + 60;
    const ctx = finalCanvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(qrCanvas, 0, 0);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(code.name, size / 2, size + 38);
    const link = document.createElement("a");
    link.download = `${code.name.replace(/\s+/g, "_")}_qr.png`;
    link.href = finalCanvas.toDataURL("image/png");
    link.click();
    toast({ title: "QR downloaded!" });
  }, [toast]);

  const handleDelete = (id: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "Table removed" });
  };

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6 max-w-5xl mx-auto">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold font-display flex items-center gap-2">
          <Table2 className="h-6 w-6 text-primary" /> Table Management
        </h1>
        <p className="text-muted-foreground text-sm mt-0.5">Create QR codes for each table. Customers scan to leave reviews.</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Create */}
        <motion.div variants={item}>
          <Card className="border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Add New Table</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">Table Name</label>
                <Input
                  placeholder="e.g. Table 1, Table 2, VIP..."
                  value={tableName}
                  onChange={(e) => setTableName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                />
              </div>
              {previewUrl && (
                <div className="rounded-xl bg-muted/50 p-3 space-y-1">
                  <p className="text-[10px] font-medium text-muted-foreground">Auto-generated link:</p>
                  <p className="text-xs text-primary break-all font-mono">{previewUrl}</p>
                </div>
              )}
              <div className="flex items-center justify-center p-4 rounded-2xl bg-muted/50">
                {previewUrl ? (
                  <canvas ref={previewCanvasRef} className="rounded-xl" />
                ) : (
                  <div className="h-44 w-44 rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
                    <QrCode className="h-14 w-14 text-muted-foreground/20" />
                    <p className="text-[10px] text-muted-foreground/50">Enter table name</p>
                  </div>
                )}
              </div>
              <Button className="w-full gap-2" onClick={handleCreate} disabled={!tableName.trim()}>
                <Plus className="h-4 w-4" /> Create QR Code
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* List */}
        <motion.div variants={item}>
          <Card className="border border-border/50 shadow-sm rounded-2xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Your Tables ({codes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2.5">
              {codes.length === 0 ? (
                <div className="text-center py-10">
                  <QrCode className="h-12 w-12 mx-auto text-muted-foreground/20 mb-2" />
                  <p className="text-muted-foreground text-sm">No tables yet</p>
                </div>
              ) : codes.map((qr) => (
                <motion.div key={qr.id} variants={item} className="flex items-center gap-3 p-3 rounded-xl bg-muted/40 hover:bg-muted/60 transition-colors">
                  <div className="h-10 w-10 rounded-xl bg-card flex items-center justify-center shrink-0 shadow-sm">
                    <QrCode className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{qr.name}</p>
                    <p className="text-[10px] text-muted-foreground truncate font-mono">{qr.url}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="outline" size="sm" className="h-8 gap-1 text-xs" onClick={() => handleDownload(qr)}>
                      <Download className="h-3 w-3" /> Download
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => handleDelete(qr.id)}>
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  );
}
