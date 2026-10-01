export function Breadcrumb({ items }: { items: string[] }) {
  return (
    <nav className="breadcrumb" aria-label="현재 위치">
      {items.map((item, index) => (
        <span key={`${item}-${index}`} className={index === items.length - 1 ? "current" : undefined}>
          {index > 0 && <span className="breadcrumb-sep" aria-hidden="true">›</span>}
          {item}
        </span>
      ))}
    </nav>
  );
}
