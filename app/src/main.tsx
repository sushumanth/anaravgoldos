import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import CollectionPage from './pages/CollectionPage.tsx'
import ProductDetailPage from './pages/ProductDetailPage.tsx'
import CartPage from './pages/CartPage.tsx'
import WishlistPage from './pages/WishlistPage.tsx'

const path = window.location.pathname;
const isCartRoute = path === '/cart' || path === '/cart/';
const isWishlistRoute = path === '/wishlist' || path === '/wishlist/';
const productRouteMatch = path.match(/^\/collections\/([^/]+)\/product\/(\d+)\/?$/);
const collectionRouteMatch = path.match(/^\/collections\/([^/]+)\/?$/);

const productRoute = productRouteMatch
  ? {
      slug: decodeURIComponent(productRouteMatch[1]),
      productId: Number(productRouteMatch[2]),
    }
  : null;

const collectionSlug = collectionRouteMatch ? decodeURIComponent(collectionRouteMatch[1]) : null;

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isCartRoute ? (
      <CartPage />
    ) : isWishlistRoute ? (
      <WishlistPage />
    ) : productRoute ? (
      <ProductDetailPage slug={productRoute.slug} productId={productRoute.productId} />
    ) : collectionSlug ? (
      <CollectionPage slug={collectionSlug} />
    ) : (
      <App />
    )}
  </StrictMode>,
)
