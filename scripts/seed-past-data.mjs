// ============================================================
// 과거 PPT 데이터 → Supabase 인플루언서 테이블 시드
// 실행: node scripts/seed-past-data.mjs
// ============================================================
import { readFileSync } from 'fs'
import { createClient } from '@supabase/supabase-js'

// .env.production.local에서 환경변수 로드
const envFile = readFileSync('.env.production.local', 'utf8')
const env = Object.fromEntries(
  envFile.split('\n')
    .filter(l => l && !l.startsWith('#') && l.includes('='))
    .map(l => {
      const idx = l.indexOf('=')
      const key = l.slice(0, idx)
      const val = l.slice(idx + 1).replace(/^"|"\s*$/g, '').replace(/\\n/g, '').trim()
      return [key, val]
    })
)

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
})

// ── 헬퍼 ──
const BASE = { tab_category: 'past', must_do: false }

const insta = (nickname, handle, opts = {}) => ({
  ...BASE, nickname,
  url: `https://www.instagram.com/${handle}/`,
  classification: 'instagram',
  ...opts,
})

const yt = (nickname, handle, opts = {}) => ({
  ...BASE, nickname,
  url: `https://www.youtube.com/@${handle}`,
  classification: 'youtube',
  ...opts,
})

const blog = (nickname, blogId, opts = {}) => ({
  ...BASE, nickname,
  url: `https://blog.naver.com/${blogId}`,
  classification: 'blog',
  ...opts,
})

const nameOnly = (nickname, opts = {}) => ({
  ...BASE, nickname, ...opts,
})

