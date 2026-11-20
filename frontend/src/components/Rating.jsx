export default function Rating({ value }) {
  if (value == null) return <span className="muted">No ratings</span>;
  return (
    <span className="rating">
      <span className="star">★</span> {value}
    </span>
  );
}