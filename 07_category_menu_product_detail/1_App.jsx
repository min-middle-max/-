import { useEffect, useMemo, useState } from 'react'
import './App.css'

const CATEGORY_TABS = ['전체', '인형', '피규어', '뱃지', '케이스']

const PRODUCTS = [
  {
    id: 'doll-1',
    category: '인형',
    name: '꿈결 토끼 인형',
    subtitle: '파스텔 톤 패브릭, 32cm',
    price: 32000,
    shipping: '2,500원 (5만원 이상 무료)',
    origin: '국내 제작',
    badge: 'Best',
    description:
      '포근한 촉감의 패브릭으로 제작된 토끼 인형입니다. 침실과 거실 어느 공간에도 부드럽게 어울립니다.',
    images: [
      'https://picsum.photos/seed/doll-a/900/1100',
      'https://picsum.photos/seed/doll-b/900/1100',
      'https://picsum.photos/seed/doll-c/900/1100',
    ],
    details: ['소재: 코튼/폴리 혼방', '사이즈: 32 x 18cm', '세탁: 손세탁 권장'],
  },
  {
    id: 'doll-2',
    category: '인형',
    name: '베이비 베어 쿠션돌',
    subtitle: '테디 컬러, 28cm',
    price: 28000,
    shipping: '2,500원 (5만원 이상 무료)',
    origin: '국내 제작',
    badge: 'New',
    description: '안고 있기 좋은 밀도와 탄성을 가진 쿠션형 인형입니다.',
    images: [
      'https://picsum.photos/seed/bear-a/900/1100',
      'https://picsum.photos/seed/bear-b/900/1100',
      'https://picsum.photos/seed/bear-c/900/1100',
    ],
    details: ['소재: 마이크로 화이버', '사이즈: 28 x 22cm', '충전재: 저자극 솜'],
  },
  {
    id: 'figure-1',
    category: '피규어',
    name: '레트로 캣 피규어',
    subtitle: '무광 레진, hand paint',
    price: 45000,
    shipping: '3,000원',
    origin: '일본',
    badge: 'Hot',
    description: '빈티지 무드의 고양이 오브제 피규어. 선반 위 포인트 소품으로 추천합니다.',
    images: [
      'https://picsum.photos/seed/figure-a/900/1100',
      'https://picsum.photos/seed/figure-b/900/1100',
      'https://picsum.photos/seed/figure-c/900/1100',
    ],
    details: ['소재: 레진', '사이즈: 14 x 9cm', '주의: 강한 충격 주의'],
  },
  {
    id: 'figure-2',
    category: '피규어',
    name: '미니 홈 셰프 피규어',
    subtitle: '세트 구성 (3pcs)',
    price: 39000,
    shipping: '3,000원',
    origin: '국내 제작',
    badge: 'Set',
    description: '주방 선반에 배치하기 좋은 미니 피규어 3종 세트입니다.',
    images: [
      'https://picsum.photos/seed/chef-a/900/1100',
      'https://picsum.photos/seed/chef-b/900/1100',
      'https://picsum.photos/seed/chef-c/900/1100',
    ],
    details: ['구성: 3pcs', '높이: 7~10cm', '패키지: 종이 박스'],
  },
  {
    id: 'badge-1',
    category: '뱃지',
    name: '클라우드 메탈 뱃지',
    subtitle: '은은한 유광 니켈',
    price: 9000,
    shipping: '3,000원',
    origin: '국내 제작',
    badge: 'New',
    description: '셔츠, 에코백, 파우치에 포인트를 줄 수 있는 메탈 뱃지입니다.',
    images: [
      'https://picsum.photos/seed/badge-a/900/1100',
      'https://picsum.photos/seed/badge-b/900/1100',
      'https://picsum.photos/seed/badge-c/900/1100',
    ],
    details: ['소재: 신주', '지름: 3.2cm', '고정: 버터플라이 클러치'],
  },
  {
    id: 'badge-2',
    category: '뱃지',
    name: '리본 하트 뱃지',
    subtitle: '파스텔 에나멜',
    price: 11000,
    shipping: '3,000원',
    origin: '국내 제작',
    badge: 'MD Pick',
    description: '작은 크기지만 존재감 있는 리본 하트 디자인입니다.',
    images: [
      'https://picsum.photos/seed/ribbon-a/900/1100',
      'https://picsum.photos/seed/ribbon-b/900/1100',
      'https://picsum.photos/seed/ribbon-c/900/1100',
    ],
    details: ['소재: 아연 합금', '사이즈: 2.8 x 2.5cm', '코팅: 에폭시'],
  },
  {
    id: 'case-1',
    category: '케이스',
    name: '투명 젤리 폰케이스',
    subtitle: '아이보리 라인 인쇄',
    price: 19000,
    shipping: '3,000원',
    origin: '국내 제작',
    badge: 'Best',
    description: '가볍고 말랑한 TPU 케이스, 데일리 사용에 적합한 베이직 라인입니다.',
    images: [
      'https://picsum.photos/seed/case-a/900/1100',
      'https://picsum.photos/seed/case-b/900/1100',
      'https://picsum.photos/seed/case-c/900/1100',
    ],
    details: ['소재: TPU', '지원: iPhone 13~16', '특징: 스크래치 방지 코팅'],
  },
  {
    id: 'case-2',
    category: '케이스',
    name: '하드 매트 카드케이스',
    subtitle: '카드 1장 수납',
    price: 24000,
    shipping: '3,000원',
    origin: '중국 OEM',
    badge: 'Hot',
    description: '매트 질감의 하드 케이스로 카드 수납 기능이 포함되어 있습니다.',
    images: [
      'https://picsum.photos/seed/cardcase-a/900/1100',
      'https://picsum.photos/seed/cardcase-b/900/1100',
      'https://picsum.photos/seed/cardcase-c/900/1100',
    ],
    details: ['소재: PC', '기능: 카드 수납 1장', '색상: 블랙/아이보리'],
  },
]

