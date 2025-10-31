import React from "react";
import type { InputLocationFormProps } from "../../types/location";

export const InputLocationForm: React.FC<InputLocationFormProps> = ({
  name,
  lat,
  lon,
  timezone,
  setName,
  setLat,
  setLon,
  setTimezone,
  handleAdd,
  saved,
  loading,
}) => {
  return (
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
        {saved ? "Saving..." : "Add"}
      </button>
    </div>
  );
};
