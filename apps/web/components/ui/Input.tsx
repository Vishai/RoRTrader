import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const inputVariants = cva(
  'flex w-full rounded-xl px-4 py-3 text-base transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-text-tertiary focus:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-background-primary border border-border-default focus:border-accent-primary focus:shadow-[0_0_0_3px_rgba(0,212,255,0.1)]',
        glass: 'glass focus:bg-white/10',
        filled: 'bg-background-secondary border border-transparent focus:border-accent-primary',
      },
      inputSize: {
        sm: 'h-9 px-3 py-1 text-sm',
        md: 'h-11',
        lg: 'h-13 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      inputSize: 'md',
    },
  }
)

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    VariantProps<typeof inputVariants> {
  error?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, variant, inputSize, error, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          inputVariants({ variant, inputSize }),
          error && 'border-accent-danger focus:border-accent-danger focus:shadow-[0_0_0_3px_rgba(255,51,102,0.1)]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = 'Input'

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement>,
    VariantProps<typeof inputVariants> {
  error?: boolean
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, variant, inputSize, error, ...props }, ref) => {
    return (
      <textarea
        className={cn(
          inputVariants({ variant, inputSize }),
          'min-h-[80px] resize-y',
          error && 'border-accent-danger focus:border-accent-danger focus:shadow-[0_0_0_3px_rgba(255,51,102,0.1)]',
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Textarea.displayName = 'Textarea'

export { Input, Textarea, inputVariants }
