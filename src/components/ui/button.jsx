export function Button({ children, className = "", variant = "primary", ...props }) {
  const variants = {
    primary: "btn-primary",
    secondary: "btn-secondary",
    outline: "btn-outline",
    ghost: "px-6 py-2.5 hover:bg-muted/50 rounded-lg transition-colors font-medium",
    danger:
      "px-6 py-2.5 bg-destructive text-destructive-foreground font-medium rounded-lg hover:opacity-90 transition-opacity",
  }

  return (
    <button className={`${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export default Button
