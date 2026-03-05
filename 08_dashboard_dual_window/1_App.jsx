import { useEffect, useMemo, useRef, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'sopumshop-template-v3'
const API_STATE_PATH = '/api/state'
const NEW_BADGE_WINDOW_MS = 24 * 60 * 60 * 1000

const defaultConfig = {
  brandName: 'Sopumshop',
  previewEyebrow: 'Template Preview',
  heroTitle: '템플릿형 소품샵 스토어',
  heroSubtitle: '대시보드에서 메뉴/배경/사이드바/푸터/상품을 직접 수정하세요.',
  backgroundMode: 'gradient',
  backgroundColor: '#f7f2ea',
  backgroundColor2: '#e8dece',
  showTopMenu: true,
  topMenus: ['신상품', '베스트', '이벤트'],
  showLeftSidebar: true,
  showRightSidebar: true,
  rightSidebarTitle: '공지사항',
  noticeText: '배송 지연 안내\n주말 주문은 월요일 순차 출고됩니다.',
  footerHomepage: 'https://example.com',
  footerPhone: '02-1234-5678',
  showLogin: true,
  showPayment: true,
}

const defaultProducts = [
  {
    id: 'p-doll-1',
    name: '꿈결 토끼 인형',
    category: '인형',
    price: 32000,
    badge: 'Best',
    description: '부드러운 패브릭 소재로 제작된 데일리 인형 소품입니다.',
    image: 'https://picsum.photos/seed/doll-a/900/1100',
    image2: 'https://picsum.photos/seed/doll-b/900/1100',
    image3: 'https://picsum.photos/seed/doll-c/900/1100',
  },
  {
    id: 'p-figure-1',
    name: '레트로 캣 피규어',
    category: '피규어',
    price: 45000,
    badge: 'Hot',
    description: '선반 위 분위기를 살려주는 빈티지 무드 피규어입니다.',
    image: 'https://picsum.photos/seed/figure-a/900/1100',
    image2: 'https://picsum.photos/seed/figure-b/900/1100',
    image3: 'https://picsum.photos/seed/figure-c/900/1100',
  },
  {
    id: 'p-badge-1',
    name: '클라우드 메탈 뱃지',
    category: '뱃지',
    price: 9000,
    badge: 'New',
    description: '가방/파우치에 포인트를 주기 좋은 메탈 뱃지입니다.',
    image: 'https://picsum.photos/seed/badge-a/900/1100',
    image2: 'https://picsum.photos/seed/badge-b/900/1100',
    image3: 'https://picsum.photos/seed/badge-c/900/1100',
  },
  {
    id: 'p-case-1',
    name: '투명 젤리 케이스',
    category: '케이스',
    price: 19000,
    badge: 'MD Pick',
    description: '말랑한 그립감의 투명 젤리 타입 케이스입니다.',
    image: 'https://picsum.photos/seed/case-a/900/1100',
    image2: 'https://picsum.photos/seed/case-b/900/1100',
    image3: 'https://picsum.photos/seed/case-c/900/1100',
  },
]

const defaultUsers = [{ id: 'demo', pw: '1234', name: '데모' }]

const createId = () => {
  const randomPart = Math.random().toString(36).slice(2, 8)
  return `p-${Date.now()}-${randomPart}`
}

const formatPrice = (price) => `${new Intl.NumberFormat('ko-KR').format(price)}원`

const extractCreatedAtFromId = (id) => {
  if (typeof id !== 'string') return ''
  const match = /^p-(\d{13})-/.exec(id)
  if (!match) return ''
  const ms = Number(match[1])
  if (!Number.isFinite(ms)) return ''
  const date = new Date(ms)
  if (Number.isNaN(date.getTime())) return ''
  return date.toISOString()
}

const isRecentlyAdded = (createdAt) => {
  if (!createdAt) return false
  const createdAtMs = new Date(createdAt).getTime()
  if (Number.isNaN(createdAtMs)) return false
  const diff = Date.now() - createdAtMs
  return diff >= 0 && diff < NEW_BADGE_WINDOW_MS
}

const normalizeProductsWithCreatedAt = (products = []) =>
  products.map((product) => {
    if (product.createdAt) return product
    const fallback = extractCreatedAtFromId(product.id)
    return fallback ? { ...product, createdAt: fallback } : product
  })

const normalizeState = (payload) => ({
  config: { ...defaultConfig, ...(payload?.config ?? {}) },
  products:
    Array.isArray(payload?.products) && payload.products.length
      ? normalizeProductsWithCreatedAt(payload.products)
      : defaultProducts,
  users: Array.isArray(payload?.users) && payload.users.length ? payload.users : defaultUsers,
})

const loadInitialState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return normalizeState()
    const parsed = JSON.parse(raw)
    return normalizeState(parsed)
  } catch {
    return normalizeState()
  }
}

