export default function Select(
  { label, children, ...props }: { label: string; children: React.ReactNode } & React.SelectHTMLAttributes<HTMLSelectElement>
) {
  return (
    <label className="cb-field">
      <span className="cb-field-label">{label}</span>
      <select className="cb-field-input" {...props}>{children}</select>
    </label>
  );
}