const formatPrice = (price) => `${new Intl.NumberFormat('ko-KR').format(price)}원`

function App() {
  const [activeCategory, setActiveCategory] = useState('전체')
  const [selectedProductId, setSelectedProductId] = useState(PRODUCTS[0].id)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)

  const filteredProducts = useMemo(() => {
    if (activeCategory === '전체') return PRODUCTS
    return PRODUCTS.filter((product) => product.category === activeCategory)
  }, [activeCategory])

  useEffect(() => {
    if (!filteredProducts.some((product) => product.id === selectedProductId)) {
      setSelectedProductId(filteredProducts[0]?.id ?? '')
      setSelectedImageIndex(0)
      setQuantity(1)
    }
  }, [filteredProducts, selectedProductId])

  const selectedProduct =
    PRODUCTS.find((product) => product.id === selectedProductId) ?? filteredProducts[0] ?? null

  useEffect(() => {
    setSelectedImageIndex(0)
    setQuantity(1)
  }, [selectedProductId])

  return (
    <div className="shop-shell">
      <header className="shop-header">
        <p className="brand">Sopumshop</p>
        <nav>
          <a href="#">신상품</a>
          <a href="#">베스트</a>
          <a href="#">이벤트</a>
        </nav>
      </header>

      <section className="intro">
        <p className="eyebrow">Goods Store</p>
        <h1>인형, 피규어, 뱃지, 케이스</h1>
        <p>카테고리를 누르면 해당 상품 목록이 나오고, 상품 클릭 시 상세 정보를 확인할 수 있어요.</p>
      </section>

      <section className="category-menu" aria-label="상품 카테고리 메뉴">
        {CATEGORY_TABS.map((category) => (
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

      <section className="catalog-layout">
        <aside className="product-list-panel">
          <div className="panel-title-row">
            <h2>{activeCategory} 상품</h2>
            <span>{filteredProducts.length}개</span>
          </div>
          <div className="product-list-grid">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                type="button"
                className={`product-tile ${selectedProduct?.id === product.id ? 'selected' : ''}`}
                onClick={() => setSelectedProductId(product.id)}
              >
                <img src={product.images[0]} alt={product.name} loading="lazy" />
                <div>
                  <p className="tile-category">{product.category}</p>
                  <p className="tile-name">{product.name}</p>
                  <p className="tile-price">{formatPrice(product.price)}</p>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {selectedProduct && (
          <article className="product-detail-panel">
            <div className="detail-gallery">
              <img
                className="main-image"
                src={selectedProduct.images[selectedImageIndex]}
                alt={selectedProduct.name}
              />
              <div className="thumb-row">
                {selectedProduct.images.map((image, index) => (
                  <button
                    key={image}
                    type="button"
                    className={index === selectedImageIndex ? 'active' : ''}
                    onClick={() => setSelectedImageIndex(index)}
                  >
                    <img src={image} alt={`${selectedProduct.name} ${index + 1}`} />
                  </button>
                ))}
              </div>
            </div>

            <div className="detail-info">
              <span className="badge">{selectedProduct.badge}</span>
              <h3>{selectedProduct.name}</h3>
              <p className="subtitle">{selectedProduct.subtitle}</p>
              <p className="price">{formatPrice(selectedProduct.price)}</p>

              <dl className="meta-grid">
                <dt>배송</dt>
                <dd>{selectedProduct.shipping}</dd>
                <dt>원산지</dt>
                <dd>{selectedProduct.origin}</dd>
              </dl>

              <p className="description">{selectedProduct.description}</p>

              <ul className="detail-list">
                {selectedProduct.details.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>

              <div className="purchase-box">
                <div className="qty-box">
                  <span>수량</span>
                  <div>
                    <button type="button" onClick={() => setQuantity((q) => Math.max(1, q - 1))}>
                      -
                    </button>
                    <strong>{quantity}</strong>
                    <button type="button" onClick={() => setQuantity((q) => q + 1)}>
                      +
                    </button>
                  </div>
                </div>
                <p className="total">총 금액 {formatPrice(selectedProduct.price * quantity)}</p>
                <div className="action-row">
                  <button type="button" className="ghost-btn">
                    장바구니
                  </button>
                  <button type="button" className="solid-btn">
                    바로구매
                  </button>
                </div>
              </div>
            </div>
          </article>
        )}
      </section>
    </div>
  )
}

export default App
