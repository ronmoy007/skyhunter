import { getJobs, getJobById } from "./cache";
import { jobUpsert, jobDelete } from "./store";
import type { Job } from "./jobs";

// Cached reads; direct writes (writes revalidate the "jobs" cache tag).
export const listJobs = (): Promise<Job[]> => getJobs();
export { getJobById };
export const saveJob = (job: Job): Promise<void> => jobUpsert(job);
export const removeJob = (id: string): Promise<void> => jobDelete(id);
