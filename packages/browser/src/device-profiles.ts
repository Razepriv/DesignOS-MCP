export interface DeviceProfile {
  name: string;
  width: number;
  height: number;
  deviceScaleFactor: number;
  isMobile?: boolean;
  hasTouch?: boolean;
  userAgent?: string;
}

export const DEVICE_PROFILES: Record<string, DeviceProfile> = {
  iphone15: { name: 'iPhone 15', width: 393, height: 852, deviceScaleFactor: 3, isMobile: true, hasTouch: true, userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.0 Mobile/15E148 Safari/604.1' },
  iphone15ProMax: { name: 'iPhone 15 Pro Max', width: 430, height: 932, deviceScaleFactor: 3, isMobile: true, hasTouch: true },
  ipadPro: { name: 'iPad Pro', width: 1024, height: 1366, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  pixelTablet: { name: 'Pixel Tablet', width: 1280, height: 800, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
  pixel8: { name: 'Pixel 8', width: 412, height: 892, deviceScaleFactor: 2.75, isMobile: true, hasTouch: true },
  macbook: { name: 'MacBook Pro 14"', width: 1512, height: 982, deviceScaleFactor: 2 },
  desktopHD: { name: 'Desktop HD', width: 1920, height: 1080, deviceScaleFactor: 1 },
  desktop4K: { name: 'Desktop 4K', width: 3840, height: 2160, deviceScaleFactor: 1 },
};
