import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Location, LocationState } from "../types/location";

const initialState: LocationState = {
  selectedLocation: null,
};

const locationSlice = createSlice({
  name: "location",
  initialState,
  reducers: {
    setSelectedLocation(state, action: PayloadAction<Location | null>) {
      state.selectedLocation = action.payload;
    },
  },
});

export const { setSelectedLocation } = locationSlice.actions;

export default locationSlice.reducer;
