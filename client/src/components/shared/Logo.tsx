import Link from 'next/link';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  showText?: boolean;
}

export function Logo({ className, showText = true }: LogoProps) {
  return (
    <Link href="/" className={cn('flex items-center gap-2 group', className)}>
      <div className="relative w-9 h-9 flex items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="text-primary-foreground"
        >
          <path
            d="M12 3L3 10.5H6V20H10V14H14V20H18V10.5H21L12 3Z"
            fill="currentColor"
            fillOpacity="0.2"
          />
          <path
            d="M12 3L3 10.5H6V20H10V14H14V20H18V10.5H21L12 3Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle
            cx="17.5"
            cy="7.5"
            r="2.5"
            fill="currentColor"
          />
          <path
            d="M17.5 10V13"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          <path
            d="M16 12.5L17.5 14L19 12.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {showText && (
        <span className="font-display font-extrabold text-xl tracking-tight text-foreground">
          Loc<span className="text-primary">Easy</span>
        </span>
      )}
    </Link>
  );
}
