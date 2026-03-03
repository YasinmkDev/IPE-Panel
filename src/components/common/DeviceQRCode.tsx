import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { QRCodeSVG } from "qrcode.react";
import { Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DeviceQRCodeProps {
    pairingCode: string;
}

export function DeviceQRCode({ pairingCode }: DeviceQRCodeProps) {
    const { toast } = useToast();

    const copyToClipboard = () => {
        navigator.clipboard.writeText(pairingCode);
        toast({ title: "Copied", description: "Pairing Code copied to clipboard" });
    };

    return (
        <Card className="border-primary/20">
            <CardHeader>
                <CardTitle>Device Setup</CardTitle>
                <CardDescription>Use this unique ID to link the child's Android device to this profile.</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-6 py-8">
                <div className="p-4 bg-white border-2 border-primary rounded-2xl shadow-lg">
                    <QRCodeSVG
                        value={pairingCode}
                        size={180}
                        level="M"
                    />
                </div>
                <div className="w-full max-w-sm space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pairing Code</label>
                        <div className="flex gap-2">
                            <Input readOnly value={pairingCode} className="font-mono bg-muted text-center text-lg" />
                            <Button variant="outline" size="icon" onClick={copyToClipboard}>
                                <Copy className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                    <div className="p-4 rounded-xl bg-primary/5 text-sm text-primary-foreground/90 space-y-2 border border-primary/10">
                        <p className="font-semibold text-primary">Instructions:</p>
                        <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground">
                            <li>Download ParentWatch Child App on Android</li>
                            <li>Open app and select "Setup Device"</li>
                            <li>Scan the QR code above or enter the ID manually</li>
                        </ol>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
