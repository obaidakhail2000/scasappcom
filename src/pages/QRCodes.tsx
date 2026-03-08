import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QrCode, Download, Copy, ExternalLink } from "lucide-react";
import { motion } from "framer-motion";
import { useState } from "react";

const existingQR = [
  { id: 1, name: "Table Review QR", url: "https://review.scas.app/abc123", created: "Mar 1, 2026" },
  { id: 2, name: "Receipt QR Code", url: "https://review.scas.app/def456", created: "Feb 20, 2026" },
  { id: 3, name: "Takeout Bag QR", url: "https://review.scas.app/ghi789", created: "Feb 15, 2026" },
];

export default function QRCodes() {
  const [qrName, setQrName] = useState("");

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 max-w-5xl mx-auto">
      <div>
        <h1 className="text-3xl font-display">QR Codes</h1>
        <p className="text-muted-foreground mt-1">Generate QR codes for collecting customer reviews.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-display">Generate New QR Code</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input placeholder="QR Code name (e.g., Table Tent)" value={qrName} onChange={(e) => setQrName(e.target.value)} />
            <div className="flex items-center justify-center p-8 rounded-2xl bg-muted/50">
              <div className="h-48 w-48 rounded-2xl bg-card border-2 border-dashed border-border flex items-center justify-center">
                <QrCode className="h-24 w-24 text-muted-foreground/40" />
              </div>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1 gap-2"><Download className="h-4 w-4" /> Download PNG</Button>
              <Button variant="outline" className="gap-2"><Copy className="h-4 w-4" /> Copy Link</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-md rounded-2xl">
          <CardHeader>
            <CardTitle className="text-lg font-display">Your QR Codes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {existingQR.map((qr) => (
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
                  <Button variant="ghost" size="icon" className="h-8 w-8"><Download className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8"><ExternalLink className="h-4 w-4" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </motion.div>
  );
}
