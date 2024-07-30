import * as React from "react";
import * as SliderPrimitive from "@radix-ui/react-slider";
import { cn } from "~/lib/utils";
import { useState, useRef, useEffect } from "react";

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => {
  const [value, setValue] = useState(50); // initial value
  const valueRef = useRef<HTMLDivElement>(null);

  const handleValueChange = (newValue) => {
    setValue(newValue[0]);
    console.log("Slider value changed:", newValue[0]);
  };

  useEffect(() => {
    if (valueRef.current) {
      const thumbWidth = 12; // Width of the thumb
      const trackWidth = valueRef.current.parentElement.clientWidth;
      const newLeft = (value / 100) * (trackWidth - thumbWidth);
      valueRef.current.style.left = `${newLeft}px`;
    }
  }, [value]);

  return (
    <div className="relative w-full">
      <SliderPrimitive.Root
        ref={ref}
        className={cn(
          "relative flex w-full touch-none select-none items-center",
          className
        )}
        value={[value]}
        onValueChange={handleValueChange}
        {...props}
      >
        <SliderPrimitive.Track className="relative h-[6px] w-full grow overflow-hidden rounded-full bg-secondary">
          <SliderPrimitive.Range className="absolute h-full bg-blue-700" />
        </SliderPrimitive.Track>
        <SliderPrimitive.Thumb className="block h-3 w-3 rounded-full border border-blue-700 bg-background ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50" />
      </SliderPrimitive.Root>
      <div
        ref={valueRef}
        className="absolute top-0 transform -translate-y-6"
        style={{ left: `calc(${value}% - 10px)` }}
      >
        {value}%
      </div>
    </div>
  );
});

Slider.displayName = SliderPrimitive.Root.displayName;

export { Slider };
