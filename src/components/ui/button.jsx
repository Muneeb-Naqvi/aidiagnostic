export function Button({ 
  children, 
  className = "", 
  variant = "primary",
  borderText = "",
  ...props 
}) {
  const variants = {
    primary: "btn-primary inline-flex items-center justify-center",
    secondary: "btn-secondary inline-flex items-center justify-center",
    outline: "btn-outline inline-flex items-center justify-center",
    ghost: "px-6 py-2.5 hover:bg-muted/50 rounded-lg transition-colors font-medium inline-flex items-center justify-center",
    danger: "px-6 py-2.5 bg-destructive text-destructive-foreground font-medium rounded-lg hover:opacity-90 transition-opacity inline-flex items-center justify-center",
    borderedPrimary: "btn-bordered-primary inline-flex items-center justify-center",
    borderedSecondary: "btn-bordered-secondary inline-flex items-center justify-center",
    borderedOutline: "btn-with-border-text inline-flex items-center justify-center",
    borderedSmall: "btn-sm-bordered inline-flex items-center justify-center",
  }

  const buttonContent = borderText ? (
    <>
      <span className={`${variant === 'borderedPrimary' ? 'btn-bordered-primary-label' : 
                        variant === 'borderedSecondary' ? 'btn-bordered-secondary-label' : 
                        variant === 'borderedSmall' ? 'btn-sm-bordered-label' : 
                        'btn-with-border-text-label'}`}>
        {borderText}
      </span>
      {children}
    </>
  ) : children

  return (
    <button className={`${variants[variant]} ${className}`.replace(/\s+/g, ' ').trim()} {...props}>
      {buttonContent}
    </button>
  )
}

export default Button
