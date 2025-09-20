'use client';

import { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import {
    WifiOff,
    RefreshCw,
    CheckCircle2,
    XCircle,
    Clock,
    FileText,
    ShoppingCart,
    Edit3,
    LineChart,
    CloudOff
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { registerServiceWorker } from '@/utils/service-worker';

export default function OfflinePage() {
    const [lastOnline, setLastOnline] = useState<Date | null>(null);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const handleReconnect = useCallback(async () => {
        setIsReconnecting(true);
        try {
            await fetch('https://www.google.com', { mode: 'no-cors' });
            window.location.reload();
        } catch (error) {
            console.error('Reconnection failed:', error);
            setIsReconnecting(false);
        }
    }, []);

    useEffect(() => {
        registerServiceWorker();

        // Check system preference for dark mode
        if (typeof window !== 'undefined') {
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            setIsDarkMode(darkModeQuery.matches);

            const darkModeHandler = (e: { matches: boolean | ((prevState: boolean) => boolean); }) => setIsDarkMode(e.matches);
            darkModeQuery.addEventListener('change', darkModeHandler);

            return () => darkModeQuery.removeEventListener('change', darkModeHandler);
        }
    }, []);

    useEffect(() => {
        const lastOnlineTime = localStorage.getItem('lastOnlineTime');
        if (lastOnlineTime) {
            setLastOnline(new Date(parseInt(lastOnlineTime)));
        }

        const handleOnline = () => {
            localStorage.setItem('lastOnlineTime', Date.now().toString());
            window.location.reload();
        };

        window.addEventListener('online', handleOnline);

        const reconnectionInterval = setInterval(() => {
            if (navigator.onLine) {
                window.location.reload();
            }
        }, 20000);

        return () => {
            window.removeEventListener('online', handleOnline);
            clearInterval(reconnectionInterval);
        };
    }, []);

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
            <Head>
                <title>Alcorabooks - Offline</title>
            </Head>

            <div className="w-full max-w-md mx-auto">
                <Alert
                    variant="destructive"
                    className="mb-6 rounded-lg shadow-md border-l-4 border-amber-500 
                    bg-amber-50 dark:bg-gray-800 dark:border-amber-400"
                >
                    <WifiOff className="h-5 w-5 text-amber-500 dark:text-amber-400" />
                    <AlertTitle className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        You're offline
                    </AlertTitle>
                    <AlertDescription className="text-sm text-gray-600 dark:text-gray-300">
                        Your device is currently not connected to the internet
                    </AlertDescription>
                </Alert>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6 transition-colors duration-300">
                    <div className="flex items-center justify-center mb-6">
                        <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <WifiOff className="h-8 w-8 text-amber-500 dark:text-amber-400" />
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-center text-gray-800 dark:text-white mb-2">
                        Offline Mode
                    </h2>

                    <p className="mb-2 text-gray-600 dark:text-gray-300 text-center">
                        Don't worry! You can still use most features while we wait for your connection to return.
                    </p>

                    {lastOnline && (
                        <div className="flex items-center justify-center mb-6 text-sm text-gray-500 dark:text-gray-400">
                            <Clock className="w-4 h-4 mr-2" />
                            <span>Last online: {lastOnline?.toLocaleString()}</span>
                        </div>
                    )}

                    <button
                        onClick={handleReconnect}
                        disabled={isReconnecting}
                        className={`w-full py-2 px-4 rounded-lg font-medium transition duration-300 
                      focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800
                      ${isReconnecting
                                ? 'bg-gray-300 text-gray-700 dark:bg-gray-700 dark:text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 text-white dark:bg-blue-700 dark:hover:bg-blue-600'
                            } flex items-center justify-center`}
                        aria-live="polite"
                    >
                        {isReconnecting ? (
                            <>
                                <RefreshCw className="animate-spin h-5 w-5 mr-2" />
                                <span>Reconnecting...</span>
                            </>
                        ) : (
                            <>
                                <RefreshCw className="h-5 w-5 mr-2" />
                                <span>Try Reconnecting</span>
                            </>
                        )}
                    </button>
                </div>

                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 transition-colors duration-300">
                    <h3 className="font-semibold text-lg mb-4 text-gray-800 dark:text-white flex items-center">
                        <CloudOff className="w-5 h-5 mr-2 text-gray-600 dark:text-gray-300" />
                        Offline Capabilities
                    </h3>

                    <div className="space-y-3 mb-6">
                        <div className="flex items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-gray-700 dark:text-gray-200 font-medium flex items-center">
                                    <ShoppingCart className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                    View offline orders
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Access your recent order history</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-gray-700 dark:text-gray-200 font-medium flex items-center">
                                    <FileText className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                    Access saved content
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Browse previously downloaded books</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-gray-700 dark:text-gray-200 font-medium flex items-center">
                                    <Clock className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                    Review recent activity
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">See your latest interactions</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <CheckCircle2 className="w-5 h-5 text-green-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-gray-700 dark:text-gray-200 font-medium flex items-center">
                                    <Edit3 className="w-4 h-4 mr-2 text-gray-500 dark:text-gray-400" />
                                    Create orders
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Will sync when you're back online</p>
                            </div>
                        </div>

                        <div className="border-t border-gray-200 dark:border-gray-700 pt-3 mt-4"></div>

                        <h4 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Unavailable features:</h4>

                        <div className="flex items-start">
                            <XCircle className="w-5 h-5 text-red-400 dark:text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center">
                                    <LineChart className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                                    Real-time analytics
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">Requires online connection</p>
                            </div>
                        </div>

                        <div className="flex items-start">
                            <XCircle className="w-5 h-5 text-red-400 dark:text-red-500 mt-0.5 mr-3 flex-shrink-0" />
                            <div>
                                <p className="text-gray-500 dark:text-gray-400 font-medium flex items-center">
                                    <RefreshCw className="w-4 h-4 mr-2 text-gray-400 dark:text-gray-500" />
                                    Sync with cloud
                                </p>
                                <p className="text-sm text-gray-400 dark:text-gray-500">Updates will be applied when online</p>
                            </div>
                        </div>
                    </div>

                    <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
                        We'll automatically reconnect when your internet is back.
                    </div>
                </div>
            </div>
        </div>
    );
}