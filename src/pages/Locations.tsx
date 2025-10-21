import { useEffect, useState } from "react";
import api from "../api/axios";
import type { Location } from "../types/location";
import Navbar from "./Navbar";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Locations() {
  const [locations, setLocations] = useState<Location[]>([]);
  const [name, setName] = useState("");
  const [lat, setLat] = useState("");
  const [lon, setLon] = useState("");
  const [timezone, setTimezone] = useState("");
  const [marker, setMarker] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchLocations = async () => {
    setLoading(true);
    const res = await api.get<Location[]>("/locations");
    setLocations(res.data);
    setLoading(false);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAdd = async () => {
    setLoading(true);
    try {
      await api.post("/locations", {
        name,
        lat: parseFloat(lat),
        lon: parseFloat(lon),
        timezone,
      });
      setName("");
      setLat("");
      setLon("");
      setTimezone("");
      setMarker(null);
      fetchLocations();
    } catch (err) {
      console.error("Error saving location:", err);
    } finally {
      setLoading(false);
    }
  };

  function LocationSelector() {
    useMapEvents({
      async click(e) {
        const latVal = e.latlng.lat;
        const lonVal = e.latlng.lng;

        setMarker([latVal, lonVal]);
        setLat(latVal.toFixed(4));
        setLon(lonVal.toFixed(4));

        try {
          const res = await fetch(
            `https://api.open-meteo.com/v1/forecast?latitude=${latVal}&longitude=${lonVal}&current=temperature_2m&timezone=auto`
          );
          const data = await res.json();
          setTimezone(data.timezone || "");
        } catch (err) {
          console.error("Error fetching timezone:", err);
          setTimezone("");
        }
      },
    });
    return marker ? <Marker position={marker} icon={customIcon} /> : null;
  }

  return (
    <div className="bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-900 dark:text-white transition-colors duration-300">
      <Navbar />

      {/* Overlay Loading Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="p-6 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold mb-4">Locations</h1>

        {/* Input Form */}
        <div className="flex flex-wrap gap-2 mb-6">
          <input
            className="border dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded w-full sm:w-auto"
            placeholder="City Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded w-24"
            placeholder="Lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
          <input
            className="border dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded w-24"
            placeholder="Lon"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
          />
          <input
            className="border dark:border-gray-700 bg-white dark:bg-gray-800 text-black dark:text-white p-2 rounded w-36"
            placeholder="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
          <button
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded disabled:opacity-50"
            onClick={handleAdd}
            disabled={!name || !lat || !lon || !timezone || loading}
          >
            {loading ? "Saving..." : "Add"}
          </button>
        </div>

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

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
              <tr>
                <th className="border p-2">Name</th>
                <th className="border p-2">Lat</th>
                <th className="border p-2">Lon</th>
                <th className="border p-2">Timezone</th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 text-black dark:text-white">
              {locations.map((loc) => (
                <tr
                  key={loc.id}
                  className="hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td className="border p-2">{loc.name}</td>
                  <td className="border p-2">{loc.lat}</td>
                  <td className="border p-2">{loc.lon}</td>
                  <td className="border p-2">{loc.timezone}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
