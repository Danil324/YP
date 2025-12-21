import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '../../../utils/cn'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined'
  glow?: boolean
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', glow = false, children, ...props }, ref) => {
    const variants = {
      default: 'bg-white dark:bg-gray-800',
      elevated: 'bg-white dark:bg-gray-800 shadow-lg',
      outlined: 'border border-gray-200 dark:border-gray-700 bg-transparent',
    }

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-xl p-6 transition-all duration-300',
          variants[variant],
          glow && 'ring-1 ring-primary-500/20 shadow-primary-500/10',
          'hover:shadow-xl hover:scale-[1.01]',
          className
        )}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

export default Card

