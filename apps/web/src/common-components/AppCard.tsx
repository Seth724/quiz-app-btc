import React, { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function AppCard({ children, className = '', onClick, hover = false }: CardProps) {
  const hoverStyles = hover ? 'hover:shadow-xl transition-shadow cursor-pointer' : ''
  
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 ${hoverStyles} ${className}`}
    >
      {children}
    </div>
  )
}
