export interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
  timezone: string;
  active: boolean;
}

export interface LocationState {
  selectedLocation: Location | null;
}

export interface CompareState {
  city1: Location | null;
  city2: Location | null;
}
