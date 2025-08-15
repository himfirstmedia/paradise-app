// @/hooks/useReduxHouse.ts
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadHouses } from "@/redux/slices/houseSlice";
import { House } from "@/types/house";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

const normalizeHouseName = (name: string) => 
  name.trim().replace(/\s+/g, "_").toUpperCase();

export function useReduxHouse() {
  const dispatch = useAppDispatch();
  const { houses, loading, error } = useAppSelector((state) => state.house);
  const [refreshing, setRefreshing] = useState(false);

  const initialLoad = useRef(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadHouses()).unwrap();
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!initialLoad.current && !loading && houses.length === 0) {
      initialLoad.current = true;
        reload();
    }
  }, [loading, houses.length, reload]);


  const houseMap = useMemo(() => {
    const map: Record<string, { id: number; name: string }> = {};
    houses.forEach((house: House) => {
      const normalized = normalizeHouseName(house.name);
      map[normalized] = { id: house.id, name: house.name };
    });
    return map;
  }, [houses]);

  
  const getDisplayName = useCallback((houseValue: string | null) => {
    if (!houseValue) return "Individual";
    const normalized = normalizeHouseName(houseValue);
    return houseMap[normalized]?.name || houseValue;
  }, [houseMap]);

  return { 
    houses, 
    houseMap,
    getDisplayName,
    loading: loading || refreshing, 
    error, 
    reload 
  };
}