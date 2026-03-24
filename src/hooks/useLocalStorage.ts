import { useState, useEffect } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      if (item === null) return initialValue;
      const parsed = JSON.parse(item);
      // Garantiza que arrays siempre sean arrays
      if (Array.isArray(initialValue) && !Array.isArray(parsed)) return initialValue;
      return parsed;
    } catch {
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(`Error guardando ${key} en localStorage:`, error);
    }
  };

  return [storedValue, setValue] as const;
}

// Generador de IDs sin decimales — lección aprendida de EduReligion
export function generarId(): string {
  return String(Math.floor(Date.now()) + Math.floor(Math.random() * 10000));
}
