import { useMemo, useState } from 'react';
import { ArrowLeft, Minus, Plus, Trash2 } from 'lucide-react';
import {
  clearCart,
  getCartItems,
  removeCartItemByIndex,
  setCartItemQuantityByIndex,
  type CartItem,
} from '../lib/shop-storage';

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => getCartItems());

  const cartTotal = useMemo(
    () => cartItems.reduce((total, item) => total + item.price * item.quantity, 0),
    [cartItems]
  );

  const totalUnits = useMemo(
    () => cartItems.reduce((total, item) => total + item.quantity, 0),
    [cartItems]
  );

  const updateQuantity = (index: number, delta: number) => {
    const currentQuantity = cartItems[index]?.quantity ?? 1;
    const updated = setCartItemQuantityByIndex(index, currentQuantity + delta);
    setCartItems(updated);
  };

  const removeItem = (index: number) => {
    const updated = removeCartItemByIndex(index);
    setCartItems(updated);
  };

  const clearAll = () => {
    setCartItems(clearCart());
  };

  return (
    <div className="min-h-screen bg-charcoal text-white">
      <section className="section-padding py-4 border-b border-white/10">
        <a
          href="/"
          className="inline-flex items-center gap-2 text-sm text-gold hover:text-gold-light transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Continue Shopping
        </a>
      </section>

      <section className="section-padding py-7">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-5">
          <h1 className="font-serif text-3xl md:text-4xl text-white">Your Cart</h1>
          <div className="text-right text-sm text-gray-300">
            <p>{cartItems.length} products</p>
            <p>{totalUnits} total units</p>
          </div>
        </div>

        {cartItems.length === 0 ? (
          <div className="border border-white/10 bg-charcoal-light p-6 rounded-2xl">
            <p className="text-gray-300 mb-4">Your cart is empty.</p>
            <a href="/" className="text-gold hover:text-gold-light transition-colors">
              Start shopping
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {cartItems.map((item, index) => (
                <article
                  key={`${item.id}-${index}`}
                  className="border border-white/15 bg-charcoal-light p-3.5 rounded-2xl hover:border-gold/40 transition-colors"
                >
                  <div className="grid grid-cols-[84px_1fr_auto] gap-3 items-start">
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-[84px] h-[84px] object-cover border border-white/10 rounded-xl"
                    />

                    <div>
                      <h2 className="font-serif text-xl text-white mb-1 leading-tight line-clamp-2">{item.name}</h2>
                      <p className="text-xl text-gold mb-1.5">{formatPrice(item.price)}</p>

                      <div className="text-gray-300 text-sm space-y-0.5">
                        <p>Metal: {item.options?.metal ?? 'Gold'}</p>
                        <p>Carat: {item.options?.caratWeight ?? '3'} ct</p>
                        <p>Diamond: {item.options?.diamondType ?? 'Lab-Grown'}</p>
                        <p>Size: {item.options?.ringSize ?? 'Standard'}</p>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <div className="h-9 border border-white/20 inline-flex items-center rounded-lg overflow-hidden">
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, -1)}
                            className="h-full w-9 inline-flex items-center justify-center text-white hover:text-gold transition-colors"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-9 text-center text-sm">{item.quantity}</span>
                          <button
                            type="button"
                            onClick={() => updateQuantity(index, 1)}
                            className="h-full w-9 inline-flex items-center justify-center text-white hover:text-gold transition-colors"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeItem(index)}
                          className="h-9 px-3 border border-white/20 inline-flex items-center gap-2 text-sm rounded-lg hover:border-gold hover:text-gold transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                          Remove
                        </button>
                      </div>
                    </div>

                    <div className="text-xl text-white font-medium pt-0.5">
                      {formatPrice(item.price * item.quantity)}
                    </div>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
              <button
                type="button"
                onClick={clearAll}
                className="h-10 px-4 border border-white/25 text-sm rounded-lg hover:border-gold hover:text-gold transition-colors"
              >
                Clear Cart
              </button>
              <div className="text-right bg-charcoal-light border border-white/10 rounded-xl px-4 py-2">
                <p className="text-gray-400 text-sm">Cart Total</p>
                <p className="text-2xl text-gold font-semibold">{formatPrice(cartTotal)}</p>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default CartPage;
