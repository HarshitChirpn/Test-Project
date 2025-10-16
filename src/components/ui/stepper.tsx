import * as React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";

interface StepperProps {
  steps: string[];
  currentStep: number;
  className?: string;
}

const Stepper = React.forwardRef<HTMLDivElement, StepperProps>(
  ({ steps, currentStep, className }, ref) => {
    return (
      <div ref={ref} className={cn("w-full", className)}>
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const stepNumber = index + 1;
            const isActive = stepNumber === currentStep;
            const isCompleted = stepNumber < currentStep;
            const isLast = index === steps.length - 1;

            return (
              <React.Fragment key={step}>
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                      {
                        "border-yellow-400 bg-yellow-400 text-white": isActive,
                        "border-green-500 bg-green-500 text-white": isCompleted,
                        "border-slate-300 bg-white text-slate-400": !isActive && !isCompleted,
                      }
                    )}
                  >
                    {isCompleted ? (
                      <CheckCircle className="h-5 w-5" />
                    ) : (
                      <span className="text-sm font-semibold">{stepNumber}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p
                      className={cn("text-sm font-medium", {
                        "text-yellow-600": isActive,
                        "text-green-600": isCompleted,
                        "text-slate-500": !isActive && !isCompleted,
                      })}
                    >
                      {step}
                    </p>
                  </div>
                </div>
                {!isLast && (
                  <div
                    className={cn("flex-1 border-t-2 mx-4", {
                      "border-green-500": isCompleted,
                      "border-yellow-400": isActive && index === currentStep - 2,
                      "border-slate-300": !isCompleted && !(isActive && index === currentStep - 2),
                    })}
                  />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>
    );
  }
);

Stepper.displayName = "Stepper";

export { Stepper };