"use client";

import { useEffect, useState } from "react";

export default function ImpactProgrammeCards({ initialProgrammes }) {
  const [programmes, setProgrammes] = useState(initialProgrammes || []);

  useEffect(() => {
    let active = true;
    fetch("/api/impact", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Impact data unavailable")))
      .then((data) => { if (active && Array.isArray(data.programmes) && data.programmes.length) setProgrammes(data.programmes); })
      .catch(() => {});
    return () => { active = false; };
  }, []);

  return (
    <div className="impact-programme-grid">
      {programmes.map((programme) => (
        <article className="impact-programme-card" key={programme.programme_key || programme.number}>
          <div className="impact-programme-topline">
            <span className="impact-programme-number">{programme.number}</span>
            <span className="impact-programme-category">{programme.category}</span>
          </div>
          <h3>{programme.title}</h3>
          <p className="impact-programme-description">{programme.description}</p>
          <div className="impact-metrics">
            {(programme.metrics || []).map((metric) => (
              <div className="impact-metric" key={metric.key || metric.label}>
                <strong>{metric.value === null || metric.value === undefined || metric.value === "" ? "—" : Number(metric.value).toLocaleString()}</strong>
                <span>{metric.label}</span>
              </div>
            ))}
          </div>
        </article>
      ))}
    </div>
  );
}
