interface HeaderProps {
  title?: string;
}

export function Header({ title }: HeaderProps) {
  return (
    <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-border bg-background px-6">
      <div className="flex items-center gap-4">
        <h1 className="text-sm font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      <div className="flex items-center gap-4">
        {/* Placeholder for future actions like search, notifications, etc. */}
      </div>
    </header>
  );
}
