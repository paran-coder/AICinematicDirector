import { HiggsfieldSeedanceProvider } from "./higgsfield-provider";
import { MockVideoProvider } from "./mock-provider";
import type { VideoProvider } from "./provider";

const providers = new Map<string, VideoProvider>();

export function getVideoProvider(providerName = getVideoProviderName()): VideoProvider {
  const normalized = providerName.toLowerCase();
  const cached = providers.get(normalized);
  if (cached) return cached;
  const provider = normalized === "higgsfield" ? new HiggsfieldSeedanceProvider() : new MockVideoProvider();
  providers.set(normalized, provider);
  return provider;
}

export function getVideoProviderName(): string {
  return (process.env.VIDEO_PROVIDER ?? "mock").toLowerCase();
}
