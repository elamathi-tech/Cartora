import { useEffect, useState } from "react";
import API_BASE_URL from '../config/api'
import ProductCard from '../components/ProductCard.jsx'
import './Shop.css'

function Shop() {
  const [products, setProducts] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    async function fetchProducts() {
      try {
        const response = await fetch(`${API_BASE_URL}/api/products`)
        const data = await response.json()

        if(data.success) {
          setProducts(data.products)
        }
      } catch (error) {
        console.error('Error fetching products:', error)
      }
    }

    fetchProducts()
  }, [])

  const categories = [
    'All',
    ...new Set(products.map((product) => product.category)),
  ]

  const filteredProducts = products.filter((product) => {
    const matchesSearch = product.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase())

      const matchesCategory = 
        selectedCategory === 'All' || 
        product.category === selectedCategory

        return matchesSearch && matchesCategory
  })

  return (
    <main className="shop-page">
      <section className="shop-heading">
        <p className="eyebrow">THE CARTORA COLLECTION</p>
        <h1>Find your <em>everyday favourite.</em></h1>
        <p>
          Explore considered finds across fashion, technology, home and entertainment.
        </p>
      </section>

      <section className="shop-products">
        <div className="shop-controls">
          <input 
            type="search"
            placeholder="Search products..."
            aria-label="Search products"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
          />

          <div className="category-filters">
            {categories.map((category) => (
              <button
                key={category}
                type="button"
                className={
                  selectedCategory === category ? 'active' : ''
                }
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="shop-results">
          <h2>
            {selectedCategory === 'All' ? 'All products' : selectedCategory}
          </h2>
          <p>{filteredProducts.length} products</p>
        </div>

        {filteredProducts.length > 0 ? (
          <div className="product-grid">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ):(
          <p className="no-products">
            No products found. Try another search.
          </p>
        )}
      </section>
    </main>
  )
}

export default Shop