import type { GenerationProviderResult, VideoGenerationInput, VideoProvider } from "./provider";

type Job = { input: VideoGenerationInput; polls: number; cancelled: boolean };

export class MockVideoProvider implements VideoProvider {
  private jobs = new Map<string, Job>();
  private counter = 0;

  async submit(input: VideoGenerationInput): Promise<{ jobId: string }> {
    this.counter += 1;
    const jobId = `mock-${String(this.counter).padStart(4, "0")}`;
    this.jobs.set(jobId, { input, polls: 0, cancelled: false });
    return { jobId };
  }

  async getStatus(jobId: string): Promise<GenerationProviderResult> {
    const job = this.jobs.get(jobId);
    if (!job) return { status: "error", error: { message: "Generation job not found" } };
    if (job.cancelled) return { status: "cancelled" };
    job.polls += 1;
    if (job.polls === 1) return { status: "queued", progress: 10 };
    if (job.polls === 2) return { status: "generating", progress: 58 };
    return {
      status: "success",
      progress: 100,
      outputUrl: "/fixtures/mock-shot-02.mp4",
      thumbnailUrl: job.input.firstFrameUrl ?? "/fixtures/mina-old-shop-main.jpg",
    };
  }

  async cancel(jobId: string): Promise<void> {
    const job = this.jobs.get(jobId);
    if (job) job.cancelled = true;
  }
}
