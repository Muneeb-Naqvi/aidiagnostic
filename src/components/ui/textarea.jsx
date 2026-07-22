export function Textarea({ className = "", ...props }) {
  return <textarea className={`input-base ${className}`} {...props} />
}

export default Textarea