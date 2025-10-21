import { configureStore } from "@reduxjs/toolkit";
import locationReducer from "./locationSelected";
import compareReducer from "./compareSelected";

export const store = configureStore({
  reducer: {
    location: locationReducer,
    compare: compareReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
