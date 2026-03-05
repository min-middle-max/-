import './App.css'

const categories = ['New In', 'Kitchen', 'Living', 'Lighting', 'Textile']

const featured = [
  {
    name: 'Wave Ceramic Vase',
    caption: 'Soft ivory glaze with hand-finished edge',
    price: '$42',
  },
  {
    name: 'Oak Folding Tray',
    caption: 'Compact serving tray for tea rituals',
    price: '$58',
  },
  {
    name: 'Linen Aroma Pouch',
    caption: 'Natural fabric with cedar blend scent',
    price: '$16',
  },
  {
    name: 'Matte Stone Cup Set',
    caption: 'Set of 2, warm gray texture',
    price: '$28',
  },
]

function App() {
  return (
    <div className="page-shell">
      <div className="grain" aria-hidden="true" />

      <header className="topbar reveal">
        <p className="brand">Sopumshop</p>
        <nav>
          <a href="#collection">Collection</a>
          <a href="#story">Story</a>
          <a href="#visit">Visit</a>
        </nav>
      </header>

      <main>
        <section className="hero reveal">
          <p className="eyebrow">Curated Home Objects</p>
          <h1>작은 물건이 만드는 조용한 분위기</h1>
          <p className="hero-copy">
            따뜻한 톤의 세라믹, 패브릭, 우드 오브제를 모아 매일의 공간을
            정돈된 감도로 채웁니다.
          </p>
          <div className="hero-actions">
            <button type="button">Shop Now</button>
            <a href="#collection">View Curation</a>
          </div>
        </section>

        <section className="categories reveal" aria-label="categories">
          {categories.map((category) => (
            <span key={category}>{category}</span>
          ))}
        </section>

        <section id="collection" className="featured-grid reveal">
          {featured.map((item, idx) => (
            <article className="product-card" key={item.name} style={{ '--d': `${idx * 70}ms` }}>
              <div className="thumb" />
              <p className="product-name">{item.name}</p>
              <p className="product-caption">{item.caption}</p>
              <p className="product-price">{item.price}</p>
            </article>
          ))}
        </section>

        <section id="story" className="story reveal">
          <div>
            <p className="eyebrow">About The Edit</p>
            <h2>Inside mood, everyday practicality</h2>
            <p>
              insideobject 같은 무드의 편집샵 감성을 참고해, 과한 장식 대신 소재와
              균형감에 집중한 셀렉션으로 구성했습니다.
            </p>
          </div>
          <div className="note-box">
            <p>Weekly Drop</p>
            <strong>Thursday 8PM</strong>
            <span>Limited handmade pieces</span>
          </div>
        </section>

        <section id="visit" className="newsletter reveal">
          <p className="eyebrow">Newsletter</p>
          <h3>신규 입고 소식을 가장 먼저 받아보세요</h3>
          <form>
            <input type="email" placeholder="you@example.com" aria-label="email" />
            <button type="submit">Subscribe</button>
          </form>
        </section>
      </main>
    </div>
  )
}

export default App
