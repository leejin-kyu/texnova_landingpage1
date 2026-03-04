import React, { useState, useEffect, useRef, useCallback } from 'react'
import './LandingPage.css'

const APP_URL = 'http://texnova.co.kr/'

/* ─── Types ─── */
interface Feature { icon: string; title: string; desc: string; tag?: string; wide: boolean }
interface Step { num: string; title: string; desc: string }
interface UseCaseData { title: string; desc: string; items: string[] }
interface PricingPlan { name: string; price: string; period: string; desc: string; cta: string; popular?: boolean; features: string[] }
interface Testimonial { text: string; name: string; role: string; initial: string }
interface ChatMsg { role: 'user' | 'ai'; text: string }

/* ─── Data ─── */
const PAIN_POINTS = [
  { icon: '📊', title: '데이터는 충분하지만 분석이 어렵다', desc: '연구 질문에 맞는 빅데이터 분석을 하고 싶지만, 어디서부터 시작해야 할지 막막합니다. 코딩을 배우자니 시간이 없고, 외주를 맡기자니 비용이 부담됩니다.' },
  { icon: '💻', title: 'Python, R 등 코딩 기반 분석의 진입장벽', desc: '코딩 기반 분석 도구는 강력하지만 배우는 데 오랜 시간이 걸립니다. 연구자에게 필요한 건 코딩 실력이 아니라, 연구 질문에 대한 답입니다.' },
  { icon: '🧩', title: '전처리 및 분석 환경 구축의 부담', desc: 'Python, R, 형태소 분석기, 시각화 도구를 따로 설치하고 연결해야 합니다. 전처리부터 시각화까지 하나로 연결된 환경이 필요합니다.' },
  { icon: '🤔', title: '분석 결과 해석의 어려움', desc: 'LDA 토픽 결과, 네트워크 그래프가 나와도 이걸 어떻게 해석하고 논문이나 보고서에 써야 할지 막막합니다. 분석 결과를 설명해줄 사람이 필요합니다.' },
]

const FEATURES: Feature[] = [
  { icon: '🔤', title: '형태소 분석 & 전처리', desc: 'Kiwi 엔진 기반 형태소 분석으로 텍스트를 정제합니다. 불용어 제거, 품사 필터링, 사용자 사전 등록까지 클릭 몇 번이면 끝.', wide: false },
  { icon: '🔍', title: 'TF-IDF · N-gram · 빈도 분석', desc: '핵심 키워드를 자동으로 추출하고, 단어 빈도와 중요도를 한눈에 파악합니다. 코딩 없이 클릭만으로 실행됩니다.', wide: true },
  { icon: '📊', title: 'LDA 토픽 모델링', desc: '텍스트에 숨겨진 주제를 자동으로 발견합니다. 토픽별 키워드, 문서 분포, 최적 토픽 수까지 AI가 분석해드립니다.', wide: false },
  { icon: '🕸️', title: '네트워크 분석 & CONCOR', desc: '단어 간 연결 구조를 시각화하고, CONCOR 클러스터링으로 의미 그룹을 자동 분류합니다.', wide: false },
  { icon: '😊', title: 'AI 감성 분석', desc: '텍스트의 긍정·부정·중립 감성을 AI가 판별합니다. 리뷰, 설문 응답 등 대량 텍스트의 감성 흐름을 파악하세요.', wide: false },
  { icon: '🧠', title: 'AI 해석 & 보고서 작성 지원', desc: '토픽 모델링 결과 요약, 데이터 패턴 설명, 보고서·논문 작성용 정리까지. AI(LLM)가 분석 결과를 해석하고 활용 가능한 형태로 정리해드립니다.', tag: 'AI', wide: true },
]

