"use client";

import { useEffect, useMemo, useState } from "react";

const metricValue = (programme, key) => {
  const metric = (programme?.metrics || []).find((item) => item.key === key);
  return metric?.value === null || metric?.value === undefined || metric?.value === ""
    ? null
    : Number(metric.value);
};

const formatValue = (value) => (value === null || value === undefined ? "—" : value.toLocaleString());

export default function ImpactProgrammeCards({ initialProgrammes }) {
  const [programmes, setProgrammes] = useState(initialProgrammes || []);

  useEffect(() => {
    let active = true;
    fetch("/api/impact", { cache: "no-store" })
      .then((response) => response.ok ? response.json() : Promise.reject(new Error("Impact data unavailable")))
      .then((data) => {
        if (active && Array.isArray(data.programmes) && data.programmes.length) {
          setProgrammes(data.programmes);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const overview = useMemo(() => {
    const sumMetric = (key) => {
      const values = programmes.map((programme) => metricValue(programme, key));
      if (!values.some((value) => value !== null)) return null;
      return values.reduce((total, value) => total + (value || 0), 0);
    };

    return {
      activities: sumMetric("activities"),
      male: sumMetric("male"),
      female: sumMetric("female"),
      documents: sumMetric("documents"),
    };
  }, [programmes]);

  return (
    <div className="impact-dashboard">
      <div className="impact-dashboard-heading">
        <div>
          <span className="impact-dashboard-kicker">IMPACT &amp; EVIDENCE</span>
          <h2>Impact at a glance</h2>
        </div>
        <span className="impact-dashboard-status"><i /> Live programme register</span>
      </div>

      <div className="impact-kpi-grid" aria-label="Impact overview">
        <div className="impact-kpi">
          <span className="impact-kpi-label">Activities conducted</span>
          <strong>{formatValue(overview.activities)}</strong>
          <small>Across tracked programmes</small>
        </div>
        <div className="impact-kpi">
          <span className="impact-kpi-label">Male reached</span>
          <strong>{formatValue(overview.male)}</strong>
          <small>Reported programme reach</small>
        </div>
        <div className="impact-kpi">
          <span className="impact-kpi-label">Female reached</span>
          <strong>{formatValue(overview.female)}</strong>
          <small>Reported programme reach</small>
        </div>
        <div className="impact-kpi impact-kpi-accent">
          <span className="impact-kpi-label">Policy documents</span>
          <strong>{formatValue(overview.documents)}</strong>
          <small>Contributions recorded</small>
        </div>
      </div>

      <div className="impact-section-heading">
        <div>
          <span>PROGRAMME PERFORMANCE</span>
          <h3>Where the work is happening</h3>
        </div>
        <span>{programmes.length} programmes tracked</span>
      </div>

      <div className="impact-programme-grid">
        {programmes.map((programme) => {
          const activities = metricValue(programme, "activities");
          const male = metricValue(programme, "male");
          const female = metricValue(programme, "female");
          const mainMetric = activities !== null
            ? { value: activities, label: "Activities conducted" }
            : metricValue(programme, "documents") !== null
              ? { value: metricValue(programme, "documents"), label: "Documents contributed" }
              : (programme.metrics || [])[0]
                ? { value: metricValue(programme, programme.metrics[0].key), label: programme.metrics[0].label }
                : { value: null, label: "Reported impact" };

          const genderTotal = (male || 0) + (female || 0);
          const maleShare = genderTotal > 0 ? (male || 0) / genderTotal * 100 : 0;

          return (
            <article className="impact-programme-card" key={programme.programme_key || programme.number}>
              <div className="impact-programme-topline">
                <span className="impact-programme-number">{programme.number}</span>
                <span className="impact-programme-category">{programme.category}</span>
              </div>

              <div className="impact-programme-title-row">
                <div>
                  <h3>{programme.title}</h3>
                  <p className="impact-programme-description">{programme.description}</p>
                </div>
              </div>

              <div className="impact-main-stat">
                <span>{mainMetric.label}</span>
                <strong>{formatValue(mainMetric.value)}</strong>
              </div>

              {male !== null || female !== null ? (
                <div className="impact-reach-chart">
                  <div className="impact-reach-head">
                    <span>Reach by gender</span>
                    <span>{formatValue(genderTotal)} total</span>
                  </div>
                  <div className="impact-reach-bar" aria-hidden="true">
                    <span style={{ width: `${maleShare}%` }} />
                  </div>
                  <div className="impact-reach-legend">
                    <span><i /> Male <b>{formatValue(male)}</b></span>
                    <span><i /> Female <b>{formatValue(female)}</b></span>
                  </div>
                </div>
              ) : null}

              <div className="impact-metrics">
                {(programme.metrics || []).map((metric) => (
                  <div className="impact-metric" key={metric.key || metric.label}>
                    <strong>{formatValue(metricValue(programme, metric.key))}</strong>
                    <span>{metric.label}</span>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
