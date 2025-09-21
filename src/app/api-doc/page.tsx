
import { getApiDocs } from "@/lib/swagger";
import ReactSwagger from "./react-swagger";
import { Metadata } from "next";

export const metadata: Metadata = {
    title: "Alcora API Documentation",
    description: "Comprehensive API documentation for the Alcora platform",
};

export default async function ApiDocsPage() {
    const spec = await getApiDocs();

    return (
        <main className="min-h-screen bg-white">
            <ReactSwagger spec={spec} />
        </main>
    );
}