"use client";
import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { projectToSvg } from "@/lib/geo";

// Branded journey map: stylized dot-grid world in the site's ink/paper palette with
// GSAP-drawn great-arc journeys. Not geographic tiles — that's OrderLeafletMap's job.

export type Journey = {
  from: { lat: number; lng: number; label: string };
  to: { lat: number; lng: number; label: string };
  active?: boolean; // active journeys get the animated plane + amber arc
};

const W = 1000;
const H = 460;
// Rough landmass boxes for the dot-grid continents (equirect, lat/lng bounds).
// Intentionally impressionistic — it reads as "world", stays on-brand.
const LAND: Array<[number, number, number, number]> = [
  // [latMin, latMax, lngMin, lngMax]
  [28, 70, -165, -55],   // North America
  [8, 28, -115, -62],    // Central America
  [-55, 10, -80, -35],   // South America
  [36, 70, -10, 40],     // Europe
  [-34, 34, -17, 50],    // Africa
  [8, 70, 40, 179],      // Asia
  [-43, -12, 112, 154],  // Australia
];

function isLand(lat: number, lng: number): boolean {
  return LAND.some(([a, b, c, d]) => lat >= a && lat <= b && lng >= c && lng <= d);
}

// Pre-compute the dot grid once (module scope, deterministic).
const DOTS: Array<{ x: number; y: number }> = [];
for (let lat = -55; lat <= 70; lat += 3.2) {
  for (let lng = -170; lng <= 180; lng += 3.2) {
    if (isLand(lat, lng)) DOTS.push(projectToSvg(lat, lng, W, H));
  }
}

function arcPath(from: { lat: number; lng: number }, to: { lat: number; lng: number }): string {
  const a = projectToSvg(from.lat, from.lng, W, H);
  const b = projectToSvg(to.lat, to.lng, W, H);
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2 - Math.min(120, Math.abs(b.x - a.x) * 0.22 + 24); // lift by distance
  return `M ${a.x.toFixed(1)} ${a.y.toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
}

export default function WorldMapSvg({ journeys, title }: { journeys: Journey[]; title?: string }) {
  const rootRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const ctx = gsap.context(() => {
      const arcs = root.querySelectorAll<SVGPathElement>(".cbmap-arc");
      arcs.forEach((arc, i) => {
        const len = arc.getTotalLength();
        gsap.set(arc, { strokeDasharray: len, strokeDashoffset: len });
        gsap.to(arc, { strokeDashoffset: 0, duration: 1.4, delay: 0.25 + i * 0.25, ease: "power2.out" });
      });
      root.querySelectorAll<SVGGElement>(".cbmap-plane").forEach((plane, i) => {
        const arc = arcs[Number(plane.dataset.arc ?? i)];
        if (!arc) return;
        const len = arc.getTotalLength();
        // ride the arc forever, gently
        const state = { t: 0 };
        gsap.to(state, {
          t: 1, duration: 7, delay: 1.6, repeat: -1, ease: "none",
          onUpdate: () => {
            const p = arc.getPointAtLength(state.t * len);
            const p2 = arc.getPointAtLength(Math.min(len, state.t * len + 2));
            const angle = (Math.atan2(p2.y - p.y, p2.x - p.x) * 180) / Math.PI;
            plane.setAttribute("transform", `translate(${p.x},${p.y}) rotate(${angle})`);
          },
        });
      });
      gsap.fromTo(root.querySelectorAll(".cbmap-dotpulse"),
        { scale: 1, transformOrigin: "center", opacity: 0.9 },
        { scale: 2.4, opacity: 0, duration: 1.8, repeat: -1, ease: "power1.out", stagger: 0.4 });
    }, root);
    return () => ctx.revert();
  }, [journeys]);

  return (
    <div className="cb-worldmap">
      {title && <div className="cb-worldmap-title">{title}</div>}
      <svg ref={rootRef} viewBox={`0 0 ${W} ${H}`} role="img" aria-label="Journey map" className="cb-worldmap-svg">
        {/* dot-grid continents */}
        <g fill="rgba(253,252,252,0.22)">
          {DOTS.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={1.6} />)}
        </g>
        {/* journeys */}
        {journeys.map((j, i) => {
          const a = projectToSvg(j.from.lat, j.from.lng, W, H);
          const b = projectToSvg(j.to.lat, j.to.lng, W, H);
          return (
            <g key={i}>
              <path className="cbmap-arc" d={arcPath(j.from, j.to)} fill="none"
                stroke={j.active ? "#F9A600" : "rgba(253,252,252,0.45)"}
                strokeWidth={j.active ? 2.4 : 1.6} strokeLinecap="round" />
              <circle cx={a.x} cy={a.y} r={4} fill="#FDFCFC" />
              <circle className="cbmap-dotpulse" cx={b.x} cy={b.y} r={4} fill={j.active ? "#F9A600" : "#FDFCFC"} />
              <circle cx={b.x} cy={b.y} r={4} fill={j.active ? "#F9A600" : "#FDFCFC"} />
              <text x={a.x + 8} y={a.y - 8} className="cbmap-label">{j.from.label}</text>
              <text x={b.x + 8} y={b.y - 8} className="cbmap-label">{j.to.label}</text>
              {j.active && (
                <g className="cbmap-plane" data-arc={i}>
                  <path d="M0 0 L-9 3.5 L-7 0 L-9 -3.5 Z" fill="#F9A600" />
                </g>
              )}
            </g>
          );
        })}
      </svg>
    </div>
  );
}
