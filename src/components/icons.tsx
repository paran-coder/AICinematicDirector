import type { SVGProps } from "react";

const common = { width: 20, height: 20, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function ProjectIcon(props: SVGProps<SVGSVGElement>) { return <svg {...common} {...props}><path d="M4 19V8l8-4 8 4v11"/><path d="M8 19v-6h8v6"/></svg>; }
export function CharacterIcon(props: SVGProps<SVGSVGElement>) { return <svg {...common} {...props}><circle cx="12" cy="8" r="3"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/></svg>; }
export function SceneIcon(props: SVGProps<SVGSVGElement>) { return <svg {...common} {...props}><path d="M4 5h16v14H4z"/><path d="m8 5 2 4 2-4 2 4 2-4"/></svg>; }
export function ShotIcon(props: SVGProps<SVGSVGElement>) { return <svg {...common} {...props}><rect x="4" y="7" width="13" height="10" rx="2"/><path d="m17 10 3-2v8l-3-2"/><circle cx="10.5" cy="12" r="2.5"/></svg>; }
export function GenerateIcon(props: SVGProps<SVGSVGElement>) { return <svg {...common} {...props}><path d="M12 3v12"/><path d="m8 11 4 4 4-4"/><path d="M5 21h14"/></svg>; }
export function CheckIcon(props: SVGProps<SVGSVGElement>) { return <svg {...common} {...props}><circle cx="12" cy="12" r="9"/><path d="m8 12 2.5 2.5L16 9"/></svg>; }
export function ChevronDown(props: SVGProps<SVGSVGElement>) { return <svg {...common} {...props}><path d="m7 10 5 5 5-5"/></svg>; }
export function PlayIcon(props: SVGProps<SVGSVGElement>) { return <svg {...common} {...props}><path d="m9 7 8 5-8 5z"/></svg>; }
