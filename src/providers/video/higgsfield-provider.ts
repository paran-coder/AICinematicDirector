import type { GenerationProviderResult, ProviderControl, ProviderSubmission, VideoGenerationInput, VideoProvider } from "./provider";

const API_BASE = "https://api.higgsfield.ai";
const TEXT_MODEL = "bytedance/seedance-2.5/text-to-video";
const IMAGE_MODEL = "bytedance/seedance-2.5/image-to-video";

type SubmitResponse = {
  request_id?: string;
  status_url?: string;
  cancel_url?: string;
};

type UnknownRecord = Record<string, unknown>;

function credentials(): string {
  const id = process.env.HF_API_KEY_ID?.trim();
  const secret = process.env.HF_API_KEY_SECRET?.trim();
  if (!id || !secret) throw new Error("Higgsfield credentials are not configured. Set HF_API_KEY_ID and HF_API_KEY_SECRET.");
  return `${id}:${secret}`;
}

function headers(): HeadersInit {
  return { Authorization: `Key ${credentials()}`, "Content-Type": "application/json" };
}

function absoluteReference(url?: string): string | undefined {
  if (!url) return undefined;
  if (/^https?:\/\//i.test(url)) return url;
  const appUrl = process.env.APP_URL?.replace(/\/$/, "");
  if (!appUrl || /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(appUrl)) {
    throw new Error("Seedance image-to-video requires a publicly reachable first-frame URL. Configure APP_URL to the deployed public origin or upload the frame to object storage.");
  }
  return `${appUrl}${url.startsWith("/") ? "" : "/"}${url}`;
}

function extractUrl(value: unknown): string | undefined {
  if (typeof value === "string" && /^https?:\/\//i.test(value)) return value;
  if (Array.isArray(value)) return value.map(extractUrl).find(Boolean);
  if (!value || typeof value !== "object") return undefined;
  const record = value as UnknownRecord;
  for (const key of ["url", "file_url", "video_url"]) {
    if (typeof record[key] === "string") return record[key] as string;
  }
  return undefined;
}

function normalizeStatus(raw: unknown): GenerationProviderResult {
  const record = (raw && typeof raw === "object" ? raw : {}) as UnknownRecord;
  const status = String(record.status ?? record.state ?? "").toLowerCase();
  const progressRaw = record.progress ?? record.progress_percent;
  const progress = typeof progressRaw === "number" ? progressRaw : undefined;

  const video = extractUrl(record.video)
    ?? extractUrl(record.videos)
    ?? extractUrl(record.output)
    ?? extractUrl((record.result as UnknownRecord | undefined)?.video)
    ?? extractUrl((record.data as UnknownRecord | undefined)?.video);
  const thumbnail = extractUrl(record.thumbnail)
    ?? extractUrl((record.result as UnknownRecord | undefined)?.thumbnail);

  if (["completed", "complete", "succeeded", "success", "done"].includes(status) || video) {
    return { status: "success", progress: 100, outputUrl: video, thumbnailUrl: thumbnail };
  }
  if (["failed", "error"].includes(status)) {
    const message = typeof record.error === "string"
      ? record.error
      : typeof (record.error as UnknownRecord | undefined)?.message === "string"
        ? (record.error as UnknownRecord).message as string
        : "Higgsfield generation failed";
    return { status: "error", progress, error: { message } };
  }
  if (["cancelled", "canceled"].includes(status)) return { status: "cancelled", progress };
  if (["queued", "pending", "submitted"].includes(status)) return { status: "queued", progress };
  return { status: "generating", progress };
}

export class HiggsfieldSeedanceProvider implements VideoProvider {
  private statusUrls = new Map<string, string>();
  private cancelUrls = new Map<string, string>();

  async submit(input: VideoGenerationInput): Promise<ProviderSubmission> {
    const imageUrl = absoluteReference(input.firstFrameUrl);
    const model = imageUrl ? IMAGE_MODEL : TEXT_MODEL;
    const payload: Record<string, unknown> = {
      prompt: input.prompt,
      duration: Math.max(4, Math.min(30, Math.round(input.durationSeconds))),
      resolution: input.resolution ?? "720p",
      output_format: "mp4",
      generate_audio: input.generateAudio ?? true,
    };
    if (imageUrl) payload.image_url = imageUrl;
    else payload.aspect_ratio = input.aspectRatio;

    const response = await fetch(`${API_BASE}/${model}`, {
      method: "POST",
      headers: headers(),
      body: JSON.stringify(payload),
      cache: "no-store",
    });
    const json = await response.json().catch(() => ({})) as SubmitResponse & UnknownRecord;
    if (!response.ok) throw new Error(typeof json.error === "string" ? json.error : `Higgsfield submit failed (${response.status})`);
    if (!json.request_id) throw new Error("Higgsfield response did not include request_id");
    if (json.status_url) this.statusUrls.set(json.request_id, json.status_url);
    if (json.cancel_url) this.cancelUrls.set(json.request_id, json.cancel_url);
    return { jobId: json.request_id, control: { statusUrl: json.status_url, cancelUrl: json.cancel_url } };
  }

  async getStatus(jobId: string, control?: ProviderControl): Promise<GenerationProviderResult> {
    const statusUrl = control?.statusUrl ?? this.statusUrls.get(jobId) ?? `${API_BASE}/requests/${encodeURIComponent(jobId)}/status`;
    const response = await fetch(statusUrl, { headers: { Authorization: `Key ${credentials()}` }, cache: "no-store" });
    const json = await response.json().catch(() => ({}));
    if (!response.ok) return { status: "error", error: { message: `Higgsfield status failed (${response.status})` } };
    return normalizeStatus(json);
  }

  async cancel(jobId: string, control?: ProviderControl): Promise<void> {
    const cancelUrl = control?.cancelUrl ?? this.cancelUrls.get(jobId);
    if (!cancelUrl) throw new Error("No cancel_url is available for this Higgsfield request in the current process.");
    const response = await fetch(cancelUrl, { method: "POST", headers: { Authorization: `Key ${credentials()}` }, cache: "no-store" });
    if (!response.ok) throw new Error(`Higgsfield cancel failed (${response.status})`);
  }
}

export const _higgsfieldInternals = { normalizeStatus };
