import {
  createContext,
  useContext,
  useState,
  useEffect
} from 'react'

import products from '../data/products'
import API_BASE_URL from '../config/api'


const CartContext = createContext()

async function loadBackendCart() {
  const token = localStorage.getItem('cartoraToken')

  if (!token) {
    return null
  }

  try {
    const response = await fetch(`${API_BASE_URL}/api/cart`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Failed to load cart.')
    }

    const backendItems = data.items || []

    return backendItems.map((item) => {
      const product = products.find(
        (product) => product.id === item.productId,
      )

      return {
        ...product,
        id: item.productId,
        name: item.name || product?.name,
        price: item.price ?? product?.price,
        image: item.image || product?.image,
        category: product?.category || '',
        quantity: item.quantity,
      }
    })
  } catch (error) {
    console.error('Could not load backend cart:', error)
    return null
  }
}

export function CartProvider({ children }) {

  const [cartItems, setCartItems] = useState(() => {
    try {
      const savedCart = localStorage.getItem('cartoraGuestCart')

      if (!savedCart) {
        return []
      }

      const parsedCart = JSON.parse(savedCart)

      return Array.isArray(parsedCart) ? parsedCart : []
    } catch (error) {
      console.error('Could not load saved guest cart:', error)
      localStorage.removeItem('cartoraGuestCart')
      return []
    }
  })



  useEffect(() => {
    if (!localStorage.getItem('cartoraToken')) {
      localStorage.setItem('cartoraGuestCart', JSON.stringify(cartItems))
    }
  }, [cartItems])



  useEffect(() => {
    let isActive = true

    async function syncCart() {
      const token = localStorage.getItem('cartoraToken')

      // Only load the backend cart for logged-in users.
      if (!token) {
        return
      }

      const backendItems = await loadBackendCart()

      if (isActive && backendItems !== null) {
        setCartItems(backendItems)
      }
    }

    syncCart()

    return () => {
      isActive = false
    }
  }, [])


  async function addToCart(product) {
    const token = localStorage.getItem('cartoraToken')

    // Guests continue using the local cart.
    if (!token) {
      setCartItems((currentItems) => {
        const existingItem = currentItems.find(
          (item) => item.id === product.id,
        )

        if (existingItem) {
          return currentItems.map((item) =>
            item.id === product.id
              ? { ...item, quantity: item.quantity + 1 }
              : item,
          )
        }

        return [...currentItems, { ...product, quantity: 1 }]
      })

      return
    }

    // Logged-in users save items to the backend.
    try {
      const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: product.id,
          quantity: 1,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not add item to cart.')
      }

      const backendItems = await loadBackendCart()

      if (backendItems !== null) {
        setCartItems(backendItems)
      }
    } catch (error) {
      console.error('Could not add item to backend cart:', error)
      alert(error.message || 'Could not add item to cart. Please try again.')
    }
  }

  async function increaseQuantity(productId) {
    const token = localStorage.getItem('cartoraToken')

    if (!token) {
      setCartItems((currentItems) =>
        currentItems.map((item) =>
          item.id === productId
            ? { ...item, quantity: item.quantity + 1 }
            : item,
        ),
      )
      return
    }

    const item = cartItems.find((item) => item.id === productId)

    if (!item) return

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${productId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            quantity: item.quantity + 1,
          }),
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not update quantity.')
      }

      const backendItems = await loadBackendCart()

      if (backendItems !== null) {
        setCartItems(backendItems)
      }
    } catch (error) {
      console.error('Could not increase quantity:', error)
      alert(error.message || 'Could not update quantity. Please try again.')
    }
  }


  async function decreaseQuantity(productId) {
    const token = localStorage.getItem('cartoraToken')

    if (!token) {
      setCartItems((currentItems) =>
        currentItems
          .map((item) =>
            item.id === productId
              ? { ...item, quantity: item.quantity - 1 }
              : item,
          )
          .filter((item) => item.quantity > 0),
      )
      return
    }

    const item = cartItems.find((item) => item.id === productId)

    if (!item) return

    try {
      const response =
        item.quantity === 1
          ? await fetch(
            `${API_BASE_URL}/api/cart/items/${productId}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )
          : await fetch(
            `${API_BASE_URL}/api/cart/items/${productId}`,
            {
              method: 'PUT',
              headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${token}`,
              },
              body: JSON.stringify({
                quantity: item.quantity - 1,
              }),
            },
          )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not decrease quantity.')
      }

      const backendItems = await loadBackendCart()

      if (backendItems !== null) {
        setCartItems(backendItems)
      }
    } catch (error) {
      console.error('Could not decrease quantity:', error)
      alert(error.message || 'Could not update quantity. Please try again.')
    }
  }



  async function removeFromCart(productId) {
    const token = localStorage.getItem('cartoraToken')

    if (!token) {
      setCartItems((currentItems) =>
        currentItems.filter((item) => item.id !== productId),
      )
      return
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/api/cart/items/${productId}`,
        {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not remove item.')
      }

      const backendItems = await loadBackendCart()

      if (backendItems !== null) {
        setCartItems(backendItems)
      }
    } catch (error) {
      console.error('Could not remove cart item:', error)
      alert(error.message || 'Could not remove item. Please try again.')
    }
  }


  function resetCartForLogout() {
    // Start with an empty cart after logout.
    setCartItems([])
  }


  async function clearCart() {
    const token = localStorage.getItem('cartoraToken')

    if (token) {
      try {
        const itemsToRemove = [...cartItems]

        for (const item of itemsToRemove) {
          const response = await fetch(
            `${API_BASE_URL}/api/cart/items/${item.id}`,
            {
              method: 'DELETE',
              headers: {
                Authorization: `Bearer ${token}`,
              },
            },
          )

          const data = await response.json()

          if (!response.ok) {
            throw new Error(data.message || 'Could not clear backend cart.')
          }
        }
      } catch (error) {
        console.error('Could not clear backend cart:', error)
        throw error
      }
    }

    setCartItems([])
  }


  async function syncCartAfterLogin() {
    const token = localStorage.getItem('cartoraToken')

    if (!token) {
      throw new Error('Please sign in first.')
    }

    
    // Read only the separate guest cart.
    let guestItems

    try {
      const savedGuestCart = localStorage.getItem('cartoraGuestCart')
      const parsedGuestCart = savedGuestCart
        ? JSON.parse(savedGuestCart)
        : []

      guestItems = Array.isArray(parsedGuestCart)
        ? parsedGuestCart
        : []
    } catch (error) {
      throw new Error(
        'Could not read your guest cart. Please try again.',
        { cause: error },
      )
    }


    // Merge guest items into the backend cart.
    for (const item of guestItems) {
      const response = await fetch(`${API_BASE_URL}/api/cart/items`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          productId: item.id,
          quantity: item.quantity,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Could not sync your cart.')
      }
    }

    // Load the combined cart from the backend.
    const backendItems = await loadBackendCart()

    if (backendItems === null) {
      throw new Error('Could not reload your cart. Please try again.')
    }

    // Clear guest items only after a successful merge.
    localStorage.removeItem('cartoraGuestCart')
    setCartItems(backendItems)
  }



  const cartCount = cartItems.reduce(
    (total, item) => total + item.quantity,
    0,
  )

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        cartCount,
        increaseQuantity,
        decreaseQuantity,
        removeFromCart,
        clearCart,
        syncCartAfterLogin,
        resetCartForLogout,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCart() {
  return useContext(CartContext)
}
