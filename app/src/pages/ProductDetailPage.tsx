import { useState } from 'react';
import { ArrowLeft, Heart, Share2, Star } from 'lucide-react';
import { useParams } from 'react-router-dom';
import { toast } from 'sonner';
import { collections } from '../data/collections';
import { getWishlistIds, toggleWishlistItem } from '../lib/shop-storage';
import { useCart } from '../context/CartContext';

function detectMetal(name: string) {
  const lower = name.toLowerCase();
  if (lower.includes('platinum')) return 'Platinum';
  if (lower.includes('yellow gold') || lower.includes('22k gold')) return 'Yellow Gold';
  if (lower.includes('rose gold')) return 'Rose Gold';
  return 'White Gold';
}

function formatCurrency(value: number) {
  return `$${value.toLocaleString('en-US', { maximumFractionDigits: 0 })}`;
}

const metalOptions = [
  { id: '14k-white', label: '14k', metal: 'White Gold', multiplier: 1 },
  { id: '14k-yellow', label: '14k', metal: 'Yellow Gold', multiplier: 1.03 },
  { id: '14k-rose', label: '14k', metal: 'Rose Gold', multiplier: 1.04 },
  { id: 'platinum', label: 'Pt', metal: 'Platinum', multiplier: 1.12 },
] as const;

const caratOptions = [
  { value: '2', multiplier: 0.72 },
  { value: '3', multiplier: 0.82 },
  { value: '4', multiplier: 0.92 },
  { value: '5', multiplier: 1 },
  { value: '6', multiplier: 1.12 },
  { value: '7', multiplier: 1.24 },
  { value: '8', multiplier: 1.36 },
  { value: '9.5', multiplier: 1.52 },
  { value: '11', multiplier: 1.7 },
] as const;

