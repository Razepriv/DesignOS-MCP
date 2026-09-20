export interface ProductionAsset {
  id: string;
  studio: string;
  assetUrl: string;
  type: string;
  status: 'pending' | 'ready';
}
