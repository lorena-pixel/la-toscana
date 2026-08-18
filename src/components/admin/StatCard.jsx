function StatCard({ label, value, helper }) {
  return (
    <article className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>

      {helper && (
        <p>{helper}</p>
      )}
    </article>
  );
}

export default StatCard;