export type ResolvedCharacter = {
  name: string;
  identity: string[];
  currentState?: string[];
  action?: string;
  expression?: string;
  gaze?: string;
};

export type ResolvedLocation = { name: string; description: string[] };
export type ResolvedProp = { name: string; description: string[]; state?: string[] };
export type ResolvedStyle = { global: string[]; cameraLanguage?: string[] };
export type ResolvedShotDirection = {
  firstFrame?: string;
  shotSize?: string;
  cameraMovement?: string;
  angle?: string;
  lens?: string;
  focus?: string;
  physics?: string[];
  lighting?: string[];
  audio?: string[];
};

export type PromptCompilerInput = {
  character: ResolvedCharacter;
  location: ResolvedLocation;
  props: ResolvedProp[];
  style: ResolvedStyle;
  shot: ResolvedShotDirection;
};
