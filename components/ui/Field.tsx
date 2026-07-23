export default function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="cb-field">
      <span className="cb-field-label">{label}</span>
      <input className="cb-field-input" {...props} />
    </label>
  );
}
