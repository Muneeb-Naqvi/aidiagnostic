export function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export default CardContent
