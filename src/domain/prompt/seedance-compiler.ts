import type { PromptCompilerInput } from "./types";

const lines = (items: Array<string | undefined>) => items.filter(Boolean).join("\n");
const list = (items: string[] | undefined) => items?.filter(Boolean).join(", ") ?? "";

export function compileSeedancePrompt(input: PromptCompilerInput): string {
  const { character, location, props, style, shot } = input;
  const propText = props
    .map(
      (prop) =>
        `@${prop.name}: ${list(prop.description)}${
          prop.state?.length ? `; current state: ${list(prop.state)}` : ""
        }`,
    )
    .join("\n");

  const sections = [
    [
      "GLOBAL STYLE",
      lines([
        list(style.global),
        style.cameraLanguage?.length
          ? `Camera language: ${list(style.cameraLanguage)}`
          : undefined,
      ]),
    ],
    [
      "CHARACTERS",
      lines([
        `@${character.name}: ${list(character.identity)}`,
        character.currentState?.length
          ? `Current state: ${list(character.currentState)}`
          : undefined,
      ]),
    ],
    ["LOCATION", `@${location.name}: ${list(location.description)}`],
    ["PROPS", propText],
    [
      "FIRST FRAME / BLOCKING",
      shot.firstFrame ??
        "Maintain the established subject, prop, and location continuity from the reference frame.",
    ],
    [
      "ACTION",
      lines([
        character.action,
        character.expression ? `Expression: ${character.expression}` : undefined,
        character.gaze ? `Gaze: ${character.gaze}` : undefined,
      ]),
    ],
    ["CAMERA", lines([shot.shotSize, shot.cameraMovement, shot.angle])],
    ["OPTICS", lines([shot.lens, shot.focus])],
    ["PHYSICS", list(shot.physics)],
    ["LIGHTING", list(shot.lighting)],
    ["AUDIO", list(shot.audio)],
    [
      "CONSISTENCY RULES",
      `Maintain the exact established identity of @${character.name}, the established geometry and appearance of referenced props, the established location structure, and the project visual language. Only apply the current resolved states and shot-specific direction described above.`,
    ],
  ] as const;

  return sections
    .filter(([, body]) => body.trim())
    .map(([title, body]) => `${title}\n${body.trim()}`)
    .join("\n\n");
}
