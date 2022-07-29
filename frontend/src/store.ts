import { configureStore } from '@reduxjs/toolkit';
import spiderReducer from './spiderSlice';

export default configureStore({
  reducer: spiderReducer,
  // do not check for serializables or not
  // see https://stackoverflow.com/questions/61704805/getting-an-error-a-non-serializable-value-was-detected-in-the-state-when-using
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false
    })
});
