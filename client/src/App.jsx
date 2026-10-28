import { Link, Routes, Route } from 'react-router-dom'
import { useCart } from './context/CartContext'
import Shop from './pages/Shop'
import Cart from './pages/Cart'
import Checkout from './pages/Checkout'
import ProductDetails from './pages/ProductDetails'
import Register from './pages/Register'
import Login from './pages/Login'
import Account from './pages/Account'
import AdminDashboard from './pages/AdminDashboard'
import AdminOrders from './pages/AdminOrders'
import './App.css'

const categories = [
  {
    number: '01',
    name: 'Fashion',
    description: 'Everyday essentials, elevated.',
    image: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?auto=format&fit=crop&w=900&q=80',
  },
  {
    number: '02',
    name: 'Electronics',
    description: 'Smart technology for modern life.',
    image: 'https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&w=900&q=80',
  },
  {
    number: '03',
    name: 'Home & Living',
    description: 'Make room for good living.',
    image: 'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=900&q=80',
  },
  {
    number: '04',
    name: 'Gaming',
    description: 'Level up your downtime.',
    image: 'https://images.unsplash.com/photo-1593305841991-05c297ba4575?auto=format&fit=crop&w=900&q=80',
  },
]



function Home() {

  return (
    <>
      <main>
        <section className='hero'>
          <div className='hero-copy'>
            <p className='eyebrow'>THOUGHTFULLY CREATED . EVERYDAY LIVING</p>
            <h1>Discover more.
              <br />
              <em>Shop smarter.</em>
            </h1>
            <p className='hero-description'>
              Good finds for every part of your life. Explore considered essentials across style, technology, home and more.
            </p>
            <Link className='primary-button' to='/shop'>
              Explore the collection <span aria-hidden="true">↗</span>
            </Link>
            <p className='hero-note'>A better kind of everyday shopping.</p>
          </div>

          <div className='hero-visual'>
            <img src='https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=1400&q=85' alt='A thoughtfully styled modern retail space' />
            <div className='hero-image-label'>
              <span>THE CARTORA EDIT</span>
              <span>NO. 001 — EVERYDAY FINDS</span>
            </div>
          </div>

          <div className='hero-index' aria-hidden="true">
            EST. FOR EVERYDAY
          </div>
        </section>

        <section className='category-section' id='categories'>
          <div className='section-heading'>
            <div>
              <p className='eyebrow'>A WORLD OF GOOD FINDS</p>
              <h2>Something for <em>every you.</em></h2>
            </div>
            <p>
              From your wardrobe to your living space, find things that fit your life.
            </p>
          </div>

          <div className='category-grid'>
            {categories.map((category) => (
              <Link
                className='category-card'
                to='/shop'
                key={category.number}
              >
                <div className='category-image'>
                  <img src={category.image} alt='' loading='lazy' />
                  <span className='category-number'>{category.number}</span>
                  <span className='category-arrow' aria-hidden="true">
                    ↗
                  </span>
                </div>
                <div className='category-info'>
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        <section className='editorial-strip' id='story'>
          <p className='eyebrow'>LESS SCROLLING. BETTER FINDING.</p>
          <h2>Everyday things, <em>considered differently.</em></h2>
          <p>
            A growing collection of useful, interesting and lovely finds, brought together in one place.
          </p>
        </section>

        <section className='featured-section' id="featured">
          <p className='eyebrow'>COMING INTO FOCUS</p>
          <h2>Your next favourite <em>is waiting.</em></h2>
          <p>
            We're putting together the collection. Check back soon for handpicked finds across all your favourite categories.
          </p>

          <Link className='primary-button' to='/shop'>
            Browse all products <span aria-hidden="true">↗</span></Link>
        </section>
      </main>
    </>
  )
}

function App() {
  const { cartCount } = useCart()

  const savedUser = localStorage.getItem('cartoraUser')
  const currentUser = savedUser ? JSON.parse(savedUser) : null

  return (
    <div className='cartora'>
      <div className='announcement'>
        A little something for your everyday. Discover your next favourite.
      </div>

      <header className='site-header'>
        <a className='brand' href='/' aria-label='Cartora home'>
          Cartora<span>.</span>
        </a>

        <nav className='main-nav' aria-label='Main navigation'>
          <Link to='/shop'>Shop by category</Link>
          <Link to='/#story'>Our approach</Link>
          <Link to='/featured'>Featured</Link>
        </nav>


        <div className="header-actions">
          {currentUser ? (
            <Link to="/account" className="header-account">
              My Account
            </Link>
          ) : (
            <Link to="/login" className="header-account">
              Sign in
            </Link>
          )}

          {currentUser?.role === 'admin' && (
            <Link to="/admin" className="header-account">
              Admin Dashboard
            </Link>
          )}

          <Link className="header-cart" to="/cart">
            Bag <span>{cartCount}</span>
          </Link>
        </div>

      </header>

      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/shop' element={<Shop />} />
        <Route path='product/:id' element={<ProductDetails />} />
        <Route path='/cart' element={<Cart />} />
        <Route path='/checkout' element={<Checkout />} />
        <Route path='/register' element={<Register />} />
        <Route path='/login' element={<Login />} />
        <Route path='/account' element={<Account />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/orders" element={<AdminOrders />} />
      </Routes>

      <footer className='site-footer'>
        <a className='brand' href='/'>
          cartora<span>.</span>
        </a>
        <p>Discover more. Shop smarter.</p>
        <p>© 2026 Cartora. Made for everyday living.</p>
      </footer>
    </div>
  )
}

export default App
