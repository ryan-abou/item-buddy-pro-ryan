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
    valueRef.current = "";
  }, []);

  // Read current value from the actual input element to stay in sync with physical keyboard typing
  const getCurrentValue = useCallback(() => {
    if (inputRef.current) {
      return inputRef.current.value;
    }
    return valueRef.current;
  }, []);

  const handleKeyPress = useCallback((key: string) => {
    if (setterRef.current) {
      const current = getCurrentValue();
      const newVal = current + key;
      valueRef.current = newVal;
      setterRef.current(newVal);
    }
  }, [getCurrentValue]);

  const handleBackspace = useCallback(() => {
    if (setterRef.current) {
      const current = getCurrentValue();
      if (current.length > 0) {
        const newVal = current.slice(0, -1);
        valueRef.current = newVal;
        setterRef.current(newVal);
      }
    }
  }, [getCurrentValue]);

  const handleEnter = useCallback(() => {
    if (onEnterRef.current) {
      onEnterRef.current();
    } else {
      detachInput();
    }
  }, [detachInput]);

  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
  }, []);

  return (
    <KioskKeyboardContext.Provider value={{ attachInput, detachInput, isKeyboardVisible: visible }}>
      {children}
      <VirtualKeyboard
        visible={visible}
        mode={mode}
        onKeyPress={handleKeyPress}
        onBackspace={handleBackspace}
        onEnter={handleEnter}
        onPointerDown={handlePointerDown}
      />
    </KioskKeyboardContext.Provider>
  );
}

export function useKioskKeyboard() {
  const ctx = useContext(KioskKeyboardContext);
  if (!ctx) throw new Error("useKioskKeyboard must be used within KioskKeyboardProvider");
  return ctx;
}
