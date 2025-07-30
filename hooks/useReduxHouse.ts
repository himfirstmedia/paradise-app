// @/hooks/useReduxHouse.ts
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { loadHouses } from "@/redux/slices/houseSlice";
import { useCallback, useEffect, useMemo, useState } from "react";

const normalizeHouseName = (name: string) => 
  name.trim().replace(/\s+/g, "_").toUpperCase();

export function useReduxHouse() {
  const dispatch = useAppDispatch();
  const { houses, loading, error } = useAppSelector((state) => state.house);
  const [refreshing, setRefreshing] = useState(false);

  const reload = useCallback(async () => {
    setRefreshing(true);
    try {
      await dispatch(loadHouses()).unwrap();
    } finally {
      setRefreshing(false);
    }
  }, [dispatch]);

  useEffect(() => {
    if (!loading && houses.length === 0) {
      const timeout = setTimeout(() => {
        reload();
      }, 0);

      return () => clearTimeout(timeout);
    }
  }, [loading, houses.length, reload]);


  const houseMap = useMemo(() => {
    const map: Record<string, { id: number; name: string }> = {};
    houses.forEach(house => {
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