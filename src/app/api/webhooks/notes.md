I've face an issue with load testing where the API endpoint that handles webhooks crashes after 4k RPS. The standard and scalable
way is too decouple request ingestion from processing. I dont believe moving to Hono solves bad architecture decision, so:

**Async approach with Queues**:

- Respond to Saleor immediately (fast 200 OK), even if processing is slow or heavy.
- Avoid timeouts and keep server responsive under load.
- Prevent simultaneous heavy DB/Redis writes from overwhelming Nextjs server.

BullMQ: On webhook receipt, push the event payload into a queue. Respond immediately to Saleor with 200 OK. (Run one or more worker processes (can be separate Node.js scripts or serverless functions) to consume and process the queue.)

```ts
import { Queue } from "bullmq";
import { redis } from "@/lib/redis";

export const webhookQueue = new Queue("acora-webhooks", {
  connection: {
    host: "localhost",
    port: 9191,
    password: process.env.REDIS_PASSWORD,
  },
});

// THEN:
import { webhookQueue } from "@/lib/webhookQueue";

export async function POST(req: NextRequest) {
  // ... signature verification, parsing, etc.

  // Instead of await handler(payload):
  await webhookQueue.add(saleorEvent, payload);

  return NextResponse.json({ success: true }, { status: 200 });
}
```
