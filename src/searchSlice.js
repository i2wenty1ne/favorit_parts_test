import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { getBrands, getOffers, requestParts } from './api.js';

export const fetchBrands = createAsyncThunk(
  'search/brands',
  async ({ number, mode }, { signal }) => {
    const goods = await requestParts({ number, mode, signal });
    return getBrands(goods);
  },
);

export const fetchOffers = createAsyncThunk(
  'search/offers',
  async ({ number, brand, mode }, { signal }) => {
    const goods = await requestParts({ number, brand, mode, signal });
    return getOffers(goods, brand, number);
  },
);

const emptyResults = {
  brands: [],
  selectedBrand: null,
  offers: [],
  brandsStatus: 'idle',
  offersStatus: 'idle',
  brandsError: null,
  offersError: null,
  brandsRequest: null,
  offersRequest: null,
};

const initialState = {
  query: '',
  searchedNumber: '',
  mode: 'demo',
  configured: null,
  ...emptyResults,
};

const searchSlice = createSlice({
  name: 'search',
  initialState,
  reducers: {
    setQuery(state, { payload }) {
      if (state.query === payload) return;

      Object.assign(state, emptyResults);
      state.query = payload;
      state.searchedNumber = '';
    },
    setMode(state, { payload }) {
      if (state.mode === payload) return;

      Object.assign(state, emptyResults);
      state.mode = payload;
      state.searchedNumber = '';
    },
    setConfigured(state, { payload }) {
      state.configured = payload;
    },
    selectBrand(state, { payload }) {
      state.selectedBrand = payload;
      state.offers = [];
      state.offersStatus = 'idle';
      state.offersError = null;
      state.offersRequest = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBrands.pending, (state, action) => {
        Object.assign(state, emptyResults);
        state.brandsStatus = 'loading';
        state.brandsRequest = action.meta.requestId;
        state.searchedNumber = action.meta.arg.number;
      })
      .addCase(fetchBrands.fulfilled, (state, action) => {
        if (state.brandsRequest !== action.meta.requestId) return;

        state.brands = action.payload;
        state.brandsStatus = 'success';
      })
      .addCase(fetchBrands.rejected, (state, action) => {
        if (state.brandsRequest !== action.meta.requestId) return;

        state.brandsStatus = action.meta.aborted ? 'idle' : 'error';
        state.brandsError = action.meta.aborted ? null : action.error.message;
      })
      .addCase(fetchOffers.pending, (state, action) => {
        state.offersStatus = 'loading';
        state.offersError = null;
        state.offersRequest = action.meta.requestId;
      })
      .addCase(fetchOffers.fulfilled, (state, action) => {
        if (state.offersRequest !== action.meta.requestId) return;

        state.offers = action.payload;
        state.offersStatus = 'success';
      })
      .addCase(fetchOffers.rejected, (state, action) => {
        if (state.offersRequest !== action.meta.requestId) return;

        state.offersStatus = action.meta.aborted ? 'idle' : 'error';
        state.offersError = action.meta.aborted ? null : action.error.message;
      });
  },
});

export const { setQuery, setMode, setConfigured, selectBrand } = searchSlice.actions;
export const searchReducer = searchSlice.reducer;
