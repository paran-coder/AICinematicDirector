import assert from "node:assert/strict";
import { compileSeedancePrompt } from "../src/domain/prompt/seedance-compiler";
import { MockVideoProvider } from "../src/providers/video/mock-provider";

async function main() {
  const prompt = compileSeedancePrompt({
    character: { name: "mina", identity: ["32-year-old Korean woman", "short black bob hair", "brown eyes", "small mole beneath left eye"], currentState: ["wet hair", "wet black leather jacket", "tired"], action: "slowly turns toward the sound", expression: "nervous", gaze: "looking left" },
    location: { name: "old_shop", description: ["narrow antique shop", "dark wooden interior", "green hanging lamp"] },
    props: [{ name: "cassette_player", description: ["silver brushed-metal rectangular body", "black buttons", "scratch on upper-right corner"] }],
    style: { global: ["cinematic realism", "muted cyan and amber", "subtle 35mm grain"], cameraLanguage: ["mostly eye-level", "slow controlled movement"] },
    shot: { shotSize: "medium shot", cameraMovement: "slow dolly in", angle: "eye level", lens: "35mm", focus: "Mina face", physics: ["heavy rain outside", "subtle wet hair movement"], lighting: ["warm indoor tungsten", "cool blue rain spill"], audio: ["rain ambience", "quiet antique shop room tone"] },
  });
  for (const section of ["GLOBAL STYLE", "CHARACTERS", "LOCATION", "PROPS", "CAMERA", "CONSISTENCY RULES"]) assert.ok(prompt.includes(section), section);
  assert.ok(prompt.includes("@mina"));

  const provider = new MockVideoProvider();
  const first = await provider.submit({ prompt, durationSeconds: 8, aspectRatio: "16:9", firstFrameUrl: "/fixtures/mina-old-shop-main.jpg" });
  assert.equal((await provider.getStatus(first.jobId)).status, "queued");
  assert.equal((await provider.getStatus(first.jobId)).status, "generating");
  const done = await provider.getStatus(first.jobId);
  assert.equal(done.status, "success");
  assert.equal(done.thumbnailUrl, "/fixtures/mina-old-shop-main.jpg");

  const second = await provider.submit({ prompt, durationSeconds: 8, aspectRatio: "16:9" });
  await provider.cancel?.(second.jobId);
  assert.equal((await provider.getStatus(second.jobId)).status, "cancelled");

  console.log("Prompt/Provider tests: passed (submit, polling, success, cancel)");
}
main();
