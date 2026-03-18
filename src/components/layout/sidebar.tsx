'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutGrid, Megaphone, Upload, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: '인플루언서', short: '인플', href: '/influencers', icon: Users },
  { title: '광고 보드', short: '보드', href: '/ads', icon: LayoutGrid },
  { title: '레퍼런스', short: '레퍼런스', href: '/ad-references', icon: Megaphone },
  { title: 'CSV 임포트', short: '임포트', href: '/import', icon: Upload },
];

const STORAGE_KEY = 'sidebar-collapsed';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(() => {
    if (typeof window === 'undefined') return true;
    return localStorage.getItem(STORAGE_KEY) !== 'false';
  });

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-border bg-white z-10 transition-all duration-200 ease-in-out shrink-0',
        collapsed ? 'w-[72px]' : 'w-[200px]'
      )}
    >
      {/* 로고 */}
      <div className={cn('flex h-14 items-center shrink-0', collapsed ? 'justify-center' : 'px-4 gap-2.5')}>
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm">
          <span className="text-sm font-bold">C</span>
        </div>
        {!collapsed && (
          <span className="text-sm font-semibold tracking-tight text-foreground whitespace-nowrap">커브 관리</span>
        )}
      </div>

      <div className="mx-3 border-t border-border/40" />

      {/* 네비게이션 */}
      <div className="flex-1 overflow-auto py-3 px-2">
        <nav className="grid gap-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            if (collapsed) {
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    'group flex flex-col items-center gap-1 rounded-lg px-1 py-2.5 transition-all duration-150',
                    isActive
                      ? 'bg-secondary text-foreground'
                      : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                  )}
                >
                  <Icon
                    className={cn(
                      'h-5 w-5 shrink-0 transition-colors',
                      isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                    )}
                  />
                  <span className="text-[10px] font-medium leading-none">{item.short}</span>
                </Link>
              );
            }

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'group flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm font-medium transition-all duration-150',
                  isActive
                    ? 'bg-secondary text-foreground'
                    : 'text-muted-foreground hover:bg-secondary/50 hover:text-foreground'
                )}
              >
                <Icon
                  className={cn(
                    'h-4 w-4 shrink-0 transition-colors',
                    isActive ? 'text-foreground' : 'text-muted-foreground group-hover:text-foreground'
                  )}
                />
                <span className="whitespace-nowrap">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 하단: 토글 */}
      <div className="mt-auto shrink-0 p-2 border-t border-border/40">
        <button
          type="button"
          onClick={toggle}
          className={cn(
            'flex w-full items-center rounded-lg py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors text-xs font-medium',
            collapsed ? 'justify-center' : 'gap-2 px-3'
          )}
        >
          {collapsed
            ? <ChevronsRight className="h-4 w-4" />
            : <><ChevronsLeft className="h-4 w-4" /><span>접기</span></>
          }
        </button>
      </div>
    </div>
  );
}
