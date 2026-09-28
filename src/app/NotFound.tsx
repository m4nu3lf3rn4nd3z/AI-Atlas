import { Link } from 'react-router'
import { Button } from '@/components/ui/button'

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 p-8 text-center">
      <p className="font-mono text-xs uppercase tracking-widest text-subtle">404</p>
      <h1 className="text-xl font-semibold">Esta página no está en el mapa</h1>
      <Button asChild variant="outline">
        <Link to="/map">Ir al mapa</Link>
      </Button>
    </div>
  )
}