function ProductDetailPage() {
  const params = useParams();
  const slug = params.slug ?? '';
  const productId = Number(params.productId);
  const { addToCart } = useCart();
  const collection = collections.find((item) => item.slug === slug);
  const product = collection?.products.find((item) => item.id === productId);

  const inferredMetal = detectMetal(product?.name ?? '');
  const defaultMetal =
    metalOptions.find((option) => option.metal === inferredMetal)?.id ?? '14k-white';
  const defaultDiamondType = product?.badges.includes('Lab Grown')
    ? 'Lab-Grown Diamond'
    : 'Natural Diamond';
  const [selectedMetalOption, setSelectedMetalOption] = useState<string>(defaultMetal);
  const [selectedCaratWeight, setSelectedCaratWeight] = useState('5');
  const [selectedRingSize, setSelectedRingSize] = useState('');
  const [selectedDiamondType, setSelectedDiamondType] = useState(defaultDiamondType);
  const [wishlistIds, setWishlistIds] = useState<number[]>(() => getWishlistIds());
  const [cartMessage, setCartMessage] = useState('');

  if (!collection || !product) {
    window.location.replace('/');
    return null;
  }

  const basePrice = Number(product.price.replace(/[^0-9.]/g, ''));
  const metalMultiplier =
    metalOptions.find((option) => option.id === selectedMetalOption)?.multiplier ?? 1;
  const selectedMetal =
    metalOptions.find((option) => option.id === selectedMetalOption)?.metal ?? inferredMetal;
  const caratMultiplier =
    caratOptions.find((option) => option.value === selectedCaratWeight)?.multiplier ?? 1;
  const diamondMultiplier = selectedDiamondType === 'Natural Diamond' ? 1.18 : 1;
  const calculatedPrice = Math.round((basePrice * metalMultiplier * caratMultiplier * diamondMultiplier) / 10) * 10;
  const calculatedWidth = (3 + Number(selectedCaratWeight) * 0.2).toFixed(2);

  const diamondType = selectedDiamondType;
  const gallery = [product.image, product.hoverImage, collection.image, '/featured-detail.jpg'];
  const ringSizes = ['2', '3', '4', '5', '6', '7', '8', '9.5', '11'];
  const isProductAvailable = ringSizes.length > 0;
  const similarProducts = collection.products.filter((item) => item.id !== product.id).slice(0, 4);

  const handleAddToCart = () => {
    if (!selectedRingSize) {
      setCartMessage('Please select a ring size before adding to cart.');
      return;
    }
    addToCart({
      productId: product.id,
      name: product.name,
      image: product.image,
      unitPrice: calculatedPrice,
      quantity: 1,
      selection: {
        metal: selectedMetal,
        size: selectedRingSize,
        carat: Number(selectedCaratWeight),
        diamondType: selectedDiamondType,
      },
    });
    setCartMessage(
      `Added to cart: ${selectedMetal}, ${selectedCaratWeight} ct. tw., ${diamondType}, size ${selectedRingSize}.`
    );
    toast.success(`${product.name} added to cart.`);
  };

  const handleToggleWishlist = (itemId: number) => {
    const isAdding = !wishlistIds.includes(itemId);
    const nextIds = toggleWishlistItem(itemId);
    setWishlistIds(nextIds);

    if (isAdding) {
      toast.success(`${product.name} added to wishlist.`);
    }
  };

  return (
    <div className="min-h-screen bg-charcoal text-white">
      <section className="section-padding py-5 border-b border-white/10">
        <div className="flex items-center justify-between text-sm">
          <a href={`/collections/${collection.slug}`} className="inline-flex items-center gap-2 text-gold hover:text-gold-light transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Back To Gallery
          </a>
          <button type="button" className="inline-flex items-center gap-2 text-gray-300 hover:text-gold transition-colors">
            <Share2 className="w-4 h-4" />
            Share
          </button>
        </div>
      </section>

      <section className="section-padding py-6">
        <div className="grid lg:grid-cols-[1.45fr_1fr] gap-8 items-start">
          <div>
            <div className="grid sm:grid-cols-2 gap-3">
              {gallery.map((photo, index) => (
                <div key={`${photo}-${index}`} className="bg-charcoal-light border border-white/10 overflow-hidden">
                  <img
                    src={photo}
                    alt={`${product.name} preview ${index + 1}`}
                    className="w-full h-full object-cover aspect-square"
                  />
                </div>
              ))}
            </div>

            <div className="mt-4 border border-white/10 bg-charcoal-light">
              <div className="grid grid-cols-2 text-sm">
                <div className="p-3 border-b border-white/10 text-gray-300">Stock Number</div>
                <div className="p-3 border-b border-white/10 text-right text-white">601572W1412L60</div>
                <div className="p-3 border-b border-white/10 text-gray-300">Metal</div>
                <div className="p-3 border-b border-white/10 text-right text-white">14K {selectedMetal}</div>
                <div className="p-3 border-b border-white/10 text-gray-300">Width</div>
                <div className="p-3 border-b border-white/10 text-right text-white">{calculatedWidth}mm</div>
                <div className="p-3 text-gray-300">Rhodium Finish</div>
                <div className="p-3 text-right text-white">Yes</div>
              </div>
              <button type="button" className="w-full text-left px-3 py-2 border-t border-white/10 text-sm text-gold hover:text-gold-light transition-colors">
                + Show More
              </button>
            </div>
          </div>

          <div className="bg-charcoal-light border border-white/10 p-5 lg:sticky lg:top-6">
            <div className="flex items-start justify-between gap-3">
              <h1 className="font-serif text-2xl leading-snug text-white max-w-[92%]">{product.name}</h1>
              <button
                type="button"
                onClick={() => handleToggleWishlist(product.id)}
                className="text-gray-300 hover:text-gold transition-colors"
                aria-label="Add to wishlist"
              >
                <Heart className={`w-5 h-5 ${wishlistIds.includes(product.id) ? 'fill-gold text-gold' : ''}`} />
              </button>
            </div>

            <div className="mt-3 flex items-center gap-1.5 text-gold">
              <div className="flex items-center gap-0.5">
                {Array.from({ length: 5 }).map((_, starIndex) => (
                  <Star
                    key={`detail-star-${starIndex}`}
                    className={`w-4 h-4 ${starIndex < product.rating ? 'fill-current' : 'text-white/30'}`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-300">({product.reviews})</span>
            </div>

            <p className="text-4xl font-semibold text-gold mt-6">{formatCurrency(calculatedPrice)}</p>

            <div className="mt-6 pt-5 border-t border-white/10 space-y-4">
              <div>
                <div className="flex items-center justify-between border border-white/20 px-3 py-2.5">
                  <span className="text-sm text-gray-300">Ring Size:</span>
                  <select
                    value={selectedRingSize}
                    onChange={(event) => setSelectedRingSize(event.target.value)}
                    className="bg-transparent text-sm text-white focus:outline-none"
                  >
                    <option value="" disabled>
                      Select
                    </option>
                    {ringSizes.map((size) => (
                      <option key={`select-${size}`} value={size} className="bg-charcoal text-white">
                        {size}
                      </option>
                    ))}
                  </select>
                </div>
                <p className="text-xs text-gray-400 mt-2">*This ring cannot be resized</p>
              </div>

              <p className={`text-sm font-medium ${isProductAvailable ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isProductAvailable ? 'Product is Available' : 'Product is Currently Unavailable'}
              </p>
              <a href="#" className="inline-flex text-sm text-gold hover:text-gold-light transition-colors">
                Free Overnight Shipping Hassle-Free Returns
              </a>

              <button
                type="button"
                onClick={handleAddToCart}
                disabled={!selectedRingSize}
                className="w-full h-12 bg-gold text-charcoal font-semibold tracking-wide hover:bg-gold-light transition-colors"
              >
                ADD TO CART
              </button>
              <button
                type="button"
                className="w-full h-12 border border-white/30 text-white hover:border-gold hover:text-gold transition-colors"
              >
                CONSULT AN EXPERT
              </button>

              {cartMessage && (
                <p className="text-xs text-gold">{cartMessage}</p>
              )}
            </div>

            <div className="mt-6 pt-6 border-t border-white/10 space-y-6">
              <div>
                <p className="text-xl text-white">
                  Metal Type: <span className="text-gold font-semibold">{selectedMetal}</span>
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {metalOptions.map((variant) => (
                    <button
                      key={variant.id}
                      type="button"
                      onClick={() => setSelectedMetalOption(variant.id)}
                      className={`h-11 w-16 border text-sm ${
                        selectedMetalOption === variant.id
                          ? 'border-gold text-gold bg-gold/10'
                          : 'border-white/20 text-gray-300 hover:border-gold/60 hover:text-gold'
                      }`}
                    >
                      {variant.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xl text-white">
                  Total Carat Weight: <span className="text-gold font-semibold">{selectedCaratWeight} ct. tw. {formatCurrency(calculatedPrice)}</span>
                </p>
                <div className="mt-3 grid grid-cols-5 sm:grid-cols-9 gap-2">
                  {caratOptions.map((size) => (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => setSelectedCaratWeight(size.value)}
                      className={`h-11 border text-sm ${
                        size.value === selectedCaratWeight
                          ? 'border-gold text-gold bg-gold/10'
                          : 'border-white/20 text-gray-300 hover:border-gold/60 hover:text-gold'
                      }`}
                    >
                      {size.value}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <p className="text-xl text-white">
                  Diamond Type: <span className="text-gold font-semibold">{diamondType}</span>
                </p>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedDiamondType('Natural Diamond')}
                    className={`h-12 border text-sm ${
                      diamondType === 'Natural Diamond'
                        ? 'border-gold text-gold bg-gold/10'
                        : 'border-white/20 text-gray-300 hover:border-gold/60 hover:text-gold'
                    }`}
                  >
                    Natural
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedDiamondType('Lab-Grown Diamond')}
                    className={`h-12 border text-sm ${
                      diamondType === 'Lab-Grown Diamond'
                        ? 'border-gold text-gold bg-gold/10'
                        : 'border-white/20 text-gray-300 hover:border-gold/60 hover:text-gold'
                    }`}
                  >
                    Lab-Grown
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      <section className="section-padding pb-12">
        <h2 className="font-serif text-3xl text-white mb-6">Similar Items</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {similarProducts.map((item) => (
            <article
              key={item.id}
              className="group bg-white/[0.04] border border-white/10 rounded-sm overflow-hidden hover:border-gold/50 transition-colors"
            >
              <a href={`/collections/${collection.slug}/product/${item.id}`} className="block">
                <div className="relative aspect-[4/4.2] bg-black/30 overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-100 group-hover:opacity-0 group-hover:scale-105"
                  />
                  <img
                    src={item.hoverImage}
                    alt={`${item.name} worn by model`}
                    className="absolute inset-0 w-full h-full object-cover transition-all duration-500 opacity-0 group-hover:opacity-100 group-hover:scale-105"
                  />
                  <button
                    type="button"
                    onClick={(event) => {
                      event.preventDefault();
                      event.stopPropagation();
                      handleToggleWishlist(item.id);
                    }}
                    className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-charcoal/80 border border-white/25 text-white flex items-center justify-center"
                    aria-label="Toggle wishlist"
                  >
                    <Heart className={`w-4 h-4 ${wishlistIds.includes(item.id) ? 'fill-gold text-gold' : ''}`} />
                  </button>
                </div>

                <div className="p-3.5">
                  <h3 className="font-serif text-[0.95rem] leading-snug text-white min-h-[2.8rem]">
                    {item.name}
                  </h3>
                  <p className="text-lg text-gold mt-1">{item.price}</p>

                  <div className="mt-2.5 flex items-center gap-1.5 text-gold">
                    <div className="flex items-center gap-0.5">
                      {Array.from({ length: 5 }).map((_, starIndex) => (
                        <Star
                          key={`${item.id}-similar-star-${starIndex}`}
                          className={`w-3.5 h-3.5 ${starIndex < item.rating ? 'fill-current' : 'text-white/30'}`}
                        />
                      ))}
                    </div>
                    <span className="text-xs text-gray-300">({item.reviews})</span>
                  </div>
                </div>
              </a>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

export default ProductDetailPage;
