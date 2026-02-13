import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from "react";
import VirtualKeyboard from "@/components/VirtualKeyboard";

interface KioskKeyboardContextType {
  attachInput: (
    ref: HTMLInputElement | HTMLTextAreaElement | null,
    setter: (val: string) => void,
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
      inputMode: "numeric" | "alpha" | "full" = "numeric",
      onEnter?: () => void
    ) => {
      inputRef.current = ref;
      setterRef.current = setter;
      valueRef.current = ref?.value ?? "";
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
    if (setterRef.current && inputRef.current) {
      const el = inputRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const newVal = el.value.slice(0, start) + key + el.value.slice(end);
      valueRef.current = newVal;
      setterRef.current(newVal);
      // Restore cursor position after React re-render
      requestAnimationFrame(() => {
        el.setSelectionRange(start + key.length, start + key.length);
        el.focus();
      });
    }
  }, []);

  const handleBackspace = useCallback(() => {
    if (setterRef.current && inputRef.current) {
      const el = inputRef.current;
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      let newVal: string;
      if (start !== end) {
        newVal = el.value.slice(0, start) + el.value.slice(end);
      } else if (start > 0) {
        newVal = el.value.slice(0, start - 1) + el.value.slice(start);
      } else {
        return;
      }
      valueRef.current = newVal;
      setterRef.current(newVal);
      const newPos = start !== end ? start : Math.max(0, start - 1);
      requestAnimationFrame(() => {
        el.setSelectionRange(newPos, newPos);
        el.focus();
      });
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
