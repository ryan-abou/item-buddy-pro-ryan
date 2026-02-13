import React, { createContext, useContext, useState, useCallback, useRef } from "react";
import VirtualKeyboard from "@/components/VirtualKeyboard";

interface KioskKeyboardContextType {
  attachInput: (
    ref: HTMLInputElement | HTMLTextAreaElement | null,
    setter: (val: string) => void,
    currentValue: string,
    mode?: "numeric" | "alpha" | "full",
    onEnter?: () => void
  ) => void;
  detachInput: () => void;
  isKeyboardVisible: boolean;
}

const KioskKeyboardContext = createContext<KioskKeyboardContextType | undefined>(undefined);

export function KioskKeyboardProvider({ children }: { children: React.ReactNode }) {
  const [visible, setVisible] = useState(false);
  const [mode, setMode] = useState<"numeric" | "alpha" | "full">("numeric");
  const setterRef = useRef<((val: string) => void) | null>(null);
  const valueRef = useRef("");
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const onEnterRef = useRef<(() => void) | null>(null);

  const attachInput = useCallback(
    (
      ref: HTMLInputElement | HTMLTextAreaElement | null,
      setter: (val: string) => void,
      currentValue: string,
      inputMode: "numeric" | "alpha" | "full" = "numeric",
      onEnter?: () => void
    ) => {
      inputRef.current = ref;
      setterRef.current = setter;
      valueRef.current = currentValue;
      onEnterRef.current = onEnter ?? null;
      setMode(inputMode);
      setVisible(true);
    },
    []
  );

  const detachInput = useCallback(() => {
    setVisible(false);
    inputRef.current = null;
    setterRef.current = null;
    onEnterRef.current = null;
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (setterRef.current) {
      const newVal = valueRef.current + key;
      valueRef.current = newVal;
      setterRef.current(newVal);
    }
  }, []);

  const handleBackspace = useCallback(() => {
    if (setterRef.current) {
      const cur = valueRef.current;
      if (cur.length > 0) {
        const newVal = cur.slice(0, -1);
        valueRef.current = newVal;
        setterRef.current(newVal);
      }
    }
  }, []);

  const handleEnter = useCallback(() => {
    if (onEnterRef.current) {
      onEnterRef.current();
    } else {
      detachInput();
    }
  }, [detachInput]);

  return (
    <KioskKeyboardContext.Provider value={{ attachInput, detachInput, isKeyboardVisible: visible }}>
      {children}
      <VirtualKeyboard
        visible={visible}
        mode={mode}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onEnter={handleEnter}
      />
    </KioskKeyboardContext.Provider>
  );
}

export function useKioskKeyboard() {
  const ctx = useContext(KioskKeyboardContext);
  if (!ctx) throw new Error("useKioskKeyboard must be used within KioskKeyboardProvider");
  return ctx;
}
