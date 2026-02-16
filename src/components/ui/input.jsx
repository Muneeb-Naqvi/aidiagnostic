export function Input({ className = "", ...props }) {
  return <input className={`input-base ${className}`} {...props} />
}

export default Input
