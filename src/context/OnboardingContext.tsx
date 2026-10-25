import React, { createContext, ReactNode, useContext, useState } from 'react';
export type OnboardingData = { goal:string; age:string; sex:string; height:string; weight:string; allergies:string[]; dietaryPreferences:string[] };
const initialState: OnboardingData = { goal:'', age:'', sex:'', height:'', weight:'', allergies:[], dietaryPreferences:[] };
const Context = createContext<{data:OnboardingData; updateData:(v:Partial<OnboardingData>)=>void; resetOnboarding:()=>void} | undefined>(undefined);
export function OnboardingProvider({children}:{children:ReactNode}) { const [data,setData]=useState(initialState); return <Context.Provider value={{data,updateData:(v)=>setData(d=>({...d,...v})),resetOnboarding:()=>setData(initialState)}}>{children}</Context.Provider>; }
export function useOnboarding(){ const value=useContext(Context); if(!value) throw new Error('useOnboarding must be used inside OnboardingProvider'); return value; }
