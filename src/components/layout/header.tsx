import Link from 'next/link';
import { HeartPulse, Stethoscope, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function Header() {
  return (
    <header className="bg-card shadow-sm sticky top-0 z-40">
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-foreground hidden sm:inline">Recovery Planner</span>
            </Link>
          </div>
          <div className="hidden md:flex items-center space-x-2">
            <Button variant="ghost" asChild>
              <Link href="/select-condition">
                <Stethoscope className="mr-2 h-4 w-4" />
                New Plan
              </Link>
            </Button>
            <Button variant="ghost" asChild>
              <Link href="/progress">
                <BarChart3 className="mr-2 h-4 w-4" />
                My Progress
              </Link>
            </Button>
          </div>
          <div className="md:hidden">
            <div className="flex items-center space-x-1">
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/select-condition" aria-label="New Plan">
                        <Stethoscope />
                    </Link>
                </Button>
                <Button variant="ghost" size="icon" asChild>
                    <Link href="/progress" aria-label="My Progress">
                        <BarChart3 />
                    </Link>
                </Button>
            </div>
          </div>
        </div>
      </nav>
    </header>
  );
}
