import { useMemo, useState } from 'react';
import { ArrowLeft, Heart, Trash2 } from 'lucide-react';
import { collections } from '../data/collections';
import { clearWishlist, getWishlistIds, removeWishlistItem } from '../lib/shop-storage';

type WishlistProduct = {
  id: number;
  name: string;
  price: number;
  image: string;
  href: string;
};

function formatPrice(value: number) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

function WishlistPage() {
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => getWishlistIds());

  const wishlistProducts = useMemo(() => {
    const productMap = new Map<number, WishlistProduct>();
    for (const collection of collections) {
      for (const product of collection.products) {
        productMap.set(product.id, {
          id: product.id,
          name: product.name,
          price: Number(product.price.replace(/[^0-9.]/g, '')),
          image: product.image,
          href: `/collections/${collection.slug}/product/${product.id}`,
        });
      }
    }

    return wishlistIds
      .map((id) => productMap.get(id))
      .filter((item): item is WishlistProduct => Boolean(item));
  }, [wishlistIds]);

  const removeItem = (id: number) => {
    setWishlistIds(removeWishlistItem(id));
  };

  const clearAll = () => {
    setWishlistIds(clearWishlist());
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
        <h1 className="font-serif text-3xl md:text-4xl text-white mb-5">Your Wishlist</h1>

        {wishlistProducts.length === 0 ? (
          <div className="border border-white/10 bg-charcoal-light p-6 rounded-2xl">
            <p className="text-gray-300 mb-4">Your wishlist is empty.</p>
            <a href="/" className="text-gold hover:text-gold-light transition-colors">
              Explore products
            </a>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {wishlistProducts.map((product) => (
                <article key={product.id} className="border border-white/15 bg-charcoal-light p-3.5 rounded-2xl hover:border-gold/40 transition-colors">
                  <a href={product.href} className="block group">
                    <div className="aspect-square bg-black/20 overflow-hidden rounded-xl">
                      <img
                        src={product.image}
                        alt={product.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                  </a>

                  <div className="mt-3">
                    <p className="font-serif text-lg text-white mb-1 leading-snug">{product.name}</p>
                    <p className="text-gold text-base">{formatPrice(product.price)}</p>
                  </div>

                  <div className="mt-3 flex items-center gap-2.5">
                    <a
                      href={product.href}
                      className="flex-1 h-9 border border-gold text-gold text-sm inline-flex items-center justify-center rounded-lg hover:bg-gold hover:text-charcoal transition-colors"
                    >
                      View Product
                    </a>
                    <button
                      type="button"
                      onClick={() => removeItem(product.id)}
                      className="h-9 w-9 border border-white/25 inline-flex items-center justify-center rounded-lg hover:border-gold hover:text-gold transition-colors"
                      aria-label="Remove from wishlist"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <span className="h-9 w-9 border border-white/25 inline-flex items-center justify-center text-gold rounded-lg">
                      <Heart className="w-4 h-4 fill-gold" />
                    </span>
                  </div>
                </article>
              ))}
            </div>

            <div className="mt-5">
              <button
                type="button"
                onClick={clearAll}
                className="h-10 px-4 text-sm border border-white/25 rounded-lg hover:border-gold hover:text-gold transition-colors"
              >
                Clear Wishlist
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}

export default WishlistPage;

