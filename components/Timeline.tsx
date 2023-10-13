import React from "react";
import * as RadixSlider from "@radix-ui/react-slider";

interface SlideProps {
  value?: number;
  max: number;
  onChange?: (value: number) => void; 
}

const Timeline: React.FC<SlideProps> = ({ value = 1, onChange, max }) => {
  const handleChange = (newValue: number) => {
    onChange?.(newValue);
  };

  return (
    <RadixSlider.Root
      className="
        flex 
        select-none 
        touch-none 
        cursor-pointer
      "
      defaultValue={[0]} // Pass the initial value as an array
      value={[value]} // Pass the value as an array
      onValueChange={(values) => handleChange(values[0])} // Extract the first value from the array
      step={0.1}
      max={max}
      aria-label="Timeline"
    >
      <RadixSlider.Track
        className="
          bg-neutral-600 
          relative 
          grow 
          rounded-full 
          h-[3px]
          w-[300px]
          lg:w-[400px]
          xl:w-[500px]
        "
      >
        <RadixSlider.Range
          className="
            absolute 
            bg-white 
            rounded-full 
            h-full
          "
        />
      </RadixSlider.Track>
    </RadixSlider.Root>
  );
};

export default Timeline;
