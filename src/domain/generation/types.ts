export type GenerationViewItem = {
  id: string;
  shotId: string;
  shotRouteId: string;
  shotTitle: string;
  shotOrder: number;
  status: string;
  version: number;
  selected: boolean;
  outputUrl?: string;
  thumbnailUrl?: string;
  createdAt?: string;
};
