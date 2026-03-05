const express = require('express')
const fs = require('fs/promises')
const path = require('path')

const app = express()
const PORT = 8090
const HOST = '127.0.0.1'

const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'store.json')
const TMP_FILE = path.join(DATA_DIR, 'store.json.tmp')

const defaultState = {
  config: {
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
  },
  products: [
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
  ],
  users: [{ id: 'demo', pw: '1234', name: '데모' }],
}

app.use(express.json({ limit: '1mb' }))

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

const normalizeProductsWithCreatedAt = (products = []) =>
  products.map((product) => {
    if (product.createdAt) return product
    const fallback = extractCreatedAtFromId(product.id)
    return fallback ? { ...product, createdAt: fallback } : product
  })

const normalizeState = (payload) => ({
  config: { ...defaultState.config, ...(payload?.config ?? {}) },
  products:
    Array.isArray(payload?.products) && payload.products.length
      ? normalizeProductsWithCreatedAt(payload.products)
      : defaultState.products,
  users: Array.isArray(payload?.users) && payload.users.length ? payload.users : defaultState.users,
})

const ensureDataFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(DATA_FILE)
  } catch {
    await fs.writeFile(DATA_FILE, JSON.stringify(defaultState, null, 2), 'utf8')
  }
}

const readState = async () => {
  await ensureDataFile()
  try {
    const raw = await fs.readFile(DATA_FILE, 'utf8')
    return normalizeState(JSON.parse(raw))
  } catch {
    return defaultState
  }
}

const writeState = async (payload) => {
  const next = normalizeState(payload)
  await fs.writeFile(TMP_FILE, JSON.stringify(next, null, 2), 'utf8')
  await fs.rename(TMP_FILE, DATA_FILE)
  return next
}

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/state', async (_req, res) => {
  const state = await readState()
  res.json(state)
})

app.put('/api/state', async (req, res) => {
  if (!req.body || typeof req.body !== 'object') {
    res.status(400).json({ message: 'invalid payload' })
    return
  }

  try {
    const next = await writeState(req.body)
    res.json({ ok: true, state: next })
  } catch {
    res.status(500).json({ message: 'failed to persist state' })
  }
})

ensureDataFile().then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`sopumshop-api listening on http://${HOST}:${PORT}`)
  })
})
