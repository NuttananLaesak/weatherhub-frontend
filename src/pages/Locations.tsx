import { useEffect, useState } from "react";
import type { Location } from "../types/location";
import Navbar from "../components/layout/Navbar";
import { Spinner } from "../components/loading/Spinner";
import { InputLocationForm } from "../components/form/InputLocationForm";
import { LocationsTable } from "../components/form/LocationsTable";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { markerIcon } from "../styles/markerMapStyle";
import {
  getLocations,
  addLocation,
  toggleLocationActive,
  getTimezone,
} from "../api/locationApi";

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [timezone, setTimezone] = useState("");
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Fetch locations and cache
  const fetchLocations = async () => {
    setLoading(true);

    const cachedLocations = localStorage.getItem("locationsData");
    const cachedTime = localStorage.getItem("locationsDataTime");
    const currentTime = Date.now();

    const cacheExpired =
      cachedTime && (currentTime - parseInt(cachedTime)) / 1000 > 60;

    if (cachedLocations && !cacheExpired) {
      setLocations(JSON.parse(cachedLocations));
      setLoading(false);
    } else {
      try {
        const res = await getLocations();
        setLocations(res.data.reverse());
        localStorage.setItem("locationsData", JSON.stringify(res.data));
        localStorage.setItem("locationsDataTime", currentTime.toString());
      } catch (err) {
        console.error("Error fetching locations:", err);
      } finally {
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  // Handle location addition
  const handleAdd = async () => {
    setLoading(true);
    setSaved(true);
    try {
      await addLocation(name, parseFloat(lat), parseFloat(lon), timezone);
      resetForm();
      removeCache();
      fetchLocations();
    } catch (err) {
      console.error("Error saving location:", err);
    } finally {
      setLoading(false);
      setSaved(false);
    }
  };

  // Handle active status toggle
  const handleToggleActive = async (id: number, currentStatus: number) => {
    setLoading(true);
    try {
      await toggleLocationActive(id, currentStatus);
      removeCache();
      fetchLocations();
    } catch (err) {
      console.error("Error toggling active status:", err);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  };

  // Remove cache data
  function removeCache() {
    localStorage.removeItem("locationsData");
    localStorage.removeItem("locationsDataTime");
  }

  // Reset form fields
  function resetForm() {
    setName("");
    setLat("");
    setLon("");
    setTimezone("");
    setMarker(null);
  }

  // Handle map click event timezone
  function LocationSelector() {
    useMapEvents({
      async click(e) {
        const latVal = e.latlng.lat;
        const lonVal = e.latlng.lng;

        setMarker([latVal, lonVal]);
        setLat(latVal.toFixed(4));
        setLon(lonVal.toFixed(4));

        try {
          const timezone = await getTimezone(latVal, lonVal);
          setTimezone(timezone);
        } catch (err) {
          console.error("Error fetching timezone:", err);
          setTimezone("");
        }
      },
    });
    return marker ? <Marker position={marker} icon={markerIcon} /> : null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      {/* Loading Spinner */}
      {loading && <Spinner />}

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Locations</h1>

        {/* Input Form */}
        <InputLocationForm
          name={name}
          lat={lat}
          lon={lon}
          timezone={timezone}
          setName={setName}
          setLat={setLat}
          setLon={setLon}
          setTimezone={setTimezone}
          handleAdd={handleAdd}
          saved={saved}
          loading={loading}
        />

        {/* Map */}
        <div className="h-[400px] mb-6 border rounded overflow-hidden dark:border-gray-700">
          <MapContainer
            center={marker || [13.7367, 100.5231]}
            zoom={marker ? 12 : 6}
            className="h-full w-full"
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <LocationSelector />
          </MapContainer>
        </div>

        {/* Locations Table */}
        <LocationsTable
          locations={locations}
          handleToggleActive={handleToggleActive}
        />
      </div>
    </div>
  );
}