// ============================================================
// 섹션 1: 공구 인플루언서 (일반)
// ============================================================
const GROUP_BUY_REASON = '공구 인플루언서'
const section1 = [
  insta('나나맘', 'byhee_', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  insta('man_seon', 'man_seon', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', notes: '댓글 반응도 미침' }),
  nameOnly('다운작가', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', notes: '제로시피랑도 마켓 함' }),
  nameOnly('감자', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', classification: 'instagram', notes: '인스타툰' }),
  insta('jinunmi', 'jinunmi', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  insta('vovo_home_cook', 'vovo_home_cook', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', category: 'food' }),
  nameOnly('셀시어스', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  nameOnly('밥프로디테', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  nameOnly('호호뷰티', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', category: 'beauty' }),
  yt('yeboring', 'yeboring', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', notes: '5억 했다고 함' }),
  { ...BASE, nickname: 'glowuprizz', url: 'https://www.glowuprizz.com/', classification: 'etc', selection_reason: GROUP_BUY_REASON, notes: '꼭 보기' },
  yt('sinsayong', 'sinsayong', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  nameOnly('젼언니', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', notes: '제로시피랑 선에센스 공구 진행, 3일동안 2,000만원 넘게 나옴. 화력 좋음' }),
  nameOnly('아옳이', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  nameOnly('이나연', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  nameOnly('한아름송이', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  yt('철부지커플', 'chulbuji-couple', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', notes: '찐팬여부 확인 필요' }),
  yt('임부장', 'im_bujang', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
  insta('andar_ar_', 'andar_ar_', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', notes: '댓글 700개 달림', must_do: true }),
  yt('김선태', 'kimseontae', { real_name: '김선태', selection_reason: GROUP_BUY_REASON, notes: '충주시 공무원 퇴사 후 유튜브 개설, 2시간만에 19.5만' }),
  yt('haus_of_joo', 'haus_of_joo', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy' }),
]

// ============================================================
// 섹션 2: GM바이오 파트너스 광고 대상 약사
// ============================================================
const GM_REASON = 'GM바이오 파트너스 광고 대상 약사'
const section2 = [
  insta('여기약사', 'yeogi_yaksa', { gender: 'female', selection_reason: GM_REASON, collaboration_type: 'ad', notes: '이미지 쏘쏘' }),
  insta('김태희약사', 'tae_yaksa', { gender: 'female', selection_reason: GM_REASON, collaboration_type: 'ad', notes: '난임전문, 이미지 너무 좋음' }),
  insta('정세운약사', 'ggnnshop', { gender: 'male', selection_reason: GM_REASON, collaboration_type: 'ad', notes: '이미지 깔끔' }),
  insta('오희수', 'hi___sue', { gender: 'female', selection_reason: GM_REASON, collaboration_type: 'ad', notes: '약사 느낌보단 예쁜 인플 같은 느낌' }),
  insta('약사 손민수', 'sonyaksa_lab', { gender: 'male', selection_reason: GM_REASON, collaboration_type: 'ad', notes: '부드러워 보이는 이미지' }),
  insta('약사은니', 'yaksa_eunnie', { gender: 'female', selection_reason: GM_REASON, collaboration_type: 'ad', category: 'beauty', notes: '피부 분야, 이미지 너무 좋음' }),
  insta('약사동생', 'yourhsis', { gender: 'female', selection_reason: GM_REASON, collaboration_type: 'ad', notes: '호감상/이미지 깔끔함' }),
  insta('말티약사', 'malti_yaksa', { real_name: '김근형', gender: 'male', selection_reason: GM_REASON, collaboration_type: 'ad', notes: '이미지 깔끔' }),
  insta('써니약사', 'ssunny_yaksa', { gender: 'female', selection_reason: GM_REASON, collaboration_type: 'ad', category: 'parenting', notes: '엄마 약사' }),
  insta('마이약사', 'myyaksa', { real_name: '장세경', gender: 'female', selection_reason: GM_REASON, collaboration_type: 'ad', follower_count: 10000, notes: '1만정도, 이미지 깔끔/예쁨/똑부러져 보임' }),
  insta('dr_park_skin', 'dr_park_skin', { gender: 'male', selection_reason: GM_REASON, collaboration_type: 'ad', category: 'beauty', follower_count: 10000, notes: '1만 뷰티 남성' }),
  insta('서울대 오약사', 'jatv1004', { selection_reason: GM_REASON, collaboration_type: 'ad' }),
]

// ============================================================
// 섹션 3: 공구 희망 약사
// ============================================================
const YAKSA_REASON = '공구 희망 약사'
const section3 = [
  insta('약사 박지현', 'pink_yak_', { gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '여성 전문' }),
  insta('필터약사', 'yak.filter', { real_name: '신동호', gender: 'male', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '호르몬 관리, 이미지 좋음' }),
  insta('약사임당', 'iam_yaksa', { real_name: '이수찬', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '약상담 약사' }),
  insta('해피약사', 'happyyaksa', { real_name: '최지선', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '여성 호르몬 약사' }),
  insta('소금약사', 'salt.yaksa', { real_name: '정소민', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '이미지 좋음' }),
  insta('삐약약사', 'byak_yaksa', { real_name: '임나현', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', category: 'beauty', notes: '여성 피부 건강' }),
  insta('베이지약사', 'beige_yaksa', { real_name: '우수빈', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '공구 경험 많으실 듯' }),
  insta('스마일약사', 'smile_yaksa', { real_name: '서혜원', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '혈당 염증 대사 타겟' }),
  insta('꿀팁약사', 'ggultip_yaksa', { real_name: '하정봉', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '혈당 고지혈증' }),
  insta('하루약사', 'haru.yaksa', { real_name: '박지현', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '혈당 염증, 똑부러지는 여성 약사, 이미지 좋음' }),
  insta('샤인약사', 'shine_yaksa', { real_name: '김혜란', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '염증 관리 약사, 이미지 좋음' }),
  insta('쏙약사', 'ssok_yaksa', { gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '부드러운 이미지 좋음' }),
  insta('하유약사', 'hayu_pharmacist', { real_name: '이지영', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '총명한 이미지, 젊음' }),
  insta('뵤리약사', 'byori_yaksa', { real_name: '임별', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '깨끗/깔끔 이미지, 공구 경험 많으실 듯' }),
  insta('김약사TV', 'kimyaksa_tv', { real_name: '김미성', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '중년여성약사 중년 타겟' }),
  insta('도비약사', 'dobi_yaksa', { real_name: '정인지', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy' }),
  insta('다식약사', 'dasik.yaksa', { real_name: '박소윤', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '영양제 공부하는 컨셉 약사, 친근/공부 이미지 좋음' }),
  insta('띱약사', 'ddib_yaksa', { real_name: '조연서', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '여성 건강 관련, 이미지 쏘쏘' }),
  insta('아나약사', 'ana_yaksa', { real_name: '김진아', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '인플처럼 생긴 약사' }),
  insta('사나약사', 'sana_yaksa', { real_name: '여도현', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '부드러운 이미지 좋음, 공구 경험 많아 보이는 약사' }),
  insta('마미약사', 'mommy_yaksa', { real_name: '박소영', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', category: 'parenting', notes: '아이 성장 키즈 약사' }),
  insta('두잇약사', 'do_eat_yaksa', { real_name: '오세영', gender: 'female', selection_reason: YAKSA_REASON, collaboration_type: 'group_buy', notes: '대사 염증 클린식 약사, 깨끗한 이미지' }),
]

// ============================================================
// 섹션 4: 네이버 블로거
// ============================================================
const BLOG_REASON = '공구 블로거'
const blogIds = [
  'music_ssam109', 'jyunnyyy', 'ddu_ddu_o3o', 'danan147', 'mhj7784',
  'tnwlsno_', 'jj_living', 'deokyoung1310', 'encholove1209', '5004yurim',
  'jimini4155', 'kyoungddong_e', 'bluegray_bird', 'tj53389', 'dustn833',
  'wlsdl1868', 'j_jdaily', 'ghkdud1420', 'hee-318', 'mjmj--',
  'tani_daily', 'zeze_sayhi', 'askl486', 'jjayo-', 'omineng',
  'bbongkku', 'fromsol_', 'ranisister', 'arsoap', 'kamg2522',
  'irishcarbombb', 'nassyong2', 'shyeon8734', 'my_victoria', 'shin3mom',
  'smtm4', 'wjdgksthf147', 'beensdiary', 'seon2-', 'slki0905',
  'tldkwnstn12', 'xxyoni', 'pretty1059', 'jsm1016103', 'i_seo_room',
  'milk350ml', '7755star', 'g0sy_', 'bvely___', 'anstnqls0502',
  'choco__b_', 'mingsoonii', 'youl50', 'merrilycherry', 's2ekdus',
  'ysk0024', 'pej_0121', 'greenymom22', 'hamilworld', 'jj150505',
  'kongmida', 'hmiiini', 'aigirl84',
]

// 이름이 확인된 블로거
const namedBloggers = {
  'wtdwtd7': '땡스맘',
  'ymo3o3o': '리지언니',
}

const section4 = [
  // 이름 확인된 블로거
  ...Object.entries(namedBloggers).map(([id, name]) =>
    blog(name, id, { selection_reason: BLOG_REASON, collaboration_type: 'group_buy' })
  ),
  // 블로그 ID만 있는 블로거
  ...blogIds.map(id =>
    blog(id, id, { selection_reason: BLOG_REASON, collaboration_type: 'group_buy' })
  ),
]

// ============================================================
// 섹션 5: 비고/추가 인플루언서
// ============================================================
const MISC_REASON = '기타 인플루언서'
const section5 = [
  // 공구 실적 있는 인플루언서
  nameOnly('여단오', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'group_buy', notes: '에스트라 공구 4000만원 나옴' }),
  yt('후하후하', 'Huhwahuhwa', { selection_reason: GROUP_BUY_REASON, collaboration_type: 'ad', notes: '메디큐브 홈케어 광고. 레즈 커플. 영상 잘 만듦 (썰 + 광고 자연스러움). 채널 조회수/댓글양 괜찮음' }),

  // 블로그 인플루언서 (이름 있는)
  nameOnly('홍영기', { classification: 'blog', selection_reason: MISC_REASON, collaboration_type: 'group_buy', notes: '블로그. 공구 수없이 많음. 갓' }),
  nameOnly('드림약사', { classification: 'blog', selection_reason: MISC_REASON, notes: '블로그. 바이오던스 콜라겐팩, 건기식' }),
  nameOnly('시네', { selection_reason: MISC_REASON }),
  nameOnly('홀리', { selection_reason: MISC_REASON }),
  nameOnly('물결', { selection_reason: MISC_REASON }),
  nameOnly('그래쓰', { classification: 'blog', selection_reason: MISC_REASON, notes: '블로그. 샤르드, 몰바니' }),
  nameOnly('아랑', { classification: 'blog', selection_reason: MISC_REASON }),
  nameOnly('태리약사', { selection_reason: MISC_REASON }),

  // 인스타 인플루언서
  insta('room_psychologist', 'room_psychologist', { selection_reason: MISC_REASON }),
  insta('food_dduck_', 'food_dduck_', { selection_reason: MISC_REASON, category: 'food' }),
  insta('morinyeo', 'morinyeo', { selection_reason: MISC_REASON }),
  insta('k2s89', 'k2s89', { selection_reason: MISC_REASON }),
  insta('mom_ye.eun', 'mom_ye.eun', { selection_reason: MISC_REASON, category: 'parenting' }),
  insta('addungram', 'addungram', { selection_reason: MISC_REASON }),
  insta('인영', 'inyoung161', { selection_reason: MISC_REASON }),
  insta('1_6_9._9', '1_6_9._9', { selection_reason: MISC_REASON }),

  // 이름만 있는 인플루언서
  nameOnly('해달홈', { selection_reason: MISC_REASON }),
  nameOnly('설은미', { selection_reason: MISC_REASON }),
  nameOnly('쩡유', { classification: 'youtube', selection_reason: MISC_REASON }),
  nameOnly('제이나', { classification: 'youtube', selection_reason: MISC_REASON }),
  nameOnly('최모나', { selection_reason: MISC_REASON }),
  nameOnly('김채윤', { selection_reason: MISC_REASON }),
  nameOnly('나나', { selection_reason: MISC_REASON, notes: '가꾸기 브랜드' }),
  nameOnly('예소리', { selection_reason: MISC_REASON, notes: '가꾸기 브랜드' }),
  nameOnly('플로우윤', { selection_reason: MISC_REASON }),
  nameOnly('지안씨', { selection_reason: MISC_REASON, notes: '벤튼 브랜드' }),
  nameOnly('지냐', { classification: 'youtube', selection_reason: MISC_REASON }),
  nameOnly('라미띠에', { selection_reason: MISC_REASON }),
  nameOnly('가이안', { selection_reason: MISC_REASON }),
  nameOnly('hazi', { selection_reason: MISC_REASON }),
  nameOnly('윤미다', { selection_reason: MISC_REASON }),
  nameOnly('메종드마미', { selection_reason: MISC_REASON }),
  nameOnly('강경민', { selection_reason: MISC_REASON }),
  nameOnly('스키니피그', { selection_reason: MISC_REASON }),
  nameOnly('연유쌤', { selection_reason: MISC_REASON }),
  nameOnly('시드니', { selection_reason: MISC_REASON }),
  nameOnly('구효민', { classification: 'youtube', selection_reason: MISC_REASON }),
  nameOnly('영원', { selection_reason: MISC_REASON }),
  nameOnly('양가', { selection_reason: MISC_REASON }),
  nameOnly('에나스쿨', { selection_reason: MISC_REASON }),
  nameOnly('연구원 박씨', { selection_reason: MISC_REASON }),
  nameOnly('여진', { selection_reason: MISC_REASON }),
  nameOnly('밀리맘', { selection_reason: MISC_REASON }),
  nameOnly('해피린', { selection_reason: MISC_REASON }),
  nameOnly('흥하리', { selection_reason: MISC_REASON }),
  nameOnly('다다소라', { selection_reason: MISC_REASON }),
  nameOnly('달빛언니', { selection_reason: MISC_REASON }),
  nameOnly('루비마켓', { selection_reason: MISC_REASON }),
  nameOnly('마이클레어', { selection_reason: MISC_REASON }),
  nameOnly('박약다식', { selection_reason: MISC_REASON }),
  nameOnly('심톨', { selection_reason: MISC_REASON }),
  nameOnly('또다', { selection_reason: MISC_REASON }),
  nameOnly('서빈', { selection_reason: MISC_REASON }),
  nameOnly('가혜', { selection_reason: MISC_REASON }),
  nameOnly('쏘야쭝야', { selection_reason: MISC_REASON }),
  nameOnly('온우', { selection_reason: MISC_REASON }),
  nameOnly('유진', { selection_reason: MISC_REASON }),
  nameOnly('빵나', { selection_reason: MISC_REASON }),
]

// ============================================================
// 전체 데이터 합치기
// ============================================================
const allInfluencers = [
  ...section1,
  ...section2,
  ...section3,
  ...section4,
  ...section5,
]

// ============================================================
// 시드 실행
// ============================================================
async function seed() {
  console.log(`\n총 ${allInfluencers.length}건 인플루언서 데이터 삽입 시작...\n`)

  const BATCH_SIZE = 50
  let created = 0
  let errors = 0
  const errorDetails = []

  for (let i = 0; i < allInfluencers.length; i += BATCH_SIZE) {
    const batch = allInfluencers.slice(i, i + BATCH_SIZE)
    const { error } = await supabase.from('influencers').insert(batch)

    if (error) {
      // 배치 실패 시 개별 삽입
      for (const row of batch) {
        const { error: rowError } = await supabase.from('influencers').insert(row)
        if (rowError) {
          errorDetails.push(`  ❌ ${row.nickname}: ${rowError.message}`)
          errors++
        } else {
          created++
        }
      }
    } else {
      created += batch.length
    }
    console.log(`  진행: ${Math.min(i + BATCH_SIZE, allInfluencers.length)}/${allInfluencers.length}`)
  }

  console.log(`\n✅ 완료! 생성: ${created}건, 실패: ${errors}건`)
  if (errorDetails.length > 0) {
    console.log('\n실패 상세:')
    for (const d of errorDetails) console.log(d)
  }
}

seed().catch(err => {
  console.error('시드 실패:', err)
  process.exit(1)
})
