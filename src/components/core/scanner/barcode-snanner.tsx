"use client"

import React, { useEffect, useRef, useState } from "react"
import Quagga from '@ericblade/quagga2'
import { useCurrency } from "@/hooks/useCurrency";
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ScanLine } from "./scan-line"
import { QrCode, Camera, XCircle, CheckCircle2, Loader2, Volume2, VolumeX } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { toast } from "sonner"

type QuaggaJSCodeReader =
    | 'code_128_reader'
    | 'ean_reader'
    | 'ean_5_reader'
    | 'ean_2_reader'
    | 'ean_8_reader'
    | 'code_39_reader'
    | 'code_39_vin_reader'
    | 'codabar_reader'
    | 'upc_reader'
    | 'upc_e_reader'
    | 'i2of5_reader'
    | '2of5_reader'
    | 'code_93_reader'
    | 'code_32_reader';

interface QuaggaJSReaderConfig {
    config: {
        supplements: string[];
    };
    format: string;
}

interface Camera {
    id: string;
    label: string;
}

interface ScanResult {
    code: string;
    format: string;
}

interface BarcodeFormat {
    value: QuaggaJSCodeReader;
    label: string;
}

interface BarcodeConstraints {
    width?: number;
    height?: number;
    facingMode?: string;
    deviceId?: string | { exact: string };
}

interface BarcodeScannerProps {
    onDetected?: (result: any) => void;
    onError?: (error: any) => void;
    onScannerClose?: () => void;
    readers?: Array<QuaggaJSReaderConfig | QuaggaJSCodeReader>;
    fullScreen?: boolean;
    constraints?: BarcodeConstraints;
}

const BARCODE_FORMATS: BarcodeFormat[] = [
    { value: "code_128_reader", label: "Code 128" },
    { value: "ean_reader", label: "EAN-13" },
    { value: "ean_8_reader", label: "EAN-8" },
    { value: "code_39_reader", label: "Code 39" },
    { value: "code_39_vin_reader", label: "Code 39 VIN" },
    { value: "codabar_reader", label: "Codabar" },
    { value: "upc_reader", label: "UPC" },
    { value: "upc_e_reader", label: "UPC-E" },
    { value: "i2of5_reader", label: "I2of5" },
    { value: "2of5_reader", label: "2of5" },
    { value: "code_93_reader", label: "Code 93" },
    { value: "code_32_reader", label: "Code 32" }
]

/**
 * Barcode Scanner Component
 * 
 * @param props Component props
 * @returns JSX.Element
 */
