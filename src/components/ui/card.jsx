export function Card({ children, className = "" }) {
  return <div className={`card-base ${className}`}>{children}</div>
}

export function CardHeader({ children, className = "" }) {
  return <div className={`p-6 border-b border-border ${className}`}>{children}</div>
}

export function CardTitle({ children, className = "" }) {
  return <h3 className={`text-2xl font-bold text-foreground ${className}`}>{children}</h3>
}

export function CardDescription({ children, className = "" }) {
  return <p className={`text-muted-foreground text-sm mt-1 ${className}`}>{children}</p>
}

export function CardContent({ children, className = "" }) {
  return <div className={`p-6 ${className}`}>{children}</div>
}

export function CardFooter({ children, className = "" }) {
  return <div className={`p-6 border-t border-border flex gap-3 ${className}`}>{children}</div>
}

export default Card
