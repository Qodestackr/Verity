import Redis from "ioredis";

const getRedisUrl = (): string => {
  const redisUrl =
    process.env.REDIS_URL ||
    "rediss://default:AfX3AAIjcDE5NzliODYyNzcxOTI0ZmMyOTg1ZDA0MDYyYjgxNDlmN3AxMA@maximum-cat-62967.upstash.io:6379";
  if (!redisUrl) {
    console.error("REDIS_URL is not defined in environment variables");
    throw new Error("REDIS_URL is not defined");
  }
  return redisUrl;
};

export const redis = new Redis(getRedisUrl(), {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000); // Exponential backoff
    console.warn(`Redis connection failed. Retrying in ${delay}ms`);
    return delay;
  },
  connectTimeout: 10000,
  keyPrefix: "alcora:", // Prefix avoids key collisions
});

redis.on("error", (err) => {
  console.error("Redis error", { error: err.message });
});

redis.on("ready", () => {
  console.info("Redis connection established successfully");
});

redis.on("close", () => {
  console.warn("Redis connection closed");
});

redis.on("end", () => {
  console.info("Redis connection ended");
});

redis.on("reconnecting", () => {
  console.info("Redis reconnecting...");
});
