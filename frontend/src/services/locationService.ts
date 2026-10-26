/**
 * Location Sharing & Geolocation Service Abstraction
 */

export interface GeoPoint {
  lat: number;
  lng: number;
  address: string;
  accuracyMeters?: number;
  timestamp: string;
}

class LocationService {
  public async getCurrentPosition(): Promise<GeoPoint> {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      return this.getFallbackBengaluruPosition();
    }

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          resolve({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracyMeters: Math.round(pos.coords.accuracy),
            address: 'GPS Verified Live Location',
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          });
        },
        () => {
          // On refusal or error, gracefully fallback
          resolve(this.getFallbackBengaluruPosition());
        },
        { timeout: 5000, enableHighAccuracy: false }
      );
    });
  }

  public getFallbackBengaluruPosition(): GeoPoint {
    return {
      lat: 12.9784,
      lng: 77.6408,
      address: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
      accuracyMeters: 10,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }

  public calculateDistanceKm(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Radius of the earth in km
    const dLat = this.deg2rad(lat2 - lat1);
    const dLon = this.deg2rad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.deg2rad(lat1)) * Math.cos(this.deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10;
  }

  private deg2rad(deg: number): number {
    return deg * (Math.PI / 180);
  }
}

export const locationService = new LocationService();
