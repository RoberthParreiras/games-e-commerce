import { ComponentPropsWithoutRef, forwardRef } from "react";

import { Button } from "@/app/components/ui/button";
import { cn } from "@/app/lib/utils";

interface CustomButtonProps
  extends Omit<ComponentPropsWithoutRef<typeof Button>, "variant"> {
  // Use a different name for your custom variants
  visual?: "primary" | "destructive";
}

const CustomButton = forwardRef<HTMLButtonElement, CustomButtonProps>(
  ({ className, visual = "primary", ...props }, ref) => {
    const variantStyles = {
      primary: "bg-[#DFD0B8] text-[#222831] hover:bg-[#cbb89d]",
      destructive: "bg-red-500 text-white hover:bg-red-600",
      // cancel: "bg-[#DFD0B8] text-[#222831] hover:bg-[#cbb89d]",
    };

    const baseStyles = "h-12 w-52 rounded hover:cursor-pointer";

    return (
      <Button
        variant={null}
        className={cn(baseStyles, variantStyles[visual], className)}
        ref={ref}
        {...props}
      />
    );
  },
);

CustomButton.displayName = "CustomButton";

export { CustomButton };
