import * as React from "react"
import { cn } from "@/lib/utils"

interface Option {
    value: string
    label: string
}

interface FormToggleGroupProps {
    value: string
    onValueChange: (value: string) => void
    options: Option[] | string[]
    className?: string
}

export function FormToggleGroup({
    value,
    onValueChange,
    options,
    className,
}: FormToggleGroupProps) {
    // Normalize options to object format
    const normalizedOptions = options.map((opt) =>
        typeof opt === "string" ? { value: opt, label: opt } : opt
    )

    return (
        <div className={cn("flex flex-wrap gap-3 w-full", className)} role="group">
            {normalizedOptions.map((option) => {
                const isSelected = value === option.value
                return (
                    <button
                        key={option.value}
                        type="button"
                        onClick={() => onValueChange(option.value)}
                        className={cn(
                            "min-h-12 h-auto px-6 py-3 text-base rounded-full font-medium",
                            "border-2 transition-all duration-200",
                            "whitespace-normal break-words",
                            "focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black",
                            isSelected
                                ? "bg-black text-white border-black"
                                : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400"
                        )}
                        aria-pressed={isSelected}
                    >
                        {option.label}
                    </button>
                )
            })}
        </div>
    )
}
