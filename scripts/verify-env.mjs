const checks = [
  ["DATABASE_URL", process.env.DATABASE_URL, "PostgreSQL persistence / migration / seed"],
  ["HF_API_KEY_ID", process.env.HF_API_KEY_ID, "Higgsfield live generation"],
  ["HF_API_KEY_SECRET", process.env.HF_API_KEY_SECRET, "Higgsfield live generation"],
  ["APP_URL", process.env.APP_URL, "Public image-to-video first-frame URL"],
];

console.log("AI Cinematic Director RC environment check");
for (const [name, value, purpose] of checks) {
  console.log(`${value ? "✓" : "○"} ${name.padEnd(18)} ${value ? "configured" : "not configured"} — ${purpose}`);
}

const provider = (process.env.VIDEO_PROVIDER ?? "mock").toLowerCase();
console.log(`✓ VIDEO_PROVIDER      ${provider}`);
if (provider === "higgsfield" && (!process.env.HF_API_KEY_ID || !process.env.HF_API_KEY_SECRET)) {
  console.error("\nHiggsfield provider is selected but credentials are missing.");
  process.exitCode = 1;
}
if (provider === "higgsfield" && (!process.env.APP_URL || /^https?:\/\/(localhost|127\.0\.0\.1)/i.test(process.env.APP_URL))) {
  console.warn("\nWarning: image-to-video needs APP_URL to be publicly reachable when the first frame is a local app asset.");
}
