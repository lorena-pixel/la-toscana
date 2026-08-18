import "../../styles/emptyState.css";

function EmptyState({
  icon = "✓",
  title,
  description,
  actionLabel,
  onAction,
}) {
  return (
    <div className="empty-state">
      <div className="empty-state__icon">
        {icon}
      </div>

      <h3>{title}</h3>

      {description && (
        <p>{description}</p>
      )}

      {actionLabel && onAction && (
        <button
          type="button"
          onClick={onAction}
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}

export default EmptyState;