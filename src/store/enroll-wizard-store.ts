import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

interface WizardState {
  step: number;
  semesterId: string;
  offeringId: string;
  setStep: (step: number) => void;
  setSemester: (semesterId: string) => void;
  setOffering: (offeringId: string) => void;
  reset: () => void;
}

const initial = { step: 0, semesterId: "", offeringId: "" };

/** Multi-step enrollment wizard progress, persisted so a refresh doesn't lose it. */
export const useEnrollWizard = create<WizardState>()(
  persist(
    (set) => ({
      ...initial,
      setStep: (step) => set({ step }),
      setSemester: (semesterId) => set({ semesterId, offeringId: "" }),
      setOffering: (offeringId) => set({ offeringId }),
      reset: () => set(initial),
    }),
    {
      name: "ums-enroll-wizard",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true, // rehydrated in an effect to avoid SSR hydration mismatches
    },
  ),
);
