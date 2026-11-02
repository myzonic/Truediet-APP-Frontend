import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type OnboardingData = {
  goal: string;
  age: string;
  sex: string;
  height: string;
  weight: string;
  allergies: string[];
  dietaryPreferences: string[];
};

const initialState: OnboardingData = {
  goal: '',
  age: '',
  sex: '',
  height: '',
  weight: '',
  allergies: [],
  dietaryPreferences: [],
};

// The answers are kept on the device as well as in the database, so a user
// who leaves mid-assessment does not lose everything when the app restarts.
const ONBOARDING_KEY = 'truediet.onboarding.v1';

type OnboardingContextValue = {
  data: OnboardingData;
  updateData: (v: Partial<OnboardingData>) => void;
  resetOnboarding: () => void;
  hydrated: boolean;
};

const Context = createContext<OnboardingContextValue | undefined>(undefined);

async function readStored(): Promise<OnboardingData | null> {
  try {
    const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      goal: typeof parsed.goal === 'string' ? parsed.goal : '',
      age: typeof parsed.age === 'string' ? parsed.age : '',
      sex: typeof parsed.sex === 'string' ? parsed.sex : '',
      height: typeof parsed.height === 'string' ? parsed.height : '',
      weight: typeof parsed.weight === 'string' ? parsed.weight : '',
      allergies: Array.isArray(parsed.allergies) ? parsed.allergies.filter((x: unknown) => typeof x === 'string') : [],
      dietaryPreferences: Array.isArray(parsed.dietaryPreferences)
        ? parsed.dietaryPreferences.filter((x: unknown) => typeof x === 'string')
        : [],
    };
  } catch {
    return null;
  }
}

export function OnboardingProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<OnboardingData>(initialState);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    readStored().then((stored) => {
      if (!active) return;
      if (stored) setData(stored);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  const updateData = (v: Partial<OnboardingData>) => {
    setData((current) => {
      const next = { ...current, ...v };
      AsyncStorage.setItem(ONBOARDING_KEY, JSON.stringify(next)).catch(() => undefined);
      return next;
    });
  };

  const resetOnboarding = () => {
    setData(initialState);
    AsyncStorage.removeItem(ONBOARDING_KEY).catch(() => undefined);
  };

  return (
    <Context.Provider value={{ data, updateData, resetOnboarding, hydrated }}>
      {children}
    </Context.Provider>
  );
}

export function useOnboarding() {
  const value = useContext(Context);
  if (!value) throw new Error('useOnboarding must be used inside OnboardingProvider');
  return value;
}
