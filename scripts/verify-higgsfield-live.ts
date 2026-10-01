import assert from "node:assert/strict";
import { HiggsfieldSeedanceProvider } from "../src/providers/video/higgsfield-provider";

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function main() {
  assert.equal(process.env.ALLOW_PAID_GENERATION, "1", "Set ALLOW_PAID_GENERATION=1 to explicitly allow a paid live generation test");
  assert.ok(process.env.HF_API_KEY_ID, "HF_API_KEY_ID is required");
  assert.ok(process.env.HF_API_KEY_SECRET, "HF_API_KEY_SECRET is required");

  const provider = new HiggsfieldSeedanceProvider();
  const submission = await provider.submit({
    prompt: "A locked-off cinematic shot of warm tungsten light reflecting on a small silver cassette player on a dark wooden counter. Subtle rain ambience outside, realistic motion, no text.",
    durationSeconds: 4,
    aspectRatio: "16:9",
    resolution: "480p",
    generateAudio: false,
  });
  console.log(`Submitted live Higgsfield request: ${submission.jobId}`);

  for (let i = 0; i < 120; i += 1) {
    await sleep(3000);
    const result = await provider.getStatus(submission.jobId, submission.control);
    console.log(`status=${result.status}${typeof result.progress === "number" ? ` progress=${result.progress}` : ""}`);
    if (result.status === "success") {
      assert.ok(result.outputUrl, "Live generation completed without an output URL");
      console.log(`Live Higgsfield generation: passed\n${result.outputUrl}`);
      return;
    }
    if (result.status === "error" || result.status === "cancelled") throw new Error(result.error?.message ?? `Generation ended with ${result.status}`);
  }
  throw new Error("Live Higgsfield verification timed out");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
