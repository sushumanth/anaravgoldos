import { Link } from 'react-router-dom';
import { ArrowLeft, CreditCard, ShoppingBag } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { CartItemCard } from '@/components/cart/CartItemCard';
import { useCart } from '@/context/CartContext';

function CartPage() {
  const { cartItems, totalItems, subtotal, updateQuantity, removeFromCart, clearCart } = useCart();

  const formatPrice = (value: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(value);

  const shipping = subtotal > 150000 ? 0 : (totalItems > 0 ? 1200 : 0);
  const estimatedTotal = subtotal + shipping;

  return (
    <main className="min-h-screen bg-charcoal text-white page-fade-in pb-24 md:pb-12">
      <section className="section-padding pt-12 md:pt-14 pb-3 md:pb-4 border-b border-white/5 bg-charcoal-light/45">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Continue Shopping
          </Link>
          <p className="text-sm text-gray-300">{totalItems} items</p>
        </div>
      </section>

      <section className="section-padding pt-4 md:pt-6 pb-10">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_340px] gap-6 lg:gap-8">
          <div className="space-y-4">
            <h1 className="font-serif text-3xl md:text-4xl">Your Cart</h1>

            {cartItems.length === 0 && (
              <div className="border border-white/10 bg-charcoal-light p-10 text-center">
                <ShoppingBag className="w-10 h-10 text-gold mx-auto mb-4" />
                <h2 className="font-serif text-2xl mb-2">Cart is Empty</h2>
                <p className="text-gray-400 mb-6">Add a jewelry piece to begin your order.</p>
                <Link to="/" className="btn-primary-luxury inline-flex items-center gap-2">
                  Explore Collection
                </Link>
              </div>
            )}

            {cartItems.length > 0 && (
              <>
                <div className="space-y-4">
                  {cartItems.map((item) => (
                    <CartItemCard
                      key={item.key}
                      item={item}
                      onIncrease={() => updateQuantity(item.key, item.quantity + 1)}
                      onDecrease={() => updateQuantity(item.key, item.quantity - 1)}
                      onRemove={() => removeFromCart(item.key)}
                    />
                  ))}
                </div>

                <Button
                  variant="outline"
                  onClick={clearCart}
                  className="border-white/20 text-white hover:border-rose-400 hover:text-rose-300"
                >
                  Clear Cart
                </Button>
              </>
            )}
          </div>

          <aside className="h-fit lg:sticky lg:top-24 border border-white/10 bg-charcoal-light p-5">
            <h2 className="font-serif text-2xl mb-5">Order Summary</h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between text-gray-300">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>Total Items</span>
                <span>{totalItems}</span>
              </div>
              <div className="flex items-center justify-between text-gray-300">
                <span>Estimated Shipping</span>
                <span>{shipping === 0 ? 'Free' : formatPrice(shipping)}</span>
              </div>
              <div className="border-t border-white/10 pt-3 flex items-center justify-between text-white text-base font-medium">
                <span>Estimated Total</span>
                <span className="text-gold">{formatPrice(estimatedTotal)}</span>
              </div>
            </div>

            <Button className="w-full mt-6 h-12 bg-gold text-charcoal font-semibold hover:bg-gold-light">
              <CreditCard className="w-4 h-4 mr-2" />
              Proceed To Checkout
            </Button>
            <p className="text-xs text-gray-500 mt-3">Secure checkout integration ready for payment gateway connection.</p>
          </aside>
        </div>
      </section>

      {cartItems.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 md:hidden z-40 border-t border-white/10 bg-charcoal/95 backdrop-blur-md p-3">
          <div className="section-padding !px-0 flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="text-xs text-gray-400">{totalItems} items</p>
              <p className="text-gold font-semibold">{formatPrice(estimatedTotal)}</p>
            </div>
            <Button className="h-11 bg-gold text-charcoal font-semibold hover:bg-gold-light">Checkout</Button>
          </div>
        </div>
      )}
    </main>
  );
}

export default CartPage;
