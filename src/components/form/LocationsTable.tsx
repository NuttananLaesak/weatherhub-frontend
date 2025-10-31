import React from "react";
import { AiFillCheckCircle, AiOutlineCloseCircle } from "react-icons/ai";
import { BsGlobeAmericas } from "react-icons/bs";
import type { LocationsTableProps } from "../../types/location";

export const LocationsTable: React.FC<LocationsTableProps> = ({
  locations,
  handleToggleActive,
}) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border border-gray-300 dark:border-gray-700">
        <thead className="bg-gray-200 dark:bg-gray-700 text-black dark:text-white">
          <tr>
            <th className="border p-2">Name</th>
            <th className="border p-2">Lat</th>
            <th className="border p-2">Lon</th>
            <th className="border p-2">Timezone</th>
            <th className="border p-2">Active</th>
          </tr>
        </thead>
        <tbody className="bg-white dark:bg-gray-800 text-black dark:text-white">
          {locations.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-8 text-center relative">
                <div className="relative overflow-hidden rounded-lg p-10 bg-white dark:bg-gray-800 shadow-lg text-center transition-all duration-300 hover:shadow-2xl">
                  <div className="absolute inset-0 opacity-5 bg-[url('/pattern.svg')] bg-cover bg-center pointer-events-none" />
                  <div className="flex justify-center mb-4">
                    <BsGlobeAmericas className="text-6xl text-green-600 dark:text-green-400 animate-bounce" />
                  </div>
                  <h2 className="text-2xl font-semibold text-gray-800 dark:text-white mb-2">
                    No locations found
                  </h2>
                  <p className="text-md text-gray-600 dark:text-gray-400">
                    Add a new location above or click on the map to select one.
                  </p>
                </div>
              </td>
            </tr>
          ) : (
            locations.map((loc) => (
              <tr
                key={loc.id}
                className="hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <td className="border p-2">{loc.name}</td>
                <td className="border p-2">{loc.lat}</td>
                <td className="border p-2">{loc.lon}</td>
                <td className="border p-2">{loc.timezone}</td>
                <td className="border p-2 text-center">
                  <button
                    onClick={() => handleToggleActive(loc.id, loc.active)}
                    className={`px-4 py-2 rounded ${
                      loc.active ? "bg-green-500" : "bg-gray-400"
                    }`}
                  >
                    {loc.active ? (
                      <AiFillCheckCircle className="text-white text-xl" />
                    ) : (
                      <AiOutlineCloseCircle className="text-white text-xl" />
                    )}
                  </button>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};
