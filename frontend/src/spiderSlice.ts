import { createSlice, PayloadAction } from '@reduxjs/toolkit';

import { Spider } from './interfaces/spider';

export const spiderSlice = createSlice({
  name: 'spider',
  initialState: {
    current: {
      name: ''
    } as Spider
  },
  reducers: {
    setSpider: (state, action: PayloadAction<Spider>) => {
      state.current = action.payload;
      console.log('setSpider', state.current.name);
    }
  }
});

// Action creators are generated for each case reducer function
export const { setSpider } = spiderSlice.actions;

export default spiderSlice.reducer;
