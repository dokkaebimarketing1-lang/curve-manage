CREATE TABLE custom_tabs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  value TEXT NOT NULL UNIQUE,
  label TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
