
import { registerOTel } from "@vercel/otel";

// TODO:https://claude.ai/chat/13886fd7-a9cc-42eb-b2bd-2b14f0e8bb7a
export function register() {
  // Only enable in production if you want
  if (process.env.NODE_ENV === "production") {
    registerOTel({
      serviceName: "alcora",
    });
  }
}
