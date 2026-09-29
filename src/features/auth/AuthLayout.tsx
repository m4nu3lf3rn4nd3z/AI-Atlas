import { Link } from 'react-router'
import { Logo } from '@/app/Logo'

interface Props {
  children: React.ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: Props) {
  return (
    <div className="auth-shell">
      <div className="auth-card">
        <Link to="/" className="auth-logo">
          <Logo />
        </Link>
        <div className="auth-header">
          <h1 className="auth-title">{title}</h1>
          {subtitle && <p className="auth-subtitle">{subtitle}</p>}
        </div>
        {children}
      </div>
    </div>
  )
}
