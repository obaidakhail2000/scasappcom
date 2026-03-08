import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Download, Trash2, Plus, UtensilsCrossed } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { BackToDashboard } from "@/components/BackToDashboard";

const APP_DOMAIN = window.location.origin;

function generateReviewLink(tableName: string) {
  const slug = tableName.trim().toLowerCase().replace(/\s+/g, "-");
  return `${APP_DOMAIN}/review?table=${encodeURIComponent(slug)}`;
}

function generateQR(text: string, canvas: HTMLCanvasElement, size = 200) {
  const ctx = canvas.getContext("2d")!;
  canvas.width = size;
  canvas.height = size;
  const modules = 21;
  const moduleSize = size / modules;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000000";
  const drawFinder = (x: number, y: number) => {
    for (let i = 0; i < 7; i++) for (let j = 0; j < 7; j++) {
      if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
        ctx.fillRect((x + i) * moduleSize, (y + j) * moduleSize, moduleSize, moduleSize);
      }
    }
  };
  drawFinder(0, 0); drawFinder(14, 0); drawFinder(0, 14);
  let hash = 0;
  for (let i = 0; i < text.length; i++) hash = ((hash << 5) - hash) + text.charCodeAt(i);
  for (let i = 8; i < modules; i++) for (let j = 8; j < modules; j++) {
    if (i < 14 || j < 14) {
      hash = (hash * 1103515245 + 12345) & 0x7fffffff;
      if (hash % 3 !== 0) ctx.fillRect(i * moduleSize, j * moduleSize, moduleSize, moduleSize);
    }
  }
}

interface QREntry {
  id: string;
  name: string;
  url: string;
  created: string;
}

export default function QRCodes() {
  const [tableName, setTableName] = useState("");
  const [codes, setCodes] = useState<QREntry[]>(() => {
    const saved = localStorage.getItem("scas_qr_codes");
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem("scas_qr_codes", JSON.stringify(codes));
  }, [codes]);

  const previewUrl = tableName.trim() ? generateReviewLink(tableName) : "";

  useEffect(() => {
    if (previewCanvasRef.current && previewUrl) {
      generateQR(previewUrl, previewCanvasRef.current);
    }
  }, [previewUrl]);

  const handleCreate = () => {
    const name = tableName.trim();
    if (!name) return;
    const url = generateReviewLink(name);
    const newCode: QREntry = {
      id: crypto.randomUUID(),
      name,
      url,
      created: new Date().toLocaleDateString(),
    };
    setCodes((prev) => [newCode, ...prev]);
    setTableName("");
    toast({ title: "✅ تم إنشاء QR Code!", description: `رابط المراجعة لـ "${name}" جاهز للتحميل.` });
  };

  const handleDownload = useCallback((code: QREntry) => {
    const canvas = document.createElement("canvas");
    const size = 400;
    generateQR(code.url, canvas, size);

    // Add label below QR
    const finalCanvas = document.createElement("canvas");
    finalCanvas.width = size;
    finalCanvas.height = size + 60;
    const ctx = finalCanvas.getContext("2d")!;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, finalCanvas.width, finalCanvas.height);
    ctx.drawImage(canvas, 0, 0);
    ctx.fillStyle = "#000000";
    ctx.font = "bold 20px sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(code.name, size / 2, size + 38);

    const link = document.createElement("a");
    link.download = `${code.name.replace(/\s+/g, "_")}_qr.png`;
    link.href = finalCanvas.toDataURL("image/png");
    link.click();
    toast({ title: "تم تحميل QR Code بنجاح" });
  }, [toast]);

  const handleDelete = (id: string) => {
    setCodes((prev) => prev.filter((c) => c.id !== id));
    toast({ title: "تم حذف QR Code" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <BackToDashboard />
      <div>
        <h1 className="text-3xl font-display">QR Codes</h1>
        <p className="text-muted-foreground mt-1">
          أنشئ QR Codes لطاولات مطعمك — يتم توليد رابط المراجعة تلقائياً.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Card */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-display flex items-center gap-2">
              <UtensilsCrossed className="h-5 w-5 text-primary" />
              إنشاء QR Code جديد
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-muted-foreground">اسم الطاولة أو الموقع</label>
              <Input
                placeholder="مثال: Table 1, Table 2, الكاشير..."
                value={tableName}
                onChange={(e) => setTableName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            {previewUrl && (
              <div className="rounded-xl bg-muted/50 p-3 space-y-1">
                <p className="text-xs font-medium text-muted-foreground">الرابط التلقائي:</p>
                <p className="text-xs text-primary break-all font-mono">{previewUrl}</p>
              </div>
            )}

            <div className="flex items-center justify-center p-6 rounded-2xl bg-muted/50">
              {previewUrl ? (
                <canvas ref={previewCanvasRef} className="rounded-xl" />
              ) : (
                <div className="h-48 w-48 rounded-2xl bg-card border-2 border-dashed border-border flex flex-col items-center justify-center gap-2">
                  <QrCode className="h-16 w-16 text-muted-foreground/30" />
                  <p className="text-xs text-muted-foreground/50">أدخل اسم الطاولة</p>
                </div>
              )}
            </div>

            <Button className="w-full gap-2" onClick={handleCreate} disabled={!tableName.trim()}>
              <Plus className="h-4 w-4" /> إنشاء QR Code
            </Button>
          </CardContent>
        </Card>

        {/* List Card */}
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-display">QR Codes الخاصة بك</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {codes.length === 0 ? (
              <div className="text-center py-10 space-y-2">
                <QrCode className="h-12 w-12 mx-auto text-muted-foreground/30" />
                <p className="text-muted-foreground text-sm">لا توجد QR Codes بعد. أنشئ أول واحد!</p>
              </div>
            ) : (
              codes.map((qr) => (
                <motion.div
                  key={qr.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40 hover:bg-muted/60 transition-colors"
                >
                  <div className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center shrink-0 shadow-sm">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold">{qr.name}</p>
                    <p className="text-[11px] text-muted-foreground truncate font-mono">{qr.url}</p>
                    <p className="text-[10px] text-muted-foreground/60">{qr.created}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs"
                      onClick={() => handleDownload(qr)}
                    >
                      <Download className="h-3.5 w-3.5" />
                      تحميل
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleDelete(qr.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </motion.div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
