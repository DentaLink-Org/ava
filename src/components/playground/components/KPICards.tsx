/**
 * KPI Cards Component
 * Display key performance indicators with metrics
 */

import React from 'react';
import { KPICardsProps, KPIMetric } from '../types';

export const KPICards: React.FC<KPICardsProps> = ({
  metrics,
  theme,
  componentId,
  pageId
}) => {
  const renderKPICard = (metric: KPIMetric) => {
    return (
      <div key={metric.id} className="kpi-card">
        <h3 className="kpi-card-title">{metric.title}</h3>
        <p className="kpi-card-value">
          {typeof metric.value === 'number' && metric.value > 1000 
            ? metric.value.toLocaleString() 
            : metric.value}
          {metric.suffix}
        </p>
        <p className="kpi-card-description">{metric.description}</p>
        {metric.delta && (
          <div className={`kpi-card-delta ${metric.deltaType || 'neutral'}`}>
            {metric.delta}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="kpi-cards" data-component-id={componentId}>
      {metrics.map(renderKPICard)}
    </div>
  );
};