const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
    onDetected,
    onError,
    onScannerClose,
    readers = ["code_128_reader" as QuaggaJSCodeReader],
    fullScreen = false,
    constraints = {
        width: 640,
        height: 480,
        facingMode: "environment"
    }
}) => {
    const scannerRef = useRef<HTMLDivElement>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)
    const [scanning, setScanning] = useState<boolean>(false)
    const [initialized, setInitialized] = useState<boolean>(false)
    const [error, setError] = useState<any>(null)
    const [cameras, setCameras] = useState<Camera[]>([])
    const [activeCamera, setActiveCamera] = useState<string | null>(null)
    const [torchEnabled, setTorchEnabled] = useState<boolean>(false)
    const [soundEnabled, setSoundEnabled] = useState<boolean>(true)
    const [selectedReaders, setSelectedReaders] = useState<Array<QuaggaJSCodeReader>>(
        readers.map(reader => typeof reader === 'string' ? reader : reader.format) as QuaggaJSCodeReader[]
    )
    const [lastResult, setLastResult] = useState<ScanResult | null>(null)
    const [scanCount, setScanCount] = useState<number>(0)
    const beepRef = useRef<HTMLAudioElement>(null)
    const [initAttempts, setInitAttempts] = useState<number>(0)
    const initTimeoutRef = useRef<NodeJS.Timeout | null>(null)

    const quaggaContainerRef = useRef<HTMLDivElement>(document.createElement('div'));
    const isMountedRef = useRef(true);

    const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);

    const cleanupQuagga = async () => {
        try {
            // First unregister event handlers to prevent callbacks after component is unmounted
            Quagga.offDetected()
            Quagga.offProcessed()

            // Then stop the scanner
            if (initialized) {

                if (initialized) {
                    await Quagga.stop();
                    console.log('Quagga fully stopped');
                }
            }

            // Cleanup our container element safely
            if (quaggaContainerRef.current && scannerRef.current) {
                try {
                    if (scannerRef.current.contains(quaggaContainerRef.current)) {
                        scannerRef.current.removeChild(quaggaContainerRef.current);
                    }
                } catch (err) {
                    console.error('Error removing Quagga container:', err);
                }
            }
        } catch (error) {
            console.error("Error during Quagga cleanup:", error)
        }
        finally {
            if (isMountedRef.current) {
                setInitialized(false);
            }
        }
    }


    useEffect(() => {
        isMountedRef.current = true;
        const abortController = new AbortController();

        const initScanner = async () => {
            if (!scanning || initAttempts > 3 || !scannerRef.current) return;

            try {
                // Create isolated container
                quaggaContainerRef.current.id = 'quagga-container-' + Date.now();
                quaggaContainerRef.current.style.position = 'relative';
                quaggaContainerRef.current.style.minHeight = '300px';
                quaggaContainerRef.current.style.minWidth = '300px';

                scannerRef.current.appendChild(quaggaContainerRef.current);


                const cameraConstraints: MediaTrackConstraints = {
                    width: { ideal: constraints.width || 640 },
                    height: { ideal: constraints.height || 480 },
                    facingMode: constraints.facingMode || "environment"
                }

                // Initialize Quagga with clean config
                await new Promise<void>((resolve, reject) => {
                    Quagga.init({
                        inputStream: {
                            name: "Live",
                            type: "LiveStream",
                            target: quaggaContainerRef.current,
                            constraints: cameraConstraints as any,
                        },
                        // ... rest of config
                    }, (err) => {
                        if (err) reject(err);
                        else resolve();
                    });
                });

                if (abortController.signal.aborted) return;

                Quagga.start();
                setInitialized(true);
                setInitAttempts(0);

                // Add detection handler with abort check
                Quagga.onDetected((result) => {
                    if (!isMountedRef.current || abortController.signal.aborted) return;

                    if (result?.codeResult) {
                        const newResult = {
                            code: result.codeResult.code,
                            format: result.codeResult.format
                        };

                        setLastResult(newResult);
                        setScanHistory(prev => [newResult, ...prev.slice(0, 5)]); // Keep last 5 scans
                        setScanCount(prev => prev + 1);

                        if (soundEnabled && beepRef.current) {
                            beepRef.current.play().catch(console.error);
                        }

                        if (onDetected) onDetected(result);
                    }
                });

            } catch (err) {
                if (!abortController.signal.aborted) {
                    console.error("Initialization error:", err);
                    setError(err);
                    setInitAttempts(prev => prev + 1);
                }
            }
        };

        initScanner();

        return () => {
            isMountedRef.current = false;
            abortController.abort();
            cleanupQuagga();
        };
    }, [scanning, activeCamera, selectedReaders]);

    const toggleTorch = async () => {
        try {
            if (torchEnabled) {
                await Quagga.CameraAccess.disableTorch()
                setTorchEnabled(false)
                toast.success("Torch disabled")
            } else {
                await Quagga.CameraAccess.enableTorch()
                setTorchEnabled(true)
                toast.success("Torch enabled")
            }
        } catch (err) {
            console.error("Error toggling torch:", err)
            toast.error("Torch functionality not available on this device")
        }
    }

    const changeCamera = (deviceId: string) => {
        if (initialized) {
            cleanupQuagga()
        }

        setActiveCamera(deviceId)
        setInitAttempts(0)

        // Start scanning with new camera
        setScanning(true)
    }

    const changeReader = (readerValue: QuaggaJSCodeReader) => {
        if (initialized) {
            cleanupQuagga()
        }

        setSelectedReaders([readerValue])
        setInitAttempts(0)

        // If not already scanning, start scanning
        if (!scanning) {
            setScanning(true)
        }
    }

    // Close scanner function
    const closeScanner = () => {
        if (initialized) {
            cleanupQuagga()
        }

        setScanning(false)
        setError(null)
        setInitAttempts(0)

        if (onScannerClose) onScannerClose()
    }

    // Start scanning function
    const startScanning = () => {
        setScanning(true)
        setError(null)
        setInitAttempts(0)
    }

    const retryScanning = () => {
        if (initialized) {
            cleanupQuagga()
        }

        setError(null)
        setInitAttempts(0)
        setScanning(true)
    }

    return (
        <div className={`barcode-scanner ${fullScreen ? "fixed inset-0 z-50 bg-black" : "relative"}`}>
            {!scanning ? (
                <Card className="w-full max-w-md mx-auto">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <QrCode className="h-5 w-5" />
                            Barcode Scanner
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground mb-4">
                            Scan barcodes to quickly find products, check inventory, or add items to your cart.
                        </p>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label htmlFor="soundEnabled">Sound notification</Label>
                                <Switch
                                    id="soundEnabled"
                                    checked={soundEnabled}
                                    onCheckedChange={setSoundEnabled}
                                />
                            </div>

                            <Select
                                value={selectedReaders[0]}
                                onValueChange={(value) => changeReader(value as QuaggaJSCodeReader)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Select barcode format" />
                                </SelectTrigger>
                                <SelectContent>
                                    {BARCODE_FORMATS.map(format => (
                                        <SelectItem key={format.value} value={format.value}>
                                            {format.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                    <CardFooter>
                        <Button onClick={startScanning} className="w-full h-8 text-xs">
                            <Camera className="mr-2 h-4 w-4" />
                            Start Scanning
                        </Button>
                    </CardFooter>
                </Card>
            ) : (
                <div className="relative">
                    <div
                        ref={scannerRef}
                        className={`overflow-hidden relative ${fullScreen ? "w-full h-screen" : "w-full max-w-md mx-auto aspect-[4/3] rounded-md"}`}
                        style={{ minHeight: "300px", minWidth: "300px" }}
                    >
                        {!initialized && !error && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                                <div className="text-center">
                                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
                                    <p className="text-white">Initializing camera...</p>
                                </div>
                            </div>
                        )}
                        {error && (
                            <div className="absolute inset-0 bg-black/80 flex items-center justify-center z-20">
                                <div className="text-center p-4">
                                    <XCircle className="h-8 w-8 text-destructive mx-auto mb-2" />
                                    <p className="text-white mb-2">Failed to initialize camera</p>
                                    <p className="text-sm text-white/70 mb-4">
                                        {error.message || "Please ensure you've granted camera permissions"}
                                    </p>
                                    <div className="flex gap-2 justify-center">
                                        <Button variant="destructive" onClick={closeScanner}>
                                            Close Scanner
                                        </Button>
                                        <Button variant="outline" onClick={retryScanning}>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Retry
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        )}
                        {lastResult && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center z-10 animate-fade-out">
                                <div className="bg-green-500/20 rounded-full p-8">
                                    <CheckCircle2 className="h-12 w-12 text-green-500" />
                                </div>
                            </div>
                        )}
                        <div className="absolute top-0 left-0 w-full h-full pointer-events-none z-10">
                            <div className="absolute top-[15%] right-[10%] bottom-[15%] left-[10%] border-2 border-white/40 rounded-lg">
                                <ScanLine />
                            </div>
                        </div>
                    </div>

                    <div className={`mt-4 ${fullScreen ? "absolute bottom-0 left-0 right-0 p-4 bg-black/80" : ""}`}>
                        <div className="flex items-center justify-between gap-2 mb-2">
                            <Button variant="outline" size="sm" onClick={closeScanner}>
                                <XCircle className="mr-2 h-4 w-4" />
                                Cancel
                            </Button>

                            <div className="flex gap-2">
                                {cameras.length > 1 && (
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" size="sm">
                                                <Camera className="h-4 w-4" />
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-60">
                                            <p className="font-medium text-sm mb-2">Select camera</p>
                                            <div className="space-y-2">
                                                {cameras.map(camera => (
                                                    <Button
                                                        key={camera.id}
                                                        variant={activeCamera === camera.id ? "default" : "outline"}
                                                        size="sm"
                                                        className="w-full justify-start"
                                                        onClick={() => changeCamera(camera.id)}
                                                    >
                                                        {camera.label}
                                                    </Button>
                                                ))}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                )}

                                <Button
                                    variant={torchEnabled ? "default" : "outline"}
                                    size="sm"
                                    onClick={toggleTorch}
                                >
                                    {torchEnabled ? "Torch On" : "Torch Off"}
                                </Button>

                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSoundEnabled(!soundEnabled)}
                                >
                                    {soundEnabled ? (
                                        <Volume2 className="h-4 w-4" />
                                    ) : (
                                        <VolumeX className="h-4 w-4" />
                                    )}
                                </Button>
                            </div>
                        </div>

                        {initialized && (
                            <Alert>
                                <AlertTitle>Scanner active</AlertTitle>
                                <AlertDescription>
                                    {scanCount > 0 ? (
                                        <>Last scan: <span className="font-mono">{lastResult?.code}</span> ({lastResult?.format})</>
                                    ) : (
                                        "Position barcode within the scanning area"
                                    )}
                                </AlertDescription>
                            </Alert>
                        )}
                    </div>

                    <div className="scan-results-display">
                        {scanHistory.length > 0 && (
                            <div className="mt-4 p-4 bg-background/90 rounded-lg border">
                                <h3 className="text-sm font-medium mb-2">Raw Scan Data:</h3>
                                <pre className="text-xs font-mono overflow-auto max-h-40">
                                    {JSON.stringify(scanHistory, null, 2)}
                                </pre>
                            </div>
                        )}
                    </div>

                    <audio ref={beepRef} src="/beep.mp3" preload="auto" />
                </div>
            )}
        </div>
    )
}

export default BarcodeScanner