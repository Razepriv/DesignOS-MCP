export interface BrandSystem {
  id: string;
  name: string;
  colors: Record<string, string>;
  typography: Record<string, string>;
  logoUrl?: string;
}
