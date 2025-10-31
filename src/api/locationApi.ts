import api from "./axios";

export const getLocations = async () => {
  return await api.get("/locations");
};

export const getTimezone = async (lat: number, lon: number) => {
  try {
    const res = await fetch(
      `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m&timezone=auto`
    );
    const data = await res.json();
    return data.timezone || "";
  } catch (err) {
    console.error("Error fetching timezone:", err);
    throw err;
  }
};

export const addLocation = async (
  name: string,
  lat: number,
  lon: number,
  timezone: string
) => {
  try {
    await api.post("/locations", {
      name,
      lat,
      lon,
      timezone,
    });
    await api.post("/ingest/run");
  } catch (err) {
    console.error("Error saving location:", err);
    throw err;
  }
};

export const toggleLocationActive = async (
  id: number,
  currentStatus: number
) => {
  try {
    const newActiveStatus = currentStatus === 1 ? 0 : 1;
    await api.patch(`/locations/${id}`, { active: newActiveStatus });
  } catch (err) {
    console.error("Error toggling active status:", err);
    throw err;
  }
};
