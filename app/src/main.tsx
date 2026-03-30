import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import type { ReactElement } from 'react'
import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom'
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
import AdminLoginPage from './pages/AdminLoginPage.tsx'
import AdminDashboardPage from './pages/AdminDashboardPage.tsx'
import { isAdminAuthenticated } from './lib/admin-auth.ts'

function ProtectedAdminRoute({ children }: { children: ReactElement }) {
  const location = useLocation()

  if (!isAdminAuthenticated()) {
    return <Navigate to="/admin/login" replace state={{ from: location }} />
  }

  return children
}

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' })
  }, [pathname])

  return null
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <CartProvider>
      <BrowserRouter>
        <ScrollToTop />
        <Routes>
          <Route path="/" element={<App />} />
          <Route path="/category/:categoryName" element={<CategoryPage />} />
          <Route path="/product/:productId" element={<ProductPage />} />
          <Route path="/collections/:slug" element={<CollectionPage />} />
          <Route path="/collections/:slug/product/:productId" element={<ProductDetailPage />} />
          <Route path="/collection/:slug" element={<CollectionPage />} />
          <Route path="/wishlist" element={<WishlistPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedAdminRoute>
                <AdminDashboardPage />
              </ProtectedAdminRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors theme="dark" />
    </CartProvider>
  </StrictMode>,
)