const isDashboardPage = () => {
  const params = new URLSearchParams(window.location.search)
  return params.get('dashboard') === '1'
}

function App() {
  const dashboardMode = isDashboardPage()
  const initial = loadInitialState()

  const [config, setConfig] = useState(initial.config)
  const [products, setProducts] = useState(initial.products)
  const [users, setUsers] = useState(initial.users)
  const [remoteReady, setRemoteReady] = useState(false)
  const lastServerStateRef = useRef('')

  const [currentUser, setCurrentUser] = useState(null)
  const [authOpen, setAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [authMessage, setAuthMessage] = useState('')
  const [loginForm, setLoginForm] = useState({ id: '', pw: '' })
  const [signupForm, setSignupForm] = useState({ name: '', id: '', pw: '', pwConfirm: '' })

  const [newMenuLabel, setNewMenuLabel] = useState('')
  const [editProductId, setEditProductId] = useState('')

  const [activeCategory, setActiveCategory] = useState('전체')
  const [selectedProductId, setSelectedProductId] = useState(initial.products[0]?.id ?? '')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [qty, setQty] = useState(1)

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: '인형',
    price: '10000',
    badge: 'New',
    description: '',
    image: 'https://picsum.photos/seed/new-product/900/1100',
    image2: 'https://picsum.photos/seed/new-product-2/900/1100',
    image3: 'https://picsum.photos/seed/new-product-3/900/1100',
  })

  useEffect(() => {
    let active = true

    const hydrateFromApi = async () => {
      try {
        const response = await fetch(API_STATE_PATH, { cache: 'no-store' })
        if (!response.ok) throw new Error('failed to load server state')
        const next = normalizeState(await response.json())
        if (!active) return
        setConfig(next.config)
        setProducts(next.products)
        setUsers(next.users)
        const serialized = JSON.stringify(next)
        lastServerStateRef.current = serialized
        localStorage.setItem(STORAGE_KEY, serialized)
      } catch {
        // keep local cache as fallback
      } finally {
        if (active) setRemoteReady(true)
      }
    }

    hydrateFromApi()

    return () => {
      active = false
    }
  }, [])

  useEffect(() => {
    const nextState = { config, products, users }
    const serialized = JSON.stringify(nextState)
    lastServerStateRef.current = serialized
    localStorage.setItem(STORAGE_KEY, serialized)
    if (!remoteReady) return

    const timerId = setTimeout(() => {
      fetch(API_STATE_PATH, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(nextState),
      }).catch(() => {
        // ignore sync errors, keep local cache
      })
    }, 300)

    return () => clearTimeout(timerId)
  }, [config, products, users, remoteReady])

  useEffect(() => {
    if (!remoteReady || dashboardMode) return

    const intervalId = setInterval(async () => {
      try {
        const response = await fetch(API_STATE_PATH, { cache: 'no-store' })
        if (!response.ok) return
        const next = normalizeState(await response.json())
        const serialized = JSON.stringify(next)
        if (serialized === lastServerStateRef.current) return
        lastServerStateRef.current = serialized
        setConfig(next.config)
        setProducts(next.products)
        setUsers(next.users)
        localStorage.setItem(STORAGE_KEY, serialized)
      } catch {
        // ignore polling errors
      }
    }, 4000)

    return () => clearInterval(intervalId)
  }, [remoteReady, dashboardMode])

  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== STORAGE_KEY || !event.newValue) return
      try {
        const parsed = JSON.parse(event.newValue)
        if (parsed.config) setConfig({ ...defaultConfig, ...parsed.config })
        if (Array.isArray(parsed.products) && parsed.products.length) setProducts(parsed.products)
        if (Array.isArray(parsed.users) && parsed.users.length) setUsers(parsed.users)
      } catch {
        // ignore
      }
    }

    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category).filter(Boolean)))
    return ['전체', ...unique]
  }, [products])

  const filteredProducts = useMemo(() => {
    if (activeCategory === '전체') return products
    return products.filter((p) => p.category === activeCategory)
  }, [activeCategory, products])

  const selectedProduct =
    products.find((product) => product.id === selectedProductId) ?? filteredProducts[0] ?? null

  useEffect(() => {
    if (!categories.includes(activeCategory)) {
      setActiveCategory('전체')
    }
  }, [categories, activeCategory])

  useEffect(() => {
    if (!filteredProducts.some((p) => p.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0]?.id ?? '')
    }
  }, [filteredProducts, selectedProductId])

  useEffect(() => {
    setSelectedImageIndex(0)
    setQty(1)
  }, [selectedProductId])

  useEffect(() => {
    if (!config.showLogin) {
      setAuthOpen(false)
      setCurrentUser(null)
    }
  }, [config.showLogin])

  const bgStyle =
    config.backgroundMode === 'solid'
      ? { background: config.backgroundColor }
      : { background: `linear-gradient(160deg, ${config.backgroundColor} 0%, ${config.backgroundColor2} 100%)` }

  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }))
  }

  const addTopMenu = () => {
    const value = newMenuLabel.trim()
    if (!value) return
    setConfig((prev) => ({ ...prev, topMenus: [...prev.topMenus, value] }))
    setNewMenuLabel('')
  }

  const removeTopMenu = (menuLabel) => {
    setConfig((prev) => ({ ...prev, topMenus: prev.topMenus.filter((m) => m !== menuLabel) }))
  }

  const addProduct = () => {
    if (!newProduct.name.trim() || !newProduct.category.trim()) return

    const payload = {
      name: newProduct.name.trim(),
      category: newProduct.category.trim(),
      price: Number(newProduct.price) || 0,
      badge: newProduct.badge.trim() || 'New',
      description: newProduct.description.trim() || '상품 설명을 입력하세요.',
      image: newProduct.image.trim(),
      image2: newProduct.image2.trim() || newProduct.image.trim(),
      image3: newProduct.image3.trim() || newProduct.image.trim(),
    }

    if (editProductId) {
      setProducts((prev) => prev.map((item) => (item.id === editProductId ? { ...item, ...payload } : item)))
      setSelectedProductId(editProductId)
      setActiveCategory(payload.category)
      setEditProductId('')
    } else {
      const next = { id: createId(), createdAt: new Date().toISOString(), ...payload }
      setProducts((prev) => [next, ...prev])
      setSelectedProductId(next.id)
      setActiveCategory(next.category)
    }

    setNewProduct((prev) => ({ ...prev, name: '', description: '' }))
  }

  const startEditProduct = (product) => {
    setEditProductId(product.id)
    setNewProduct({
      name: product.name,
      category: product.category,
      price: String(product.price ?? ''),
      badge: product.badge ?? 'New',
      description: product.description ?? '',
      image: product.image ?? '',
      image2: product.image2 ?? product.image ?? '',
      image3: product.image3 ?? product.image ?? '',
    })
  }

  const cancelEditProduct = () => {
    setEditProductId('')
    setNewProduct((prev) => ({ ...prev, name: '', description: '' }))
  }

  const deleteProduct = (id) => {
    setProducts((prev) => prev.filter((item) => item.id !== id))
    if (editProductId === id) {
      setEditProductId('')
      setNewProduct((prev) => ({ ...prev, name: '', description: '' }))
    }
  }

  const resetTemplate = () => {
    setConfig(defaultConfig)
    setProducts(defaultProducts)
    setUsers(defaultUsers)
    setEditProductId('')
    setCurrentUser(null)
    setAuthOpen(false)
    setAuthMessage('')
    setLoginForm({ id: '', pw: '' })
    setSignupForm({ name: '', id: '', pw: '', pwConfirm: '' })
    setActiveCategory('전체')
    setSelectedProductId(defaultProducts[0].id)
    setSelectedImageIndex(0)
    setQty(1)
  }

  const handleLogin = (event) => {
    event.preventDefault()
    const id = loginForm.id.trim()
    const pw = loginForm.pw
    if (!id || !pw) {
      setAuthMessage('아이디와 비밀번호를 입력하세요.')
      return
    }
    const found = users.find((user) => user.id === id && user.pw === pw)
    if (!found) {
      setAuthMessage('아이디 또는 비밀번호가 올바르지 않습니다.')
      return
    }
    setCurrentUser({ id: found.id, name: found.name })
    setAuthMessage('')
    setAuthOpen(false)
    setLoginForm({ id: '', pw: '' })
  }

  const handleSignup = (event) => {
    event.preventDefault()
    const name = signupForm.name.trim()
    const id = signupForm.id.trim()
    const pw = signupForm.pw
    const pwConfirm = signupForm.pwConfirm

    if (!name || !id || !pw || !pwConfirm) {
      setAuthMessage('회원가입 정보를 모두 입력하세요.')
      return
    }
    if (pw.length < 4) {
      setAuthMessage('비밀번호는 4자 이상 입력하세요.')
      return
    }
    if (pw !== pwConfirm) {
      setAuthMessage('비밀번호 확인이 일치하지 않습니다.')
      return
    }
    if (users.some((user) => user.id === id)) {
      setAuthMessage('이미 사용 중인 아이디입니다.')
      return
    }

    const nextUser = { id, pw, name }
    setUsers((prev) => [...prev, nextUser])
    setAuthMode('login')
    setLoginForm({ id, pw: '' })
    setSignupForm({ name: '', id: '', pw: '', pwConfirm: '' })
    setAuthMessage('회원가입 완료! 로그인해 주세요.')
  }

  const currentImages = selectedProduct
    ? [selectedProduct.image, selectedProduct.image2, selectedProduct.image3].filter(Boolean)
    : []

  const totalPrice = selectedProduct ? selectedProduct.price * qty : 0

  const openDashboardWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}?dashboard=1`
    window.open(url, 'sopumshop-dashboard')
  }

  const openStoreWindow = () => {
    const url = `${window.location.origin}${window.location.pathname}`
    window.open(url, 'sopumshop-store')
  }

  const dashboardPanel = (
    <section className="dashboard standalone">
      <div className="dashboard-head">
        <h2>템플릿 대시보드</h2>
        <div className="inline-row">
          <button type="button" onClick={openStoreWindow}>
            스토어 창 열기
          </button>
          <button type="button" onClick={resetTemplate}>
            초기화
          </button>
        </div>
      </div>

      <div className="dash-grid">
        <div className="dash-card">
          <h3>브랜드/히어로</h3>
          <label>
            브랜드명
            <input value={config.brandName} onChange={(e) => updateConfig('brandName', e.target.value)} />
          </label>
          <label>
            눈썹 텍스트 (Template Preview)
            <input value={config.previewEyebrow} onChange={(e) => updateConfig('previewEyebrow', e.target.value)} />
          </label>
          <label>
            메인 타이틀
            <input value={config.heroTitle} onChange={(e) => updateConfig('heroTitle', e.target.value)} />
          </label>
          <label>
            서브 텍스트
            <textarea value={config.heroSubtitle} onChange={(e) => updateConfig('heroSubtitle', e.target.value)} />
          </label>
        </div>

        <div className="dash-card">
          <h3>배경/레이아웃</h3>
          <label>
            배경 타입
            <select value={config.backgroundMode} onChange={(e) => updateConfig('backgroundMode', e.target.value)}>
              <option value="gradient">그라디언트</option>
              <option value="solid">단색</option>
            </select>
          </label>
          <label>
            메인 배경색
            <input type="color" value={config.backgroundColor} onChange={(e) => updateConfig('backgroundColor', e.target.value)} />
          </label>
          <label>
            보조 배경색
            <input type="color" value={config.backgroundColor2} onChange={(e) => updateConfig('backgroundColor2', e.target.value)} />
          </label>
          <label className="check">
            <input type="checkbox" checked={config.showTopMenu} onChange={(e) => updateConfig('showTopMenu', e.target.checked)} />
            상단 메뉴바 표시
          </label>
          <label className="check">
            <input type="checkbox" checked={config.showLeftSidebar} onChange={(e) => updateConfig('showLeftSidebar', e.target.checked)} />
            좌측 사이드바 표시
          </label>
          <label className="check">
            <input type="checkbox" checked={config.showRightSidebar} onChange={(e) => updateConfig('showRightSidebar', e.target.checked)} />
            우측 사이드바 표시
          </label>
        </div>

        <div className="dash-card">
          <h3>상단 메뉴 관리</h3>
          <div className="chip-list">
            {config.topMenus.map((menu) => (
              <button key={menu} type="button" className="chip" onClick={() => removeTopMenu(menu)}>
                {menu} ×
              </button>
            ))}
          </div>
          <label>
            메뉴 추가
            <div className="inline-row">
              <input
                placeholder="예: 리뷰"
                value={newMenuLabel}
                onChange={(e) => setNewMenuLabel(e.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault()
                    addTopMenu()
                  }
                }}
              />
              <button type="button" onClick={addTopMenu}>
                추가
              </button>
            </div>
          </label>
        </div>

        <div className="dash-card">
          <h3>푸터/기타 기능</h3>
          <label>
            홈페이지 주소
            <input value={config.footerHomepage} onChange={(e) => updateConfig('footerHomepage', e.target.value)} />
          </label>
          <label>
            전화번호
            <input value={config.footerPhone} onChange={(e) => updateConfig('footerPhone', e.target.value)} />
          </label>
          <label>
            우측 사이드바 제목
            <input value={config.rightSidebarTitle} onChange={(e) => updateConfig('rightSidebarTitle', e.target.value)} />
          </label>
          <label>
            공지 텍스트
            <textarea value={config.noticeText} onChange={(e) => updateConfig('noticeText', e.target.value)} />
          </label>
          <label className="check">
            <input type="checkbox" checked={config.showLogin} onChange={(e) => updateConfig('showLogin', e.target.checked)} />
            우측 상단 로그인/회원가입 표시
          </label>
          <label className="check">
            <input type="checkbox" checked={config.showPayment} onChange={(e) => updateConfig('showPayment', e.target.checked)} />
            결제 버튼 표시
          </label>
        </div>

        <div className="dash-card product-card-admin">
          <h3>{editProductId ? '상품 수정/삭제' : '상품 추가/삭제'}</h3>
          <div className="form-grid">
            <label>
              상품명
              <input value={newProduct.name} onChange={(e) => setNewProduct((prev) => ({ ...prev, name: e.target.value }))} />
            </label>
            <label>
              카테고리
              <input value={newProduct.category} onChange={(e) => setNewProduct((prev) => ({ ...prev, category: e.target.value }))} />
            </label>
            <label>
              가격
              <input type="number" value={newProduct.price} onChange={(e) => setNewProduct((prev) => ({ ...prev, price: e.target.value }))} />
            </label>
            <label>
              뱃지
              <input value={newProduct.badge} onChange={(e) => setNewProduct((prev) => ({ ...prev, badge: e.target.value }))} />
            </label>
            <label>
              이미지 URL 1
              <input value={newProduct.image} onChange={(e) => setNewProduct((prev) => ({ ...prev, image: e.target.value }))} />
            </label>
            <label>
              이미지 URL 2
              <input value={newProduct.image2} onChange={(e) => setNewProduct((prev) => ({ ...prev, image2: e.target.value }))} />
            </label>
            <label>
              이미지 URL 3
              <input value={newProduct.image3} onChange={(e) => setNewProduct((prev) => ({ ...prev, image3: e.target.value }))} />
            </label>
            <label className="full">
              설명
              <textarea value={newProduct.description} onChange={(e) => setNewProduct((prev) => ({ ...prev, description: e.target.value }))} />
            </label>
          </div>
          <div className="inline-row">
            <button type="button" onClick={addProduct}>
              {editProductId ? '수정 저장' : '상품 추가'}
            </button>
            {editProductId && (
              <button type="button" onClick={cancelEditProduct}>
                수정 취소
              </button>
            )}
          </div>

          <div className="product-admin-list">
            {products.map((product) => (
              <div key={product.id}>
                <span>
                  [{product.category}] {product.name}
                </span>
                <div className="admin-actions">
                  <button type="button" onClick={() => startEditProduct(product)}>
                    수정
                  </button>
                  <button type="button" onClick={() => deleteProduct(product.id)}>
                    삭제
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )

  const storeView = (
    <section className="store-shell">
      <header className="store-header">
        <p className="store-brand">{config.brandName}</p>

        <div className="store-header-right">
          <button type="button" className="dashboard-launch" onClick={openDashboardWindow}>
            대시보드
          </button>

          {config.showTopMenu && (
            <nav>
              {config.topMenus.map((menu) => (
                <a key={menu} href="#">
                  {menu}
                </a>
              ))}
            </nav>
          )}

          {config.showLogin && (
            <div className="auth-mini">
              {currentUser ? (
                <div className="auth-user-row">
                  <span>{currentUser.name}님</span>
                  <button
                    type="button"
                    onClick={() => {
                      setCurrentUser(null)
                      setAuthMessage('로그아웃되었습니다.')
                    }}
                  >
                    로그아웃
                  </button>
                </div>
              ) : (
                <>
                  <button
                    type="button"
                    className="auth-trigger"
                    onClick={() => {
                      setAuthOpen((prev) => !prev)
                      setAuthMessage('')
                    }}
                  >
                    로그인 / 회원가입
                  </button>

                  {authOpen && (
                    <div className="auth-pop">
                      <div className="auth-tabs">
                        <button
                          type="button"
                          className={authMode === 'login' ? 'active' : ''}
                          onClick={() => {
                            setAuthMode('login')
                            setAuthMessage('')
                          }}
                        >
                          로그인
                        </button>
                        <button
                          type="button"
                          className={authMode === 'signup' ? 'active' : ''}
                          onClick={() => {
                            setAuthMode('signup')
                            setAuthMessage('')
                          }}
                        >
                          회원가입
                        </button>
                      </div>

                      {authMode === 'login' ? (
                        <form className="auth-form" onSubmit={handleLogin}>
                          <input
                            placeholder="아이디"
                            value={loginForm.id}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, id: e.target.value }))}
                          />
                          <input
                            placeholder="비밀번호"
                            type="password"
                            value={loginForm.pw}
                            onChange={(e) => setLoginForm((prev) => ({ ...prev, pw: e.target.value }))}
                          />
                          <button type="submit">로그인</button>
                        </form>
                      ) : (
                        <form className="auth-form" onSubmit={handleSignup}>
                          <input
                            placeholder="이름"
                            value={signupForm.name}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, name: e.target.value }))}
                          />
                          <input
                            placeholder="아이디"
                            value={signupForm.id}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, id: e.target.value }))}
                          />
                          <input
                            placeholder="비밀번호"
                            type="password"
                            value={signupForm.pw}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, pw: e.target.value }))}
                          />
                          <input
                            placeholder="비밀번호 확인"
                            type="password"
                            value={signupForm.pwConfirm}
                            onChange={(e) => setSignupForm((prev) => ({ ...prev, pwConfirm: e.target.value }))}
                          />
                          <button type="submit">회원가입</button>
                        </form>
                      )}

                      {authMessage && <p className="auth-msg">{authMessage}</p>}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <section className="hero">
        <p className="eyebrow">{config.previewEyebrow}</p>
        <h1>{config.heroTitle}</h1>
        <p>{config.heroSubtitle}</p>
      </section>

      <section className="category-bar">
        {categories.map((category) => (
          <button
            key={category}
            type="button"
            className={category === activeCategory ? 'active' : ''}
            onClick={() => setActiveCategory(category)}
          >
            {category}
          </button>
        ))}
      </section>

      <section className={`layout ${config.showLeftSidebar ? '' : 'no-left'} ${config.showRightSidebar ? '' : 'no-right'}`}>
        {config.showLeftSidebar && (
          <aside className="sidebar left">
            <h3>카테고리</h3>
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={category === activeCategory ? 'active' : ''}
                onClick={() => setActiveCategory(category)}
              >
                {category}
              </button>
            ))}
          </aside>
        )}

        <main className="products-main">
          <div className="products-grid">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                className={`product-item ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <div className="product-image-wrap">
                  {isRecentlyAdded(product.createdAt) && <span className="new-ribbon">NEW</span>}
                  <img src={product.image} alt={product.name} loading="lazy" />
                </div>
                <p className="name">{product.name}</p>
                <p className="price">{formatPrice(product.price)}</p>
              </button>
            ))}
          </div>

          {selectedProduct && (
            <article className="detail">
              <div className="gallery">
                <img className="main" src={currentImages[selectedImageIndex]} alt={selectedProduct.name} />
                <div className="thumbs">
                  {currentImages.map((src, index) => (
                    <button
                      key={src}
                      type="button"
                      className={selectedImageIndex === index ? 'active' : ''}
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img src={src} alt={`${selectedProduct.name} ${index + 1}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div className="info">
                <span className="badge">{selectedProduct.badge}</span>
                <h2>{selectedProduct.name}</h2>
                <p className="category">{selectedProduct.category}</p>
                <p className="price strong">{formatPrice(selectedProduct.price)}</p>
                <p className="desc">{selectedProduct.description}</p>

                <div className="qty">
                  <span>수량</span>
                  <div>
                    <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                      -
                    </button>
                    <strong>{qty}</strong>
                    <button type="button" onClick={() => setQty((q) => q + 1)}>
                      +
                    </button>
                  </div>
                </div>

                <p className="total">총 금액: {formatPrice(totalPrice)}</p>

                <div className="actions">
                  {currentUser && <p className="login-ok">로그인 상태: {currentUser.name}</p>}
                  {config.showPayment && (
                    <button
                      type="button"
                      className="pay-btn"
                      onClick={() => alert('결제 연동은 백엔드/PG 연동 단계에서 연결됩니다.')}
                    >
                      결제하기
                    </button>
                  )}
                </div>
              </div>
            </article>
          )}
        </main>

        {config.showRightSidebar && (
          <aside className="sidebar right">
            <h3>{config.rightSidebarTitle}</h3>
            <p>{config.noticeText}</p>
          </aside>
        )}
      </section>

      <footer className="store-footer">
        <span>홈페이지: {config.footerHomepage}</span>
        <span>전화번호: {config.footerPhone}</span>
      </footer>
    </section>
  )

  return (
    <div className="template-app" style={bgStyle}>
      {dashboardMode ? dashboardPanel : storeView}
    </div>
  )
}

export default App
