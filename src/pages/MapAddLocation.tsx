import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import { useState } from "react";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// ✅ Import รูปภาพของ marker โดยตรง (แก้ปัญหา require และ TS error)
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

// ✅ กำหนดค่า icon ให้ Leaflet ไม่เป็น missing icon
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

interface Props {
  onSelect: (lat: number, lon: number) => void;
}

export default function MapAddLocation({ onSelect }: Props) {
  const [position, setPosition] = useState<[number, number] | null>(null);

  function LocationMarker() {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setPosition([lat, lng]);
        onSelect(lat, lng);
      },
    });

    return position === null ? null : <Marker position={position} />;
  }

  return (
    <MapContainer
      center={[18.7883, 98.9853]}
      zoom={8}
      style={{ height: 400, width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      <LocationMarker />
    </MapContainer>
  );
}
