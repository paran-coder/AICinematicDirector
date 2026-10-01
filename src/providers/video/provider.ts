export type GenerationStatus = "queued" | "generating" | "success" | "error" | "cancelled";

export type ProviderControl = {
  statusUrl?: string;
  cancelUrl?: string;
};

export type VideoGenerationInput = {
  prompt: string;
  durationSeconds: number;
  aspectRatio: string;
  firstFrameUrl?: string;
  resolution?: "480p" | "720p";
  generateAudio?: boolean;
};

export type GenerationProviderResult = {
  status: GenerationStatus;
  progress?: number;
  outputUrl?: string;
  thumbnailUrl?: string;
  error?: { message: string };
};

export type ProviderSubmission = {
  jobId: string;
  control?: ProviderControl;
};

export interface VideoProvider {
  submit(input: VideoGenerationInput): Promise<ProviderSubmission>;
  getStatus(jobId: string, control?: ProviderControl): Promise<GenerationProviderResult>;
  cancel?(jobId: string, control?: ProviderControl): Promise<void>;
}
