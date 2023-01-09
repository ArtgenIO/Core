export interface IReverseProxy {
  id: string;
  host: string | null;
  path: string | null;
  hostRewrite: string | null;
  stripPath: boolean;
  target: string;
  createdAt: string | Date;
  updatedAt: string | Date | null;
}
