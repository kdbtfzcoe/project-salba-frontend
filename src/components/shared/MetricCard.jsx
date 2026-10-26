import '../../css/components/MetricCard.css';

// A reusable card for the dashboard.
//   label    → small uppercase title
//   variant  → 'default' (white) | 'status' (colored gradient) | 'dark'
//   icon     → optional element shown on the right
//   ...rest  → any extra attribute, e.g. data-status or data-rate, goes onto the card
export default function MetricCard({ label, variant = 'default', icon = null, children, ...rest }) {
  return (
    <div className={`metric-card metric-card--${variant}`} {...rest}>
      <div className="metric-card__row">
        <div>
          <span className="metric-card__label">{label}</span>
          {children}
        </div>
        {icon}
      </div>
    </div>
  );
}