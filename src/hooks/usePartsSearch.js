import { useCallback, useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchBrands,
  fetchOffers,
  selectBrand,
  setConfigured,
  setMode,
  setQuery,
} from '../searchSlice.js';
import { SEARCH_DELAY } from '../constants.js';

export default function usePartsSearch() {
  const dispatch = useDispatch();
  const search = useSelector((state) => state.search);
  const { query, mode, selectedBrand, searchedNumber } = search;
  const timer = useRef(null);
  const brandsRequest = useRef(null);
  const offersRequest = useRef(null);

  useEffect(() => {
    const controller = new AbortController();

    async function loadConfig() {
      try {
        const response = await fetch('/api/config', { signal: controller.signal });

        if (!response.ok) {
          throw new Error('Не удалось получить настройки API.');
        }

        const { configured } = await response.json();
        dispatch(setConfigured(Boolean(configured)));

        if (configured) {
          dispatch(setMode('live'));
        }
      } catch {
        if (!controller.signal.aborted) {
          dispatch(setConfigured(false));
        }
      }
    }

    loadConfig();
    return () => controller.abort();
  }, [dispatch]);

  const searchBrands = useCallback(() => {
    clearTimeout(timer.current);
    brandsRequest.current?.abort();

    if (query.trim()) {
      brandsRequest.current = dispatch(fetchBrands({ number: query.trim(), mode }));
    }
  }, [query, mode, dispatch]);

  useEffect(() => {
    if (query.trim()) {
      timer.current = setTimeout(searchBrands, SEARCH_DELAY);
    }

    return () => {
      clearTimeout(timer.current);
      brandsRequest.current?.abort();
    };
  }, [query, searchBrands]);

  const searchOffers = useCallback(() => {
    offersRequest.current?.abort();

    if (selectedBrand && searchedNumber) {
      offersRequest.current = dispatch(
        fetchOffers({ number: searchedNumber, brand: selectedBrand, mode }),
      );
    }
  }, [selectedBrand, searchedNumber, mode, dispatch]);

  useEffect(() => {
    searchOffers();
    return () => offersRequest.current?.abort();
  }, [searchOffers]);

  function changeQuery(number) {
    if (number === query) {
      searchBrands();
    } else {
      dispatch(setQuery(number));
    }
  }

  function chooseBrand(brand) {
    if (brand !== selectedBrand) {
      dispatch(selectBrand(brand));
    }
  }

  return {
    search,
    searchBrands,
    searchOffers,
    changeQuery,
    chooseBrand,
    changeMode: (mode) => dispatch(setMode(mode)),
  };
}
