import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Download, Copy, Trash2, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import { useToast } from "@/hooks/use-toast";
import { BackToDashboard } from "@/components/BackToDashboard";

const isValidUrl = (str: string) => {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
};

export default function QRCodes() {
  const [qrName, setQrName] = useState("");
  const [qrUrl, setQrUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [codes, setCodes] = useState<{ id: string; name: string; url: string; created: string }[]>(() => {
    const saved = localStorage.getItem("scas_qr_codes");
    return saved ? JSON.parse(saved) : [];
  });
  const { toast } = useToast();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    localStorage.setItem("scas_qr_codes", JSON.stringify(codes));
  }, [codes]);

  const validateUrl = (url: string) => {
    if (!url.trim()) {
      setUrlError("URL is required");
      return false;
    }
    if (!isValidUrl(url.trim())) {
      setUrlError("Please enter a valid URL (e.g. https://example.com)");
      return false;
    }
    setUrlError("");
    return true;
  };

  const generateQR = (text: string, canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext("2d")!;
    const size = 200;
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
  };

  useEffect(() => {
    if (canvasRef.current && qrUrl && isValidUrl(qrUrl.trim())) generateQR(qrUrl, canvasRef.current);
  }, [qrUrl]);

  const handleCreate = () => {
    if (!qrName.trim()) return;
    if (!validateUrl(qrUrl)) return;
    const newCode = { id: crypto.randomUUID(), name: qrName, url: qrUrl.trim(), created: new Date().toLocaleDateString() };
    setCodes((prev) => [newCode, ...prev]);
    setQrName("");
    setQrUrl("");
    setUrlError("");
    toast({ title: "QR Code created!" });
  };

  const handlePreview = () => {
    if (!validateUrl(qrUrl)) return;
    window.open(qrUrl.trim(), "_blank", "noopener,noreferrer");
  };

  const handleDownload = (code: { name: string; url: string }) => {
    const canvas = document.createElement("canvas");
    generateQR(code.url, canvas);
    const link = document.createElement("a");
    link.download = `${code.name.replace(/\s/g, "_")}_qr.png`;
    link.href = canvas.toDataURL();
    link.click();
    toast({ title: "QR Code downloaded" });
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: "Link copied!" });
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <BackToDashboard />
      <div>
        <h1 className="text-3xl font-display">QR Codes</h1>
        <p className="text-muted-foreground mt-1">Generate QR codes for collecting customer reviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Generate New QR Code</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="QR Code name (e.g., Table Tent)" value={qrName} onChange={(e) => setQrName(e.target.value)} />
            <div className="space-y-1.5">
              <div className="flex gap-2">
                <Input
                  placeholder="https://example.com"
                  value={qrUrl}
                  onChange={(e) => { setQrUrl(e.target.value); if (urlError) validateUrl(e.target.value); }}
                  className={urlError ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <Button variant="outline" size="icon" className="shrink-0" onClick={handlePreview} title="Preview link">
                  <ExternalLink className="h-4 w-4" />
                </Button>
              </div>
              {urlError && <p className="text-sm text-destructive">{urlError}</p>}
            </div>
            <div className="flex items-center justify-center p-8 rounded-2xl bg-muted/50">
              {qrUrl && isValidUrl(qrUrl.trim()) ? (
                <canvas ref={canvasRef} className="rounded-xl" />
              ) : (
                <div className="h-48 w-48 rounded-2xl bg-card border-2 border-dashed border-border flex items-center justify-center">
                  <QrCode className="h-24 w-24 text-muted-foreground/40" />
                </div>
              )}
            </div>
            <Button className="w-full gap-2" onClick={handleCreate} disabled={!qrName.trim()}>
              <QrCode className="h-4 w-4" /> Generate QR Code
            </Button>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader><CardTitle className="text-lg font-display">Your QR Codes</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {codes.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No QR codes yet.</p>
            ) : (
              codes.map((qr) => (
                <div key={qr.id} className="flex items-center gap-3 p-3 rounded-2xl bg-muted/40">
                  <div className="h-12 w-12 rounded-2xl bg-card flex items-center justify-center shrink-0 shadow-sm">
                    <QrCode className="h-6 w-6 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium">{qr.name}</p>
                    <p className="text-xs text-muted-foreground truncate">{qr.url}</p>
                    <p className="text-[10px] text-muted-foreground/60">{qr.created}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleDownload(qr)}><Download className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleCopy(qr.url)}><Copy className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => setCodes((p) => p.filter((c) => c.id !== qr.id))}><Trash2 className="h-4 w-4" /></Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
