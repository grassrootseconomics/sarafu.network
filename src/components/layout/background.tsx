"use client";
import { useId } from "react";
export function Background({ animate = true }: { animate?: boolean }) {
  const filterId = useId();
  return (
    <div className="absolute top-0 left-0 w-[100vw] min-h-[100vh] h-[100%] overflow-hidden -z-10">
      <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <filter id={filterId}>
            <feGaussianBlur
              in="SourceGraphic"
              stdDeviation="10"
              result="blur"
            />
            <feColorMatrix
              in="blur"
              mode="matrix"
              values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7"
              result="goo"
            />
            <feComposite in="SourceGraphic" in2="goo" operator="atop" />
          </filter>
        </defs>
        <g filter={`url(#${filterId})`}>
          {[
            { cx: "10%", cy: "10%", r: "20vw", fill: "#eef8f3", dur: "40s" },
            { cx: "20%", cy: "50%", r: "100", fill: "#f8f6ee", dur: "50s" },
            { cx: "50%", cy: "40%", r: "40", fill: "#f8eef1", dur: "60s" },
            { cx: "80%", cy: "80%", r: "400", fill: "#eef3f8", dur: "70s" },
          ].map((circle, index) => (
            <circle
              key={index}
              cx={circle.cx}
              cy={circle.cy}
              r={circle.r}
              fill={circle.fill}
            >
              {animate && (
                <animateMotion
                  dur={circle.dur}
                  repeatCount="indefinite"
                  path="M0 0 Q50 -50 100 0 T 200 100 T 0 200 T -100 100 T 0 0"
                />
              )}
            </circle>
          ))}
        </g>
      </svg>
    </div>
  );
}
