import { unstable_cache } from "next/cache";
import { jobsList, contentAll } from "./store";
import type { Job } from "./jobs";

/*
  Cached data reads. Jobs and site content change rarely (only via the admin),
  so we cache them across requests and bust the cache on write with
  revalidateTag("jobs" | "content"). This turns repeated DB round-trips
  (e.g. the community page's 8 content lookups) into a single cached read.
*/

export const getJobs = unstable_cache(() => jobsList(), ["jobs-all"], {
  tags: ["jobs"],
  revalidate: 600,
});

const getContentMap = unstable_cache(() => contentAll(), ["content-all"], {
  tags: ["content"],
  revalidate: 600,
});

export async function collectionGet<T>(key: string, seed: T): Promise<T> {
  const map = await getContentMap();
  return key in map ? (map[key] as T) : seed;
}

export async function getJobById(id: string): Promise<Job | null> {
  return (await getJobs()).find((j) => j.id === id) ?? null;
}
