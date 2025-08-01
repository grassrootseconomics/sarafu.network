"use client";

import { CreditCard, Plus, RefreshCw, Wallet } from "lucide-react";
import { useCallback, useState } from "react";
import { toast } from "sonner";
import { useNFC } from "~/lib/nfc/use-nfc";
import { PaperWallet, toQRContent } from "~/utils/paper-wallet";
import { Loading } from "../loading";
import { NFCErrorBoundary } from "../error-boundaries";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Separator } from "../ui/separator";
import { Switch } from "../ui/switch";
import { Textarea } from "../ui/textarea";

interface NFCWalletWriterProps {
  className?: string;
}

interface GeneratedWallet {
  wallet: PaperWallet;
  qrContent: string;
  address: string;
  isWritten: boolean;
}

export const NFCWalletWriter = ({ className }: NFCWalletWriterProps) => {
  const [generatedWallets, setGeneratedWallets] = useState<GeneratedWallet[]>(
    []
  );
  const [selectedWallet, setSelectedWallet] = useState<GeneratedWallet | null>(
    null
  );
  const [usePassword, setUsePassword] = useState(false);
  const [password, setPassword] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const { nfcStatus, writeUrlToTag } = useNFC();

  const generateWallet = useCallback(async () => {
    setIsGenerating(true);
    try {
      const walletData =
        usePassword && password.trim()
          ? await PaperWallet.generate(password.trim())
          : await PaperWallet.generate();

      const wallet = new PaperWallet(JSON.stringify(walletData));
      const qrContent = toQRContent(walletData);

      const newWallet: GeneratedWallet = {
        wallet,
        qrContent,
        address: wallet.getAddress(),
        isWritten: false,
      };

      setGeneratedWallets((prev) => [newWallet, ...prev]);
      setSelectedWallet(newWallet);
      toast.success("New paper wallet generated!");
    } catch (error) {
      console.error("Error generating wallet:", error);
      toast.error("Failed to generate wallet");
    } finally {
      setIsGenerating(false);
    }
  }, [usePassword, password]);

  const writeUrlToNFC = useCallback(
    async (walletToWrite: GeneratedWallet) => {
      if (!nfcStatus.isSupported) {
        toast.error("NFC is not supported on this device");
        return;
      }

      try {
        const success = await writeUrlToTag(walletToWrite.qrContent);

        if (success) {
          setGeneratedWallets((prev) =>
            prev.map((w) =>
              w.address === walletToWrite.address
                ? { ...w, isWritten: true }
                : w
            )
          );

          if (selectedWallet?.address === walletToWrite.address) {
            setSelectedWallet((prev) =>
              prev ? { ...prev, isWritten: true } : null
            );
          }

          toast.success("Successfully wrote wallet URL to NFC card!");
        }
      } catch (error) {
        console.error("Error writing URL to NFC:", error);
        toast.error("Failed to write URL to NFC card");
      }
    },
    [nfcStatus.isSupported, writeUrlToTag]
  );

  const clearWallets = useCallback(() => {
    setGeneratedWallets([]);
    setSelectedWallet(null);
    toast.success("Cleared all generated wallets");
  }, []);

  return (
    <div className={className}>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            NFC Paper Wallet Writer
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <NFCErrorBoundary
            onError={(error, errorInfo) => {
              console.error("NFC Error in NFCWalletWriter:", error, errorInfo);
              toast.error("NFC operation failed. Please check device compatibility and try again.");
            }}
          >
          {/* NFC Status */}
          <div className="flex items-center justify-between p-3 border rounded-lg">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4" />
              <span className="text-sm font-medium">NFC Status:</span>
            </div>
            <Badge variant={nfcStatus.isSupported ? "default" : "destructive"}>
              {nfcStatus.isSupported ? "Supported" : "Not Supported"}
            </Badge>
          </div>

          {/* Password Configuration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">Password Protection</Label>
                <div className="text-sm text-muted-foreground">
                  Generate encrypted paper wallets with password protection
                </div>
              </div>
              <Switch checked={usePassword} onCheckedChange={setUsePassword} />
            </div>

            {usePassword && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter password for wallet encryption"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            )}
          </div>

          <Separator />

          {/* Generate Wallet */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                onClick={generateWallet}
                disabled={isGenerating || (usePassword && !password.trim())}
                className="flex-1"
              >
                {isGenerating ? (
                  <>
                    <Loading />
                    Generating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Generate New Wallet
                  </>
                )}
              </Button>

              {generatedWallets.length > 0 && (
                <Button variant="outline" onClick={clearWallets}>
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Clear All
                </Button>
              )}
            </div>

            {generatedWallets.length > 0 && (
              <div className="text-sm text-muted-foreground">
                Generated {generatedWallets.length} wallet
                {generatedWallets.length !== 1 ? "s" : ""}
                {generatedWallets.filter((w) => w.isWritten).length > 0 && (
                  <span className="ml-2">
                    • {generatedWallets.filter((w) => w.isWritten).length}{" "}
                    written to NFC
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Selected Wallet Details */}
          {selectedWallet && (
            <>
              <Separator />
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Wallet className="w-4 h-4" />
                    Selected Wallet
                  </h3>
                  {selectedWallet.isWritten && (
                    <Badge variant="secondary">Written to NFC</Badge>
                  )}
                </div>

                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Address</Label>
                    <div className="p-2 bg-muted rounded text-sm font-mono break-all">
                      {selectedWallet.address}
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">QR Content</Label>
                    <Textarea
                      value={selectedWallet.qrContent}
                      readOnly
                      className="text-xs font-mono"
                      rows={3}
                    />
                  </div>

                  {nfcStatus.isSupported && (
                    <div className="flex gap-2">
                      <Button
                        onClick={() => writeUrlToNFC(selectedWallet)}
                        disabled={
                          nfcStatus.isWriting || selectedWallet.isWritten
                        }
                        className="flex-1"
                      >
                        {nfcStatus.isWriting ? (
                          <>
                            <Loading />
                            Writing...
                          </>
                        ) : (
                          <>
                            <CreditCard className="w-4 h-4 mr-2" />
                            Write to NFC Card
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Wallet History */}
          {generatedWallets.length > 1 && (
            <>
              <Separator />
              <div className="space-y-3">
                <h3 className="text-lg font-semibold">Recent Wallets</h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {generatedWallets.slice(1).map((wallet) => (
                    <div
                      key={wallet.address}
                      className="flex items-center justify-between p-2 border rounded cursor-pointer hover:bg-muted/50"
                      onClick={() => setSelectedWallet(wallet)}
                    >
                      <div className="flex items-center gap-2">
                        <Wallet className="w-3 h-3" />
                        <span className="text-sm font-mono">
                          {wallet.address.slice(0, 10)}...
                          {wallet.address.slice(-8)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {wallet.isWritten && (
                          <Badge variant="secondary" className="text-xs">
                            Written
                          </Badge>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedWallet(wallet);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* Status Message */}
          {nfcStatus.message && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">
                {nfcStatus.message}
              </p>
            </div>
          )}
          </NFCErrorBoundary>
        </CardContent>
      </Card>
    </div>
  );
};

export default NFCWalletWriter;
