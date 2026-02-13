import { useRef, useCallback } from "react";
import { useKioskKeyboard } from "@/contexts/KioskKeyboardContext";

type KbMode = "numeric" | "alpha" | "full";

export function useKioskInput(
  setter: (val: string) => void,
  currentValue: string,
  mode: KbMode = "numeric",
  onEnter?: () => void
) {
  const { attachInput } = useKioskKeyboard();
  const ref = useRef<HTMLInputElement | HTMLTextAreaElement>(null);

  const onFocus = useCallback(() => {
    attachInput(ref.current, setter, currentValue, mode, onEnter);
  }, [attachInput, setter, currentValue, mode, onEnter]);

  return { ref, onFocus };
}
