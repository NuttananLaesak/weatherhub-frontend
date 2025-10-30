import api from "./axios";

export const getLocations = async () => {
  return await api.get("/locations");
};

export const getLatestWeather = async (locationId: number) => {
  return await api.get(`/weather/latest?location_id=${locationId}`);
};

export const getHourlyWeather = async (
  locationId: number,
  from: string,
  to: string
) => {
  return await api.get(
    `/weather/hourly?location_id=${locationId}&from=${from}&to=${to}`
  );
};

export const getDailyWeather = async (
  locationId: number,
  from: string,
  to: string
) => {
  return await api.get(
    `/weather/daily?location_id=${locationId}&from=${from}&to=${to}`
  );
};
