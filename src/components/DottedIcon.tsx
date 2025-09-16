import React from "react";

interface DottedIconProps {
  size?: number; // px
  className?: string;
}

export default function DottedIcon({ size = 48, className }: DottedIconProps) {
  return (
    <div
      className={className}
      style={{
        width: size,
        height: size,
        borderRadius: 8,
        backgroundImage:
          "radial-gradient(circle, rgba(255,255,255,0.55) 1px, transparent 1.2px)",
        backgroundSize: "8px 8px",
        backgroundColor: "rgba(255,255,255,0.06)",
        boxShadow: "0 0 0 1px rgba(255,255,255,0.12) inset",
      }}
      aria-hidden
    />
  );
}