const STEPS: Step[] = [
  { num: '01', title: '텍스트 업로드', desc: 'Excel, CSV, TXT 파일을 드래그 앤 드롭하세요. 논문, 인터뷰, 설문, 리뷰 등 어떤 텍스트든 가능합니다.' },
  { num: '02', title: '분석 실행', desc: 'TF-IDF, LDA, 네트워크 분석 등 원하는 분석을 선택하세요. 코딩 없이 클릭만으로 실행됩니다.' },
  { num: '03', title: 'AI에게 해석 요청', desc: '분석 결과가 나오면 AI에게 물어보세요. 어려운 결과도 AI가 쉽게 풀어서 설명해드립니다.' },
]

const USE_CASES: Record<'researcher' | 'institution' | 'enterprise', UseCaseData> = {
  researcher: { title: '연구 및 학술', desc: '인문사회과학 연구자, 대학원생을 위한 텍스트 분석', items: ['논문·인터뷰·설문 텍스트를 체계적으로 분석', 'LDA, 네트워크 분석 결과를 AI가 해석까지', '코딩 없이 연구 질문에 맞는 분석 수행', '워드클라우드, 네트워크 그래프 등 논문용 시각화 내보내기', '인터뷰·설문 데이터의 질적 분석 지원'] },
  institution: { title: '공공 및 정책', desc: '공공기관, 정책 데이터, 정부 연구기관을 위한 분석', items: ['정책 데이터·민원 텍스트 분석으로 인사이트 도출', '기관별 데이터 특성에 맞춘 맞춤형 분석 환경', '데이터 보안 및 전용 서버 운영', '내부 시스템 연동 및 보안 요구사항 충족', '도입 상담 및 온보딩 교육 제공'] },
  enterprise: { title: '기업 및 산업', desc: '고객 리뷰, 설문, 마케팅 데이터를 전략으로 전환', items: ['고객 리뷰·VOC·설문 데이터 감성 분석', '브랜드 관련 키워드·토픽 자동 추출', '마케팅 데이터 기반 전략 수립 지원', '맞춤형 분석 파이프라인 구성 가능', '기업 전용 환경 및 API 연동 지원'] },
}

const PRICING: PricingPlan[] = [
  { name: 'Free', price: '₩0', period: '/월', desc: '무료로 시작하세요', cta: '무료로 시작하기', features: ['월 5개 프로젝트', '프로젝트당 1,000건', '형태소·빈도 분석', '워드클라우드', '기본 불용어 사전', 'CSV/Excel 업로드'] },
  { name: 'Pro', price: '₩20,000', period: '/월', desc: '본격적인 연구를 위한 플랜', cta: '14일 무료 체험', popular: true, features: ['무제한 프로젝트', '프로젝트당 50,000건', 'LDA 토픽 모델링', '네트워크·CONCOR 분석', 'AI 감성 분석', 'AI 해석 어시스턴트 (월 100회)', '분석 템플릿 전체', '이메일 우선 지원'] },
  { name: '맞춤형', price: '별도 협의', period: '', desc: '연구기관·기업 전용', cta: '도입 상담 신청', features: ['Pro의 모든 기능', '무제한 텍스트 처리', 'AI 해석 무제한', '전용 서버·데이터 격리', '원하는 분석 Flow 맞춤 구성', 'SSO & 팀 관리', '전담 매니저·SLA', '온보딩 교육 제공'] },
]

const TESTIMONIALS: Testimonial[] = [
  { text: '논문에 쓸 텍스트 분석을 혼자 해야 했는데, 텍스노바 덕분에 코딩 없이 LDA 결과까지 얻었습니다. AI가 결과 해석까지 해주니 논문 쓰는 시간이 확 줄었어요.', name: '이수진', role: '사회학과 박사과정', initial: '이' },
  { text: '연구실에서 인터뷰 데이터 분석에 매번 고생했는데, 업로드하고 클릭 몇 번이면 끝나니까 정말 편합니다. 특히 AI한테 "이 결과 해석해줘"라고 물어볼 수 있는 게 혁신적이에요.', name: '김도현', role: '교육학과 석사과정', initial: '김' },
  { text: '고객 리뷰 분석을 외주 맡기다가 텍스노바를 알게 됐어요. 감성 분석이랑 키워드 추출을 직접 할 수 있으니 비용도 절약되고 속도도 빨라졌습니다.', name: '박현우', role: '스타트업 마케팅 담당', initial: '박' },
]

