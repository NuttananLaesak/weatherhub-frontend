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
  const [loading, setLoading] = useState(false); // ✅ เพิ่ม state สำหรับ loading

  const fetchLocations = async () => {
    const res = await api.get<Location[]>("/locations");
    setLocations(res.data);
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  const handleAdd = async () => {
    setLoading(true); // ✅ เริ่ม loading
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
      setLoading(false); // ✅ หยุด loading
    }
  };

  // ✅ ดึง timezone จาก Open-Meteo API
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
          console.log("Fetched timezone:", data.timezone);
          setTimezone(data.timezone || "");
          return marker ? <Marker position={marker} icon={customIcon} /> : null;
        } catch (err) {
          console.error("Error fetching timezone:", err);
          setTimezone("");
        }
      },
    });
    return marker ? <Marker position={marker} /> : null;
  }

  return (
    <div>
      <Navbar />

      {/* ✅ Overlay Spinner */}
      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-[9999]">
          <div className="w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <div className="p-6">
        <h1 className="text-2xl font-bold mb-4">Locations</h1>

        <div className="mb-4">
          <input
            className="border p-2 mr-2"
            placeholder="City Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input
            className="border p-2 mr-2 w-24"
            placeholder="Lat"
            value={lat}
            onChange={(e) => setLat(e.target.value)}
          />
          <input
            className="border p-2 mr-2 w-24"
            placeholder="Lon"
            value={lon}
            onChange={(e) => setLon(e.target.value)}
          />
          <input
            className="border p-2 mr-2 w-36"
            placeholder="Timezone"
            value={timezone}
            onChange={(e) => setTimezone(e.target.value)}
          />
          <button
            className="bg-green-500 text-white px-4 py-2 rounded"
            onClick={handleAdd}
            disabled={!name || !lat || !lon || !timezone || loading}
          >
            {loading ? "Saving..." : "Add"}
          </button>
        </div>

        {/* แผนที่ */}
        <div className="h-[400px] mb-6 border rounded">
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

        {/* ตารางแสดง Locations */}
        <table className="w-full border">
          <thead>
            <tr className="bg-gray-200">
              <th className="border p-2">Name</th>
              <th className="border p-2">Lat</th>
              <th className="border p-2">Lon</th>
              <th className="border p-2">Timezone</th>
            </tr>
          </thead>
          <tbody>
            {locations.map((loc) => (
              <tr key={loc.id}>
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
  );
}
