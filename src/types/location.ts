export interface Location {
  id: number;
  name: string;
  lat: number;
  lon: number;
  timezone: string;
  active: number;
}

export interface LocationState {
  selectedLocation: Location | null;
}

export interface CompareState {
  city1: Location | null;
  city2: Location | null;
}

export interface InputLocationFormProps {
  name: string;
  lat: string;
  lon: string;
  timezone: string;
  setName: (name: string) => void;
  setLat: (lat: string) => void;
  setLon: (lon: string) => void;
  setTimezone: (timezone: string) => void;
  handleAdd: () => void;
  saved: boolean;
  loading: boolean;
}

export interface LocationsTableProps {
  locations: Location[];
  handleToggleActive: (id: number, currentStatus: number) => void;
}
