export default function Textarea(
  { label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>
) {
  return (
    <label className="cb-field">
      <span className="cb-field-label">{label}</span>
      <textarea className="cb-field-input cb-textarea" {...props} />
    </label>
  );
}
