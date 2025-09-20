'use client';

import { useEffect, useRef, useState } from 'react';
import { getToken, onMessage, Unsubscribe } from 'firebase/messaging';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { fetchToken, messaging } from '../../../firebase';

async function getNotificationPermissionAndToken() {
    if (!('Notification' in window)) {
        console.info('This browser does not support desktop notification');
        return null;
    }

    if (Notification.permission === 'granted') {
        return await fetchToken();
    }

    if (Notification.permission !== 'denied') {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
            return await fetchToken();
        }
    }

    console.log('Notification permission not granted.');
    return null;
}

const useFcmToken = () => {
    const router = useRouter();

    const [notificationPermissionStatus, setNotificationPermissionStatus] =
        useState<NotificationPermission | null>(null);

    const [token, setToken] = useState<string | null>(null);

    const retryLoadToken = useRef(0); // Ref to keep track of retry attempts.
    const isLoading = useRef(false); // Ref to keep track if a token fetch is currently in progress.

    const loadToken = async () => {
        // Prevent multiple fetches if already fetched or in progress.
        if (isLoading.current) return;

        isLoading.current = true; // Mark loading as in progress.
        const token = await getNotificationPermissionAndToken(); // Fetch the token.

        if (Notification.permission === 'denied') {
            setNotificationPermissionStatus('denied');
            console.info(
                '%cPush Notifications issue - permission denied',
                'color: green; background: #c7c7c7; padding: 8px; font-size: 20px',
            );
            isLoading.current = false;
            return;
        }

        // sw may not be ready/installed yet.
        if (!token) {
            if (retryLoadToken.current >= 3) {
                // alert("Unable to load token, refresh the browser");
                console.info(
                    '%cPush Notifications issue - unable to load token after 3 retries',
                    'color: green; background: #c7c7c7; padding: 8px; font-size: 20px',
                );
                isLoading.current = false;
                return;
            }

            retryLoadToken.current += 1;
            console.error('An error occurred while retrieving token. Retrying...');
            isLoading.current = false;
            await loadToken();
            return;
        }

        localStorage.setItem('fcmToken', token);
        setNotificationPermissionStatus(Notification.permission);
        setToken(token);
        isLoading.current = false;
    };

    useEffect(() => {
        // Initialize token loading when the component mounts.
        if ('Notification' in window) {
            loadToken();
        }
    }, []);

    useEffect(() => {
        const setupListener = async () => {
            if (!token) return;
            const m = await messaging();
            if (!m) return;

            // Register a listener for incoming FCM messages.
            const unsubscribe = onMessage(m, (payload) => {
                if (Notification.permission !== 'granted') return;

                console.log('Foreground push notification received:', payload);
                const link = payload.fcmOptions?.link || payload.data?.link;

                if (link) {
                    toast.info(
                        `${payload.notification?.title}: ${payload.notification?.body}`,
                        {
                            action: {
                                label: 'Visit',
                                onClick: () => {
                                    const link = payload.fcmOptions?.link || payload.data?.link;
                                    if (link) {
                                        router.push(link);
                                    }
                                },
                            },
                        },
                    );
                } else {
                    toast.info(
                        `${payload.notification?.title}: ${payload.notification?.body}`,
                    );
                }

                /**-------------------------------------------------------- */
                // Disable this if you only want toast notifications.
                const n = new Notification(
                    payload.notification?.title || 'New message',
                    {
                        body: payload.notification?.body || 'This is a new message',
                        data: link ? { url: link } : undefined,
                    },
                );

                // Handle notification click event to navigate to a link if present.
                n.onclick = (event) => {
                    event.preventDefault();
                    const link = (event.target as any)?.data?.url;
                    if (link) {
                        router.push(link);
                    } else {
                        console.log('No link found in the notification payload');
                    }
                };
                /**-------------------------------------------------------- */
            });

            return unsubscribe;
        };

        let unsubscribe: Unsubscribe | null = null;

        setupListener().then((unsub) => {
            if (unsub) {
                unsubscribe = unsub;
            }
        });
        return () => unsubscribe?.();
    }, [token, router, toast]);

    return { token, notificationPermissionStatus };
};

export default useFcmToken;