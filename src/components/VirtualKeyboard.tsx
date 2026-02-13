import { useState, useCallback, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Delete, CornerDownLeft, Space } from "lucide-react";

interface VirtualKeyboardProps {
  onKeyPress: (key: string) => void;
  onBackspace: () => void;
  onEnter: () => void;
  visible: boolean;
  mode?: "numeric" | "alpha" | "full";
  onPointerDown?: (e: React.PointerEvent) => void;
}

const numericKeys = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["", "0", ""],
];

const alphaKeysLower = [
  ["q", "w", "e", "r", "t", "y", "u", "i", "o", "p"],
  ["a", "s", "d", "f", "g", "h", "j", "k", "l"],
  ["z", "x", "c", "v", "b", "n", "m"],
];

export default function VirtualKeyboard({
  onKeyPress,
  onBackspace,
  onEnter,
  visible,
  mode = "numeric",
  onPointerDown,
}: VirtualKeyboardProps) {
  const [shifted, setShifted] = useState(false);
  const [currentMode, setCurrentMode] = useState<"numeric" | "alpha">(
    mode === "full" ? "alpha" : mode
  );

  useEffect(() => {
    setCurrentMode(mode === "full" ? "alpha" : mode);
  }, [mode]);

  const handleKey = useCallback(
    (key: string) => {
      if (key === "") return;
      onKeyPress(shifted ? key.toUpperCase() : key);
      if (shifted) setShifted(false);
    },
    [onKeyPress, shifted]
  );

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-muted/95 backdrop-blur-sm border-t border-border p-2 pb-4 animate-fade-in" onPointerDown={onPointerDown}>
      {currentMode === "numeric" ? (
        <div className="mx-auto max-w-xs space-y-2">
          {numericKeys.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-2">
              {row.map((key, ki) =>
                key === "" ? (
                  <div key={ki} className="w-16 h-14" />
                ) : (
                  <Button
                    key={ki}
                    variant="outline"
                    className="w-16 h-14 text-xl font-bold touch-target"
                    onClick={() => handleKey(key)}
                  >
                    {key}
                  </Button>
                )
              )}
            </div>
          ))}
          <div className="flex justify-center gap-2">
            <Button
              variant="outline"
              className="h-14 flex-1 text-lg touch-target"
              onClick={onBackspace}
            >
              <Delete className="h-5 w-5" />
            </Button>
            {mode === "full" && (
              <Button
                variant="outline"
                className="h-14 px-4 text-sm touch-target"
                onClick={() => setCurrentMode("alpha")}
              >
                ABC
              </Button>
            )}
            <Button
              className="h-14 flex-1 text-lg font-semibold touch-target"
              onClick={onEnter}
            >
              <CornerDownLeft className="h-5 w-5 mr-1" />
              Enter
            </Button>
          </div>
        </div>
      ) : (
        <div className="mx-auto max-w-lg space-y-1.5">
          {alphaKeysLower.map((row, ri) => (
            <div key={ri} className="flex justify-center gap-1">
              {ri === 2 && (
                <Button
                  variant={shifted ? "default" : "outline"}
                  className="h-12 w-12 text-sm touch-target"
                  onClick={() => setShifted(!shifted)}
                >
                  ⇧
                </Button>
              )}
              {row.map((key, ki) => (
                <Button
                  key={ki}
                  variant="outline"
                  className="h-12 w-[9%] min-w-[32px] text-base font-medium touch-target"
                  onClick={() => handleKey(key)}
                >
                  {shifted ? key.toUpperCase() : key}
                </Button>
              ))}
              {ri === 2 && (
                <Button
                  variant="outline"
                  className="h-12 w-12 touch-target"
                  onClick={onBackspace}
                >
                  <Delete className="h-4 w-4" />
                </Button>
              )}
            </div>
          ))}
          <div className="flex justify-center gap-1.5">
            {mode === "full" && (
              <Button
                variant="outline"
                className="h-12 px-4 text-sm touch-target"
                onClick={() => setCurrentMode("numeric")}
              >
                123
              </Button>
            )}
            <Button
              variant="outline"
              className="h-12 text-sm touch-target"
              onClick={() => handleKey("-")}
            >
              -
            </Button>
            <Button
              variant="outline"
              className="h-12 text-sm touch-target"
              onClick={() => handleKey("'")}
            >
              '
            </Button>
            <Button
              variant="outline"
              className="h-12 flex-1 touch-target"
              onClick={() => handleKey(" ")}
            >
              <Space className="h-4 w-4" />
            </Button>
            <Button
              className="h-12 px-6 text-sm font-semibold touch-target"
              onClick={onEnter}
            >
              Done
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
