'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Users, LayoutGrid, Megaphone, Upload, PanelLeftClose, PanelLeftOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { title: '인플루언서', href: '/influencers', icon: Users },
  { title: '광고 보드', href: '/ads', icon: LayoutGrid },
  { title: '광고 레퍼런스', href: '/ad-references', icon: Megaphone },
  { title: 'CSV 임포트', href: '/import', icon: Upload },
];

const STORAGE_KEY = 'sidebar-collapsed';

export function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  // localStorage에서 상태 복원
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'true') setCollapsed(true);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !collapsed;
    setCollapsed(next);
    localStorage.setItem(STORAGE_KEY, String(next));
  };

  return (
    <div
      className={cn(
        'flex h-full flex-col border-r border-border bg-white z-10 transition-all duration-200 ease-in-out shrink-0',
        collapsed ? 'w-[60px]' : 'w-[220px]'
      )}
      style={{ opacity: mounted ? 1 : 0 }}
    >
      {/* 로고 + 토글 */}
      <div className="flex h-14 items-center justify-between px-3">
        <div className={cn('flex items-center gap-2 overflow-hidden', collapsed && 'justify-center w-full')}>
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
            <span className="text-xs font-bold">C</span>
          </div>
          {!collapsed && (
            <span className="text-sm font-semibold tracking-tight text-foreground whitespace-nowrap">커브 관리</span>
          )}
        </div>
        {!collapsed && (
          <button
            type="button"
            onClick={toggle}
            className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="사이드바 접기"
          >
            <PanelLeftClose className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* 네비게이션 */}
      <div className="flex-1 overflow-auto py-3 px-2">
        <nav className="grid gap-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname.startsWith(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                title={collapsed ? item.title : undefined}
                className={cn(
                  'group flex items-center rounded-md text-sm font-medium transition-all duration-150',
                  collapsed ? 'justify-center px-0 py-2.5' : 'gap-2.5 px-2.5 py-2',
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
                {!collapsed && (
                  <span className="whitespace-nowrap overflow-hidden">{item.title}</span>
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* 하단 — 접힌 상태: 펼치기 버튼 / 펼친 상태: 유저 정보 */}
      <div className="mt-auto p-2 border-t border-border/50">
        {collapsed ? (
          <button
            type="button"
            onClick={toggle}
            className="flex w-full items-center justify-center rounded-md py-2 text-muted-foreground hover:bg-secondary hover:text-foreground transition-colors"
            title="사이드바 펼치기"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>
        ) : (
          <div className="px-2 py-1.5 flex items-center gap-2.5">
            <div className="h-7 w-7 shrink-0 rounded-full bg-secondary border border-border/50 flex items-center justify-center text-xs font-medium text-foreground">
              A
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-medium text-foreground leading-none mb-0.5 truncate">Admin</span>
              <span className="text-[10px] text-muted-foreground leading-none truncate">admin@curve.com</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
