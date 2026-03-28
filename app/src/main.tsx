import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { Toaster } from 'sonner'
import './index.css'
import App from './App.tsx'
import CategoryPage from './pages/CategoryPage.tsx'
import ProductPage from './pages/ProductPage.tsx'
import CartPage from './pages/CartPage.tsx'
import CollectionPage from './pages/CollectionPage.tsx'
import ProductDetailPage from './pages/ProductDetailPage.tsx'
import WishlistPage from './pages/WishlistPage.tsx'
import { CartProvider } from './context/CartContext.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/collections/:slug/product/:productId" element={<ProductDetailPage />} />
          <Route path="/collection/:slug" element={<CollectionPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors theme="dark" />
    </CartProvider>
  </StrictMode>,
)
