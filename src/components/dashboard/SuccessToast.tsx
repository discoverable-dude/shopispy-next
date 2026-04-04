"use client";

import { CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SuccessToastProps {
  title: string;
  description?: string;
}

export const showSuccessToast = (toast: ReturnType<typeof useToast>['toast'], props: SuccessToastProps) => {
  toast({
    title: (
      <div className="flex items-center gap-2">
        <CheckCircle className="h-4 w-4 text-green-600" />
        <span>{props.title}</span>
      </div>
    ) as any,
    description: props.description,
    className: "border-green-600/20 bg-green-50 dark:bg-green-950",
  });
};
