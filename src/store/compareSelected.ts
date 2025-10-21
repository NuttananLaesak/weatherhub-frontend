import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { Location } from "../types/location";

interface CompareState {
  city1: Location | null;
  city2: Location | null;
}

const initialState: CompareState = {
  city1: null,
  city2: null,
};

const compareSlice = createSlice({
  name: "compare",
  initialState,
  reducers: {
    setCity1(state, action: PayloadAction<Location | null>) {
      state.city1 = action.payload;
    },
    setCity2(state, action: PayloadAction<Location | null>) {
      state.city2 = action.payload;
    },
  },
});

export const { setCity1, setCity2 } = compareSlice.actions;
export default compareSlice.reducer;
