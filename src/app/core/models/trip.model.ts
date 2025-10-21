export interface Coordinates {
  lat: number;
  lon: number;
}

export interface Trip {
  id: number;
  date: string;
  location: string;
  coords: Coordinates;
  previewImages: string[];
  images: string[];
}
