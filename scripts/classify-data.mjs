// ============================================================
// 인플루언서 데이터 분류 정리 스크립트
// null인 classification/category/gender/collaboration_type 채우기
// ============================================================
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

function loadEnv(path) {
  try {
    return Object.fromEntries(
      readFileSync(path, 'utf8').split('\n')
        .filter(l => l && !l.startsWith('#') && l.includes('='))
        .map(l => {
          const idx = l.indexOf('=')
          return [l.slice(0, idx), l.slice(idx + 1).replace(/^"|"\s*$/g, '').replace(/\\n/g, '').trim()]
        })
    )
  } catch { return {} }
}

const prodEnv = loadEnv('.env.production.local')
const supabase = createClient(prodEnv.NEXT_PUBLIC_SUPABASE_URL, prodEnv.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── 분류 규칙 ──

function inferClassification(row) {
  if (row.classification) return null // 이미 있음
  const url = row.url || ''
  if (url.includes('instagram.com')) return 'instagram'
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube'
  if (url.includes('blog.naver.com')) return 'blog'
  if (url.includes('tiktok.com')) return 'tiktok'
  // URL 없는 경우 notes/nickname에서 추론
  const text = `${row.nickname || ''} ${row.notes || ''} ${row.selection_reason || ''}`.toLowerCase()
  if (text.includes('유튜브') || text.includes('youtube')) return 'youtube'
  if (text.includes('인스타') || text.includes('instagram')) return 'instagram'
  if (text.includes('블로그') || text.includes('blog')) return 'blog'
  if (text.includes('틱톡') || text.includes('tiktok')) return 'tiktok'
  return null
}

function inferGender(row) {
  if (row.gender) return null
  const text = `${row.notes || ''} ${row.selection_reason || ''}`
  // notes에서 명확한 성별 단서
  if (/여성|엄마\s*약사|여성\s*약사|여성\s*전문|여성\s*호르몬|중년여성|아이\s*성장\s*키즈/i.test(text)) return 'female'
  if (/남성|남성\s*호르몬/i.test(text)) return 'male'
  // 실명에서 추론 (한국 이름 패턴)
  const name = row.real_name || ''
  if (!name) return null
  // 일반적인 여성 이름 끝자: 연, 현, 선, 은, 지, 희, 영, 미, 윤, 별, 서, 아, 란, 빈, 민
  // 일반적인 남성 이름 끝자: 호, 형, 찬, 봉, 태, 동
  const lastChar = name.slice(-1)
  const femaleChars = '연현선은지희영미윤별서아란빈민경소영성혜'
  const maleChars = '호형찬봉태동준혁'
  if (femaleChars.includes(lastChar)) return 'female'
  if (maleChars.includes(lastChar)) return 'male'
  return null
}

function inferCategory(row) {
  if (row.category) return null
  const text = `${row.nickname || ''} ${row.notes || ''} ${row.selection_reason || ''}`.toLowerCase()
  if (/뷰티|피부|화장|스킨|beauty|skin|메디큐브|콜라겐/i.test(text)) return 'beauty'
  if (/음식|요리|cook|food|레시피|먹방|클린식/i.test(text)) return 'food'
  if (/육아|엄마|아이|키즈|성장|parenting|mommy|맘/i.test(text)) return 'parenting'
  if (/운동|헬스|fitness|다이어트/i.test(text)) return 'fitness'
  if (/패션|fashion|옷/i.test(text)) return 'fashion'
  if (/여행|travel/i.test(text)) return 'travel'
  // 약사 관련 → lifestyle
  if (/약사|영양제|건기식|혈당|염증|대사|호르몬|난임/i.test(text)) return 'lifestyle'
  // 공구/인플루언서 일반 → lifestyle
  if (/공구|인플루언서|마켓/i.test(text)) return 'lifestyle'
  return null
}

function inferCollaborationType(row) {
  if (row.collaboration_type) return null
  const text = `${row.selection_reason || ''} ${row.notes || ''}`.toLowerCase()
  if (/공구/i.test(text)) return 'group_buy'
  if (/광고|ad\b/i.test(text)) return 'ad'
  if (/협찬/i.test(text)) return 'sponsorship'
  if (/ppl/i.test(text)) return 'ppl'
  if (/씨딩/i.test(text)) return 'seeding'
  // GM바이오 약사 → ad
  if (/gm바이오|파트너스/i.test(text)) return 'ad'
  return null
}

// ── 메인 ──
async function classify() {
  const { data: rows, error } = await supabase
    .from('influencers')
    .select('id,nickname,real_name,url,classification,category,gender,collaboration_type,selection_reason,notes')
    .order('no', { ascending: true })

  if (error) { console.error('DB 조회 실패:', error.message); return }

  console.log(`\n📋 ${rows.length}건 데이터 분류 시작...\n`)

  let updated = 0, skipped = 0

  for (const row of rows) {
    const patch = {}
    const cls = inferClassification(row)
    if (cls) patch.classification = cls
    const gen = inferGender(row)
    if (gen) patch.gender = gen
    const cat = inferCategory(row)
    if (cat) patch.category = cat
    const col = inferCollaborationType(row)
    if (col) patch.collaboration_type = col

    if (Object.keys(patch).length === 0) {
      skipped++
      continue
    }

    const { error: updateError } = await supabase
      .from('influencers')
      .update(patch)
      .eq('id', row.id)

    if (updateError) {
      console.log(`  ❌ ${row.nickname}: ${updateError.message}`)
    } else {
      const fields = Object.entries(patch).map(([k, v]) => `${k}=${v}`).join(', ')
      console.log(`  ✅ ${row.nickname}: ${fields}`)
      updated++
    }
  }

  console.log(`\n📊 완료! 업데이트: ${updated}건, 스킵(이미 완료): ${skipped}건`)
}

classify().catch(err => { console.error(err); process.exit(1) })
