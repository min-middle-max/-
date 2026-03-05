const express = require('express')
const fs = require('fs/promises')
const path = require('path')

const app = express()
const PORT = 8090
const HOST = '127.0.0.1'

const DATA_DIR = path.join(__dirname, 'data')
const DATA_FILE = path.join(DATA_DIR, 'store.json')
const TMP_FILE = path.join(DATA_DIR, 'store.json.tmp')
const ORDERS_FILE = path.join(DATA_DIR, 'orders.json')
const ORDERS_TMP_FILE = path.join(DATA_DIR, 'orders.json.tmp')
const PAYMENT_CONFIG_FILE = path.join(DATA_DIR, 'payment-config.json')

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

const defaultPaymentConfig = {
  provider: 'mock',
  toss: {
    clientKey: '',
    secretKey: '',
  },
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

const normalizePaymentConfig = (payload) => ({
  provider: payload?.provider === 'toss' ? 'toss' : 'mock',
  toss: {
    clientKey: String(payload?.toss?.clientKey ?? '').trim(),
    secretKey: String(payload?.toss?.secretKey ?? '').trim(),
  },
})

const ensurePaymentConfigFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(PAYMENT_CONFIG_FILE)
  } catch {
    await fs.writeFile(PAYMENT_CONFIG_FILE, JSON.stringify(defaultPaymentConfig, null, 2), 'utf8')
  }
}

const readPaymentConfig = async () => {
  await ensurePaymentConfigFile()
  try {
    const raw = await fs.readFile(PAYMENT_CONFIG_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return normalizePaymentConfig(parsed)
  } catch {
    return defaultPaymentConfig
  }
}

const ensureOrdersFile = async () => {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(ORDERS_FILE)
  } catch {
    await fs.writeFile(ORDERS_FILE, '[]', 'utf8')
  }
}

const readOrders = async () => {
  await ensureOrdersFile()
  try {
    const raw = await fs.readFile(ORDERS_FILE, 'utf8')
    const parsed = JSON.parse(raw)
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

const writeOrders = async (orders) => {
  await fs.writeFile(ORDERS_TMP_FILE, JSON.stringify(orders, null, 2), 'utf8')
  await fs.rename(ORDERS_TMP_FILE, ORDERS_FILE)
}

const createOrderId = () => `o-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
const createOrderNo = () => `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`

const getTossBasicAuth = (secretKey) =>
  `Basic ${Buffer.from(`${secretKey}:`, 'utf8').toString('base64')}`

const confirmTossPayment = async ({ secretKey, paymentKey, orderId, amount }) => {
  const response = await fetch('https://api.tosspayments.com/v1/payments/confirm', {
    method: 'POST',
    headers: {
      Authorization: getTossBasicAuth(secretKey),
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      paymentKey,
      orderId,
      amount: Math.floor(amount),
    }),
  })

  const data = await response.json().catch(() => ({}))
  if (!response.ok) {
    const message = data?.message || '토스 결제 승인에 실패했습니다.'
    const code = data?.code || 'TOSS_CONFIRM_FAILED'
    const error = new Error(message)
    error.code = code
    throw error
  }
  return data
}

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

app.get('/api/payments/config', async (_req, res) => {
  const paymentConfig = await readPaymentConfig()
  const tossReady = Boolean(paymentConfig.toss.clientKey && paymentConfig.toss.secretKey)
  const provider = paymentConfig.provider === 'toss' && tossReady ? 'toss' : 'mock'

  res.json({
    ok: true,
    provider,
    toss: {
      clientKey: paymentConfig.toss.clientKey || '',
      ready: tossReady,
    },
  })
})

app.post('/api/payments/checkout', async (req, res) => {
  const qty = Number(req.body?.qty)
  const amount = Number(req.body?.amount)
  const productId = String(req.body?.productId ?? '').trim()
  const productName = String(req.body?.productName ?? '').trim()
  const paymentMethod = String(req.body?.paymentMethod ?? 'card').trim() || 'card'
  const userId = String(req.body?.userId ?? 'guest').trim() || 'guest'
  const userName = String(req.body?.userName ?? '게스트').trim() || '게스트'
  const paymentKey = String(req.body?.paymentKey ?? '').trim()
  const requestOrderId = String(req.body?.orderId ?? '').trim()

  if (!productId || !productName || !Number.isFinite(qty) || qty < 1 || !Number.isFinite(amount) || amount < 1) {
    res.status(400).json({ ok: false, message: '결제 요청 데이터가 올바르지 않습니다.' })
    return
  }

  try {
    const paymentConfig = await readPaymentConfig()
    const tossReady = Boolean(paymentConfig.toss.clientKey && paymentConfig.toss.secretKey)
    const provider = paymentConfig.provider === 'toss' && tossReady ? 'toss' : 'mock'
    const orders = await readOrders()
    let order

    if (provider === 'toss') {
      if (!paymentKey || !requestOrderId) {
        res.status(400).json({ ok: false, message: '토스 결제 승인 정보가 누락되었습니다.' })
        return
      }

      const tossPayment = await confirmTossPayment({
        secretKey: paymentConfig.toss.secretKey,
        paymentKey,
        orderId: requestOrderId,
        amount,
      })

      order = {
        id: createOrderId(),
        orderNo: String(tossPayment.orderId || requestOrderId || createOrderNo()),
        status: 'paid',
        paidAt: String(tossPayment.approvedAt || new Date().toISOString()),
        productId,
        productName,
        qty: Math.floor(qty),
        amount: Math.floor(Number(tossPayment.totalAmount || amount)),
        paymentMethod,
        provider: 'toss',
        userId,
        userName,
        paymentKey,
      }
    } else {
      order = {
        id: createOrderId(),
        orderNo: createOrderNo(),
        status: 'paid',
        paidAt: new Date().toISOString(),
        productId,
        productName,
        qty: Math.floor(qty),
        amount: Math.floor(amount),
        paymentMethod,
        provider: 'mock',
        userId,
        userName,
      }
    }

    orders.unshift(order)
    await writeOrders(orders)

    res.json({
      ok: true,
      message: '결제가 완료되었습니다.',
      order,
    })
  } catch (error) {
    if (error?.code) {
      res.status(400).json({ ok: false, code: error.code, message: error.message })
      return
    }
    res.status(500).json({ ok: false, message: '결제 저장 처리에 실패했습니다.' })
  }
})

app.get('/api/orders', async (req, res) => {
  const limitRaw = Number(req.query?.limit)
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(Math.floor(limitRaw), 100) : 30

  try {
    const orders = await readOrders()
    res.json({ ok: true, orders: orders.slice(0, limit) })
  } catch {
    res.status(500).json({ ok: false, message: '주문 목록 조회에 실패했습니다.' })
  }
})

Promise.all([ensureDataFile(), ensureOrdersFile(), ensurePaymentConfigFile()]).then(() => {
  app.listen(PORT, HOST, () => {
    console.log(`sopumshop-api listening on http://${HOST}:${PORT}`)
  })
})
