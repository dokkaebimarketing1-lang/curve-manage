-- ============================================================
-- 광고/인플루언서 웹 관리 도구 — 초기 스키마
-- ============================================================

-- folders 테이블 (ad_cards FK 때문에 먼저 생성)
CREATE TABLE folders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  parent_id UUID REFERENCES folders(id) ON DELETE CASCADE,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- influencers 테이블
-- tab_category 허용 값:
--   'reference'       (참고)
--   'listup'          (리스트업) — 기본값
--   'mcn'             (mcn회사)
--   'must'            (무조건)
--   'past'            (과거)
--   'group_buy_brand' (공구 하는 브랜드)
--   'ad'              (광고)
CREATE TABLE influencers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  no SERIAL,
  nickname TEXT,
  profile_image_url TEXT,
  high_view_video_url TEXT,
  high_view_video_thumbnail TEXT,
  low_view_video_url TEXT,
  low_view_video_thumbnail TEXT,
  url TEXT,
  classification TEXT,
  collaboration_type TEXT,
  category TEXT,
  follower_count BIGINT,
  real_name TEXT,
  gender TEXT,
  contact TEXT,
  must_do BOOLEAN DEFAULT FALSE,
  selection_reason TEXT,
  notes TEXT,
  email TEXT,
  rate INTEGER,
  tab_category TEXT DEFAULT 'listup',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ad_cards 테이블
CREATE TABLE ad_cards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,
  url TEXT,
  thumbnail_url TEXT,
  title TEXT,
  one_line_review TEXT,
  reference_brand TEXT,
  source_handle TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- updated_at 자동 갱신 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- influencers updated_at 트리거
CREATE TRIGGER update_influencers_updated_at
  BEFORE UPDATE ON influencers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ad_cards updated_at 트리거
CREATE TRIGGER update_ad_cards_updated_at
  BEFORE UPDATE ON ad_cards
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
