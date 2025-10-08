"use client";

import { useState } from "react";

interface StorageValue<T> {
  value: T;
  expiry: number;
}

/**
 * localStorage with expiry support
 * @param key - localStorage key
 * @param initialValue - default value
 * @param expiryMonths - expiry duration in months (default: 6)
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  expiryMonths: number = 6
): [T, (value: T) => void] {
  // SSR 체크 - 서버에서는 initialValue 반환
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      if (!item) {
        return initialValue;
      }

      const parsed: StorageValue<T> = JSON.parse(item);
      const now = new Date().getTime();

      // 만료 체크
      if (now > parsed.expiry) {
        window.localStorage.removeItem(key);
        return initialValue;
      }

      return parsed.value;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // 값 저장 함수
  const setValue = (value: T) => {
    try {
      setStoredValue(value);

      if (typeof window !== "undefined") {
        const now = new Date().getTime();
        const expiryTime = now + expiryMonths * 30 * 24 * 60 * 60 * 1000; // months to ms

        const storageValue: StorageValue<T> = {
          value,
          expiry: expiryTime,
        };

        window.localStorage.setItem(key, JSON.stringify(storageValue));
      }
    } catch (error) {
      console.warn(`Error setting localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue];
}
