"use client";

import { useEffect, useState } from "react";
import { PlusIcon } from "lucide-react";

interface PrismFluxLoaderProps {
  size?: number;
  speed?: number;
  textSize?: number;
}

const STATUSES = [
  "Fetching",
  "Calculating",
  "Updating",
  "Placing",
  "Syncing",
  "Processing",
];

export function PrismFluxLoader({
  size = 30,
  speed = 5,
  textSize = 16,
}: PrismFluxLoaderProps) {
  const [time, setTime] = useState(0);
  const [statusIndex, setStatusIndex] = useState(0);
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(mediaQuery.matches);

    const onChange = () => setReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener("change", onChange);
    return () => mediaQuery.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;

    const interval = window.setInterval(() => {
      setTime((previous) => previous + 0.02 * speed);
    }, 16);

    return () => window.clearInterval(interval);
  }, [speed, reducedMotion]);

  useEffect(() => {
    const statusInterval = window.setInterval(() => {
      setStatusIndex((previous) => (previous + 1) % STATUSES.length);
    }, 600);

    return () => window.clearInterval(statusInterval);
  }, []);

  const half = size / 2;
  const currentStatus = STATUSES[statusIndex];

  const faceTransforms = [
    `rotateY(0deg) translateZ(${half}px)`,
    `rotateY(180deg) translateZ(${half}px)`,
    `rotateY(90deg) translateZ(${half}px)`,
    `rotateY(-90deg) translateZ(${half}px)`,
    `rotateX(90deg) translateZ(${half}px)`,
    `rotateX(-90deg) translateZ(${half}px)`,
  ];

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label={`${currentStatus}...`}
      className="flex min-h-55 flex-col items-center justify-center gap-4"
    >
      <div
        className="relative"
        style={{
          width: size,
          height: size,
          transformStyle: "preserve-3d",
          transform: reducedMotion
            ? undefined
            : `rotateY(${time * 30}deg) rotateX(${time * 30}deg)`,
        }}
      >
        {STATUSES.map((_, index) => (
          <div
            key={index}
            className="absolute flex items-center justify-center font-semibold text-primary"
            style={{
              width: size,
              height: size,
              fontSize: textSize,
              border: "1px solid hsl(var(--primary) / 0.75)",
              transform: faceTransforms[index],
              backfaceVisibility: "hidden",
            }}
          >
            <PlusIcon
              className="h-1/2 w-1/2"
              strokeWidth={1.5}
              aria-hidden="true"
            />
          </div>
        ))}
      </div>

      <p className="text-sm font-semibold tracking-wide text-foreground">
        {currentStatus}...
      </p>
    </div>
  );
}
