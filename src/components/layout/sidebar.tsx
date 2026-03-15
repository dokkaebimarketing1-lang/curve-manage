'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutGrid, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  {
    title: '인플루언서',
    href: '/influencers',
    icon: Users,
  },
  {
    title: '광고 보드',
    href: '/ads',
    icon: LayoutGrid,
  },
  {
    title: 'CSV 임포트',
    href: '/import',
    icon: Upload,
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-full w-[260px] flex-col border-r border-border bg-white z-10">
      <div className="flex h-16 items-center px-6">
        <div className="flex items-center gap-2.5 font-semibold text-base tracking-tight text-foreground">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <span className="text-xs font-bold">C</span>
          </div>
          커브 관리
        </div>
      </div>
      
      <div className="flex-1 overflow-auto py-4 px-3">
        <nav className="grid gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <Icon 
                  className={cn(
                    "h-4 w-4 transition-colors",
                    isActive ? "text-foreground" : "text-muted-foreground group-hover:text-foreground"
                  )} 
                />
                {item.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto p-3 border-t border-border/50">
        <div className="px-3 py-2 flex items-center gap-3">
          <div className="h-8 w-8 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-xs font-medium text-foreground">
            A
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-medium text-foreground leading-none mb-1">Admin User</span>
            <span className="text-xs text-muted-foreground leading-none">admin@curve.com</span>
          </div>
        </div>
      </div>
    </div>
  );
}