const CHAT_MSGS: ChatMsg[] = [
  { role: 'user', text: '이번 LDA 분석에서 나온 5개 토픽을 정리해줘.' },
  { role: 'ai', text: "분석 결과 5개 토픽이 도출되었습니다. Topic 1은 '교육 정책'(비중 24%), Topic 2는 '학습 환경'(18%), Topic 3은 '교사 역량'(22%), Topic 4는 '학부모 참여'(19%), Topic 5는 '디지털 교육'(17%)입니다. 특히 Topic 3의 비중이 높아 교사 관련 논의가 활발한 것으로 보입니다." },
  { role: 'user', text: '이 결과를 논문 결과 섹션에 쓸 수 있게 정리해줘.' },
  { role: 'ai', text: "LDA 토픽 모델링 결과, 수집된 텍스트 데이터에서 5개의 주요 토픽이 도출되었다. 가장 높은 비중을 차지한 토픽은 '교사 역량'(22%)으로, 교사의 전문성 개발과 역량 강화에 대한 담론이 활발하게 이루어지고 있음을 확인하였다. 이는 선행연구(김OO, 2023)의 결과와 일치하며..." },
]

/* ─── Custom Hooks ─── */
function useCountUp(target: number, duration: number, suffix: string) {
  const elRef = useRef<HTMLSpanElement | null>(null)
  const [display, setDisplay] = useState(`0${suffix}`)
  const hasAnimated = useRef(false)
  const observerRef = useRef<IntersectionObserver | null>(null)

  const ref = useCallback((node: HTMLSpanElement | null) => {
    if (observerRef.current) { observerRef.current.disconnect(); observerRef.current = null }
    elRef.current = node
    if (!node) return
    observerRef.current = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true
          const t0 = performance.now()
          const ease = (t: number) => 1 - Math.pow(1 - t, 3)
          const step = (now: number) => {
            const p = Math.min((now - t0) / duration, 1)
            setDisplay(`${Math.round(ease(p) * target).toLocaleString()}${suffix}`)
            if (p < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      })
    }, { threshold: 0.3 })
    observerRef.current.observe(node)
  }, [target, duration, suffix])

  return { ref, display }
}

