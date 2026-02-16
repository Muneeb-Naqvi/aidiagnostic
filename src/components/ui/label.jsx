export function Label({ children, htmlFor, className = "" }) {
  return (
    <label htmlFor={htmlFor} className={`label-base ${className}`}>
      {children}
    </label>
  )
}

export default Label
