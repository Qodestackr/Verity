"use client";

import { useCurrency } from "@/hooks/useCurrency";
import * as Sentry from "@sentry/nextjs";
import NextError from "next/error";
import { useEffect } from "react";

export default function GlobalError({ error }: any) {
    const isProdLike = process.env.NODE_ENV.includes("production");

    useEffect(() => {
        Sentry.captureException(error);
    }, [error]);

    useEffect(() => {
        let cancelled = false;
        setTimeout(() => {
            if (isProdLike && !cancelled) {
                window.location.assign("/");
            }
        }, 20);
        return () => {
            cancelled = true;
        };
    }, [isProdLike]);

    return (
        <html>
            <body>
                {isProdLike ? (
                    "...." // Spinner
                ) : (
                    <NextError
                        /* `NextError` is the default Next.js error page component. Its type
                        definition requires a `statusCode` prop. However, since the App Router
                        does not expose status codes for errors, we simply pass 0 to render a
                        generic error message. */
                        statusCode={0}
                    />
                )}
            </body>
        </html>
    );
}