/* ─── Component ─── */
const LandingPage: React.FC = () => {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'researcher' | 'institution' | 'enterprise'>('researcher')
  const [visibleMsgs, setVisibleMsgs] = useState<number[]>([])
  const [showContact, setShowContact] = useState(false)
  const chatRef = useRef<HTMLDivElement>(null)
  const chatAnimated = useRef(false)

  // not used for stats anymore but keep for potential future use
  useCountUp(0, 1, '')

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 50)
    window.addEventListener('scroll', fn, { passive: true })
    return () => window.removeEventListener('scroll', fn)
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) e.target.classList.add('visible') })
    }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' })
    document.querySelectorAll('.animate-on-scroll').forEach((el) => obs.observe(el))
    return () => obs.disconnect()
  }, [])

  useEffect(() => {
    const el = chatRef.current
    if (!el) return
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting && !chatAnimated.current) {
          chatAnimated.current = true
          CHAT_MSGS.forEach((_, i) => { setTimeout(() => setVisibleMsgs((prev) => [...prev, i]), i * 1000) })
        }
      })
    }, { threshold: 0.3 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  const scrollTo = useCallback((id: string) => {
    setMobileOpen(false)
    document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  const openApp = useCallback(() => { window.open(APP_URL, '_blank') }, [])
  const openContact = useCallback(() => { setShowContact(true) }, [])

  return (
    <div className="landing-page">
      <div className="landing-grain" />

      {/* ─── NAV ─── */}
      <nav className={`landing-nav ${scrolled ? 'scrolled' : ''}`}>
        <a className="landing-nav-logo" href="#" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
            <rect width="24" height="24" rx="6" fill="url(#lg)" />
            <path d="M7 8h10M7 12h7M7 16h10" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
            <defs><linearGradient id="lg" x1="0" y1="0" x2="24" y2="24"><stop stopColor="#a78bfa" /><stop offset="1" stopColor="#60a5fa" /></linearGradient></defs>
          </svg>
          TexNova
        </a>
        <ul className={`landing-nav-links ${mobileOpen ? 'open' : ''}`}>
          <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }}>기능</a></li>
          <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo('pricing') }}>요금제</a></li>
          <li><a href="#use-cases" onClick={(e) => { e.preventDefault(); scrollTo('use-cases') }}>활용사례</a></li>
          <li><a href="#custom-deployment" onClick={(e) => { e.preventDefault(); scrollTo('custom-deployment') }}>맞춤 도입</a></li>
        </ul>
        <div className="landing-nav-cta">
          <button onClick={() => window.open('http://texnova.co.kr/', '_blank')}>무료로 시작하기</button>
        </div>
        <button className="landing-nav-mobile-toggle" onClick={() => setMobileOpen(!mobileOpen)} aria-label="메뉴">
          <span /><span /><span />
        </button>
      </nav>

      {/* ─── HERO ─── */}
      <section className="landing-hero">
        <div className="landing-aurora" />
        <div className="landing-hero-glow" />
        <div className="landing-hero-content">
          <div className="landing-hero-badge">연구자를 위한 AI 텍스트 분석 솔루션</div>
          <h1>
            코딩 없이 빅데이터 분석하는<br />
            <span className="gradient-text">가장 쉬운 방법</span>
          </h1>
          <p>
            논문, 리뷰, SNS, 설문 데이터를 업로드하면 AI가 자동으로 분석하고 해석합니다.<br />
            TF-IDF, LDA, 네트워크 분석, 감성 분석부터 AI 기반 결과 해석까지 — 클릭만으로.
          </p>
          <div className="hero-buttons">
            <button className="landing-hero-primary-btn" onClick={openApp}>
              무료로 시작하기
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="landing-hero-secondary-btn" onClick={() => scrollTo('features')}>기능 살펴보기</button>
            <button className="landing-hero-secondary-btn" onClick={() => window.open('https://blog.naver.com/nova_solution', '_blank')} style={{ border: '1px solid rgba(167,139,250,0.3)' }}>분석 샘플 확인하기</button>
          </div>
          <div className="landing-hero-trust">
            <span>✓ 데모 버전 무료 제공</span>
            <span>✓ 신용카드 불필요</span>
            <span>✓ 공공기관·연구기관 맞춤 도입 가능</span>
          </div>
          {/* App Mockup */}
          <div className="landing-hero-visual">
            <div style={{ padding: '20px 24px' }}>
              <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#febc2e' }} />
                <div style={{ width: 12, height: 12, borderRadius: '50%', background: '#28c840' }} />
                <span style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginLeft: 12 }}>TexNova World</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 10 }}>워드클라우드</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, alignItems: 'center', justifyContent: 'center' }}>
                    {['교육', '정책', '연구', '분석', '학습', '교사', '데이터', '역량'].map((w, i) => (
                      <span key={i} style={{ color: `hsl(${250 + i * 15}, 70%, ${65 + (i % 3) * 10}%)`, fontSize: [18, 14, 22, 12, 16, 11, 20, 13][i], fontWeight: i < 3 ? 700 : 400 }}>{w}</span>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 10 }}>감성 분석</div>
                  <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 70, padding: '0 8px' }}>
                    {[62, 24, 14].map((h, i) => (
                      <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                        <div style={{ width: '100%', height: `${h}%`, minHeight: 6, borderRadius: 4, background: i === 0 ? 'linear-gradient(180deg,#a78bfa,#60a5fa)' : i === 1 ? 'rgba(255,255,255,0.12)' : 'rgba(255,100,100,0.3)' }} />
                        <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 9 }}>{['긍정', '중립', '부정'][i]}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 8, padding: 16, border: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, marginBottom: 10 }}>네트워크 그래프</div>
                  <svg viewBox="0 0 100 80" style={{ width: '100%', height: 70 }}>
                    {[[50,40,25,20],[50,40,75,20],[50,40,30,65],[50,40,70,65],[25,20,30,65],[75,20,70,65]].map(([x1,y1,x2,y2], i) => (
                      <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="rgba(167,139,250,0.25)" strokeWidth="0.8" />
                    ))}
                    {[[50,40,6,'#a78bfa'],[25,20,4,'#60a5fa'],[75,20,4,'#34d399'],[30,65,3.5,'#fbbf24'],[70,65,3.5,'#f472b6']].map(([cx,cy,r,fill], i) => (
                      <circle key={i} cx={cx as number} cy={cy as number} r={r as number} fill={fill as string} opacity="0.8" />
                    ))}
                  </svg>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── VALUE PROPOSITION ─── */}
      <section className="landing-social-proof">
        <div style={{ maxWidth: 800, margin: '0 auto', textAlign: 'center' }}>
          <p className="animate-on-scroll" style={{ fontSize: 'clamp(1rem, 1.5vw, 1.125rem)', lineHeight: 1.8, color: 'var(--text-secondary)' }}>
            텍스노바는 <strong style={{ color: 'var(--text-primary)' }}>TF-IDF, N-gram, LDA</strong> 같은 전통적 분석과{' '}
            <strong style={{ color: 'var(--text-primary)' }}>최신 AI 기반 분석</strong>을 도출하고,{' '}
            그 결과를 <strong style={{ color: 'var(--text-primary)' }}>AI(LLM)가 요약·해석·정리</strong>해드립니다.<br />
            <span style={{ color: 'var(--text-tertiary)', fontSize: '0.9em' }}>전통적 분석 + AI 해석. 사람은 질문만 하면 됩니다.</span>
          </p>
        </div>
      </section>

      {/* ─── PAIN POINTS ─── */}
      <section className="landing-pain-points">
        <div>
          <h2 className="animate-on-scroll">이런 고민, 하고 계신가요?</h2>
          <p className="section-desc animate-on-scroll">인문사회과학 분야 연구자분들이 가장 많이 하시는 말입니다.</p>
          <div className="landing-pain-grid">
            {PAIN_POINTS.map((p, i) => (
              <div key={i} className="landing-pain-card animate-on-scroll">
                <div className="icon">{p.icon}</div>
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FEATURES (Bento Grid) ─── */}
      <section className="landing-features" id="features">
        <div>
          <h2 className="animate-on-scroll">전통적 분석 + AI 해석, 한 곳에서</h2>
          <p className="section-desc animate-on-scroll">분석은 텍스노바가, 해석은 AI가. 사람은 질문만 하면 됩니다.</p>
          <div className="bento-grid">
            {FEATURES.map((f, i) => (
              <div key={i} className={`landing-feature-card landing-glow-card animate-on-scroll ${f.wide ? 'bento-item--wide' : ''}`}>
                <div className="icon">{f.icon}</div>
                <h3>
                  {f.title}
                  {f.tag && <span style={{ marginLeft: 8, fontSize: 11, padding: '2px 8px', borderRadius: 9999, background: 'rgba(167,139,250,0.15)', color: '#a78bfa', fontWeight: 600, verticalAlign: 'middle' }}>{f.tag}</span>}
                </h3>
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="landing-how-it-works" id="how-it-works">
        <div>
          <h2 className="animate-on-scroll">3단계면 충분합니다</h2>
          <p className="section-desc animate-on-scroll">복잡한 코딩이나 설정 없이, 바로 분석을 시작하세요.</p>
          <div className="landing-steps-container">
            {STEPS.map((s, i) => (
              <div key={i} className="landing-step animate-on-scroll">
                <h3>{s.title}</h3>
                <p>{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── AI SHOWCASE ─── */}
      <section className="landing-ai-showcase" id="ai-showcase">
        <div>
          <h2 className="animate-on-scroll">분석 결과, AI에게 물어보세요</h2>
          <p className="section-desc animate-on-scroll">
            어려운 분석 결과도 AI가 쉽게 풀어서 설명해드립니다. 논문·보고서 작성에 바로 활용할 수 있도록.
            <br />
            <a href="https://blog.naver.com/nova_solution" target="_blank" rel="noopener noreferrer" style={{ color: '#a78bfa', fontSize: 14, textDecoration: 'underline', textUnderlineOffset: 3 }}>블로그에서 실제 분석 샘플 확인하기 →</a>
          </p>
          <div className="landing-chat-mockup animate-on-scroll" ref={chatRef}>
            <div className="chat-header">
              <div className="dot" /><div className="dot" /><div className="dot" />
              <span style={{ marginLeft: 12, color: 'rgba(255,255,255,0.5)', fontSize: 13, fontWeight: 500 }}>TexNova AI 어시스턴트</span>
            </div>
            <div className="chat-body">
              {CHAT_MSGS.map((msg, i) => visibleMsgs.includes(i) && (
                <div key={i} className={`landing-chat-message ${msg.role === 'user' ? 'user' : ''}`}>
                  {msg.role === 'ai' && <div className="avatar">AI</div>}
                  <div className="bubble">{msg.text}</div>
                </div>
              ))}
              {visibleMsgs.length > 0 && visibleMsgs.length < CHAT_MSGS.length && (
                <div className="landing-chat-message">
                  <div className="avatar">AI</div>
                  <div className="bubble">
                    <div className="typing-dots"><span /><span /><span /></div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── USE CASES ─── */}
      <section className="landing-use-cases" id="use-cases">
        <div>
          <h2 className="animate-on-scroll">누구를 위한 서비스인가요?</h2>
          <p className="section-desc animate-on-scroll">연구·학술, 공공·정책, 기업·산업 — 각각의 필요에 맞게 제공합니다.</p>
          <div className="landing-tab-group animate-on-scroll">
            {(['researcher', 'institution', 'enterprise'] as const).map((key) => (
              <button key={key} className={`landing-tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>{USE_CASES[key].title}</button>
            ))}
          </div>
          <div className="landing-tab-content animate-on-scroll">
            <h3>{USE_CASES[activeTab].title}</h3>
            <p style={{ marginBottom: 24 }}>{USE_CASES[activeTab].desc}</p>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 14 }}>
              {USE_CASES[activeTab].items.map((item, i) => (
                <li key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 15, color: 'var(--text-secondary)' }}>
                  <span style={{ color: '#a78bfa', fontWeight: 600 }}>✓</span>
                  {item}
                </li>
              ))}
            </ul>
            {activeTab === 'researcher' ? (
              <button className="landing-hero-primary-btn" style={{ marginTop: 32, fontSize: 14, padding: '12px 28px' }} onClick={openApp}>무료로 시작하기 →</button>
            ) : (
              <button className="landing-hero-secondary-btn" style={{ marginTop: 32, fontSize: 14, padding: '12px 28px' }} onClick={openContact}>도입 상담 문의 →</button>
            )}
          </div>
        </div>
      </section>

      {/* ─── PRICING ─── */}
      <section className="landing-pricing" id="pricing">
        <div>
          <h2 className="animate-on-scroll">무료로 시작하세요</h2>
          <p className="section-desc animate-on-scroll">Free 플랜으로 부담 없이 시작하고, 필요할 때 업그레이드하세요.</p>
          <div className="landing-pricing-grid">
            {PRICING.map((plan, i) => (
              <div key={i} className={`landing-pricing-card animate-on-scroll ${plan.popular ? 'popular landing-animated-border' : ''}`}>
                {plan.popular && <div className="badge">추천</div>}
                <h3>{plan.name}</h3>
                <div className="price">
                  {plan.price}
                  {plan.period && <span>{plan.period}</span>}
                </div>
                <div className="price-desc">{plan.desc}</div>
                <ul>
                  {plan.features.map((f, j) => (
                    <li key={j}>{f}</li>
                  ))}
                </ul>
                <button className="pricing-cta" onClick={plan.name === '맞춤형' ? openContact : openApp}>{plan.cta}</button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CUSTOM DEPLOYMENT ─── */}
      <section className="landing-custom-deployment" id="custom-deployment">
        <div>
          <h2 className="animate-on-scroll">공공기관·연구기관 맞춤 도입</h2>
          <p className="section-desc animate-on-scroll">기관의 데이터 특성과 보안 요구사항에 맞춘 전용 환경을 제공합니다.</p>
          <div className="landing-pain-grid" style={{ maxWidth: 900, margin: '0 auto' }}>
            <div className="landing-pain-card animate-on-scroll">
              <div className="icon">🏛️</div>
              <h3>기관별 맞춤 구성</h3>
              <p>기관의 데이터 특성과 분석 목적에 맞춰 분석 환경을 구성합니다. 원하는 분석 Flow에 맞춘 맞춤형 파이프라인을 제공합니다.</p>
            </div>
            <div className="landing-pain-card animate-on-scroll">
              <div className="icon">🔒</div>
              <h3>전용 서버 & 보안</h3>
              <p>데이터 격리, 전용 서버 운영, 내부 시스템 연동 등 기관의 보안 요구사항을 충족하는 환경을 제공합니다.</p>
            </div>
            <div className="landing-pain-card animate-on-scroll">
              <div className="icon">🤝</div>
              <h3>PoC 및 도입 상담</h3>
              <p>도입 전 PoC(개념 검증)를 통해 실제 데이터로 효과를 확인하세요. 전담 매니저가 온보딩부터 운영까지 지원합니다.</p>
            </div>
          </div>
          <div className="animate-on-scroll" style={{ textAlign: 'center', marginTop: 40 }}>
            <button className="landing-hero-primary-btn" style={{ fontSize: 15, padding: '14px 36px' }} onClick={openContact}>
              맞춤 도입 상담 신청
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section className="landing-testimonials" id="testimonials">
        <div>
          <h2 className="animate-on-scroll">사용자 후기</h2>
        </div>
        <div>
          {TESTIMONIALS.map((t, i) => (
            <div key={i} className="landing-testimonial-card animate-on-scroll">
              <div className="stars">★★★★★</div>
              <p>&ldquo;{t.text}&rdquo;</p>
              <div className="author">
                <div className="avatar-placeholder" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 16 }}>{t.initial}</div>
                <div>
                  <div className="name">{t.name}</div>
                  <div className="role">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FINAL CTA ─── */}
      <section className="landing-final-cta">
        <div className="animate-on-scroll" style={{ position: 'relative', zIndex: 1, maxWidth: 680, margin: '0 auto' }}>
          <h2>빅데이터 텍스트 분석,<br />더 이상 어렵지 않습니다</h2>
          <p>분석의 복잡성은 낮추고, 해석의 이해도는 높이는 것.<br />데모 버전을 무료로 제공합니다. 지금 바로 경험해보세요.</p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="landing-final-cta-btn" onClick={openApp}>
              무료로 시작하기
              <svg width="18" height="18" viewBox="0 0 16 16" fill="none"><path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </button>
            <button className="landing-hero-secondary-btn" style={{ padding: '16px 40px', fontSize: '1rem' }} onClick={openContact}>맞춤형 도입 상담</button>
            <button className="landing-hero-secondary-btn" style={{ padding: '16px 40px', fontSize: '1rem', border: '1px solid rgba(167,139,250,0.3)' }} onClick={() => window.open('https://blog.naver.com/nova_solution', '_blank')}>분석 샘플 확인하기</button>
          </div>
          <p style={{ marginTop: 20, fontSize: 13, color: 'var(--text-muted)' }}>데모 버전 무료 제공 · 신용카드 불필요 · 공공기관·연구기관 맞춤 도입 가능</p>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="landing-footer">
        <div>
          <div className="footer-grid">
            <div className="footer-brand">
              <div className="logo">TexNova World</div>
              <p>AI 기반 빅데이터 텍스트 분석 솔루션.<br />전통적 분석 + AI 해석, 한 곳에서.</p>
            </div>
            <div className="footer-col">
              <h4>제품</h4>
              <ul>
                <li><a href="#features" onClick={(e) => { e.preventDefault(); scrollTo('features') }}>기능</a></li>
                <li><a href="#pricing" onClick={(e) => { e.preventDefault(); scrollTo('pricing') }}>요금제</a></li>
                <li><a href="#use-cases" onClick={(e) => { e.preventDefault(); scrollTo('use-cases') }}>활용사례</a></li>
                <li><a href="https://blog.naver.com/nova_solution" target="_blank" rel="noopener noreferrer">분석 샘플 (블로그)</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>지원</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openApp() }}>도움말</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openContact() }}>도입 상담</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openApp() }}>문의하기</a></li>
              </ul>
            </div>
            <div className="footer-col">
              <h4>안내</h4>
              <ul>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openApp() }}>개인정보처리방침</a></li>
                <li><a href="#" onClick={(e) => { e.preventDefault(); openApp() }}>이용약관</a></li>
              </ul>
            </div>
          </div>
          <div className="footer-bottom">
            <p>&copy; 2026 TexNova World. All rights reserved. | <a href="https://texnova.co.kr" style={{ color: 'inherit' }}>texnova.co.kr</a></p>
          </div>
        </div>
      </footer>

      {/* ─── CONTACT MODAL ─── */}
      {showContact && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }} onClick={() => setShowContact(false)}>
          <div style={{ background: 'var(--bg-secondary, #1a1a2e)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 16, padding: '36px 40px', maxWidth: 420, width: '90%', textAlign: 'center', position: 'relative' }} onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setShowContact(false)} style={{ position: 'absolute', top: 12, right: 16, background: 'none', border: 'none', color: 'var(--text-tertiary, #888)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>&times;</button>
            <div style={{ fontSize: 40, marginBottom: 12 }}>📞</div>
            <h3 style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary, #fff)', marginBottom: 8 }}>맞춤형 도입 상담</h3>
            <p style={{ fontSize: 14, color: 'var(--text-secondary, #aaa)', marginBottom: 24, lineHeight: 1.6 }}>
              공공기관·연구기관·기업 맞춤 도입에 대해<br />아래 연락처로 편하게 문의해주세요.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <a href="mailto:leejinkyu0612@naver.com" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(167,139,250,0.08)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 10, textDecoration: 'none', color: 'var(--text-primary, #fff)', fontSize: 15 }}>
                <span style={{ fontSize: 20 }}>✉️</span>
                <span>leejinkyu0612@naver.com</span>
              </a>
              <a href="tel:010-9973-2113" style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 20px', background: 'rgba(96,165,250,0.08)', border: '1px solid rgba(96,165,250,0.15)', borderRadius: 10, textDecoration: 'none', color: 'var(--text-primary, #fff)', fontSize: 15 }}>
                <span style={{ fontSize: 20 }}>📱</span>
                <span>010-9973-2113</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default LandingPage
