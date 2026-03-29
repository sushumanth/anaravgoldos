import { useEffect, useMemo, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { signOutAdmin } from '@/lib/admin-auth';
import { categories, products, type MetalType, type Product } from '@/data/catalog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { mergeJewelryOnModel } from '@/lib/admin-image-merge';

const ADMIN_PRODUCTS_KEY = 'ag_admin_products';

function getStoredAdminProducts() {
  if (typeof window === 'undefined') {
    return [] as Product[];
  }

  try {
    const raw = window.localStorage.getItem(ADMIN_PRODUCTS_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as Product[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveAdminProducts(value: Product[]) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ADMIN_PRODUCTS_KEY, JSON.stringify(value));
}

const metalOptions: MetalType[] = ['Gold', 'Diamond', 'Platinum'];

export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [adminProducts, setAdminProducts] = useState<Product[]>([]);
  const [name, setName] = useState('');
  const [category, setCategory] = useState(categories[0]?.name ?? 'Rings');
  const [price, setPrice] = useState('');
  const [metal, setMetal] = useState<MetalType>('Gold');
  const [isNew, setIsNew] = useState(true);
  const [isBestSeller, setIsBestSeller] = useState(false);
  const [engravable, setEngravable] = useState(false);
  const [jewelryFile, setJewelryFile] = useState<File | null>(null);
  const [modelFile, setModelFile] = useState<File | null>(null);
  const [jewelryPreview, setJewelryPreview] = useState('');
  const [modelPreview, setModelPreview] = useState('');
  const [generatedNormalImage, setGeneratedNormalImage] = useState('');
  const [generatedHoverImage, setGeneratedHoverImage] = useState('');
  const [isMergingImages, setIsMergingImages] = useState(false);
  const [useManualPlacement, setUseManualPlacement] = useState(false);
  const [necklaceCenterX, setNecklaceCenterX] = useState(0.5);
  const [necklaceCenterY, setNecklaceCenterY] = useState(0.6);
  const [necklaceWidthRatio, setNecklaceWidthRatio] = useState(0.45);
  const [verticalOffsetRatio, setVerticalOffsetRatio] = useState(0.3);

  useEffect(() => {
    setAdminProducts(getStoredAdminProducts());
  }, []);

  const productsByCategory = useMemo(() => {
    const grouped: Record<string, Product[]> = {};

    adminProducts.forEach((item) => {
      if (!grouped[item.category]) {
        grouped[item.category] = [];
      }
      grouped[item.category].push(item);
    });

    return grouped;
  }, [adminProducts]);

  const selectedCategoryProducts = useMemo(() => {
    return adminProducts.filter((item) => item.category === category);
  }, [adminProducts, category]);

  function handleImageChange(
    event: ChangeEvent<HTMLInputElement>,
    type: 'jewelry' | 'model',
  ) {
    const file = event.target.files?.[0];
    if (!file) {
      if (type === 'jewelry') {
        setJewelryFile(null);
        setJewelryPreview('');
      } else {
        setModelFile(null);
        setModelPreview('');
      }
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      if (type === 'jewelry') {
        setJewelryFile(file);
        setJewelryPreview(result);
      } else {
        setModelFile(file);
        setModelPreview(result);
      }

      setGeneratedNormalImage('');
      setGeneratedHoverImage('');
    };
    reader.readAsDataURL(file);
  }

  async function handleGenerateImages() {
    if (!jewelryFile || !modelFile) {
      toast.error('Please upload both jewelry and model images first.');
      return;
    }

    setIsMergingImages(true);

    try {
      const result = await mergeJewelryOnModel(
        jewelryFile,
        modelFile,
        useManualPlacement
          ? {
              necklaceCenterX,
              necklaceCenterY,
              necklaceWidthRatio,
              verticalOffsetRatio,
            }
          : undefined,
      );
      setGeneratedNormalImage(result.normalImage);
      setGeneratedHoverImage(result.hoverImage);
      toast.success('Merged images generated successfully.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown merge error';
      toast.error(`Image merge failed: ${message}`);
    } finally {
      setIsMergingImages(false);
    }
  }

  function handleAddProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedPrice = Number(price);
    if (!name.trim()) {
      toast.error('Product name is required.');
      return;
    }

    if (!Number.isFinite(parsedPrice) || parsedPrice <= 0) {
      toast.error('Enter a valid product price.');
      return;
    }

    if (!generatedNormalImage || !generatedHoverImage) {
      toast.error('Generate normal and hover images before adding product.');
      return;
    }

    const allProducts = [...products, ...adminProducts];
    const nextId = allProducts.reduce((maxId, item) => Math.max(maxId, item.id), 0) + 1;

    const newProduct: Product = {
      id: nextId,
      name: name.trim(),
      category,
      price: parsedPrice,
      image: generatedNormalImage,
      hoverImage: generatedHoverImage,
      rating: 5,
      isNew,
      isBestSeller,
      engravable,
      metal,
      createdAt: new Date().toISOString().slice(0, 10),
    };

    const updated = [...adminProducts, newProduct];
    setAdminProducts(updated);
    saveAdminProducts(updated);

    setName('');
    setPrice('');
    setMetal('Gold');
    setIsNew(true);
    setIsBestSeller(false);
    setEngravable(false);
    setJewelryFile(null);
    setModelFile(null);
    setJewelryPreview('');
    setModelPreview('');
    setGeneratedNormalImage('');
    setGeneratedHoverImage('');

    toast.success('Product added successfully.');
  }

  function handleLogout() {
    signOutAdmin();
    toast.success('Logged out');
    navigate('/admin/login', { replace: true });
  }

  return (
    <main className="min-h-screen bg-zinc-950 px-4 py-10 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <Card className="border-zinc-800 bg-zinc-900/70">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">Add Product</CardTitle>
            <p className="text-sm text-zinc-400">Add products with AI-style merged normal and hover images.</p>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleAddProduct}>
              <div className="space-y-2">
                <Label htmlFor="product-name">Product Name</Label>
                <Input
                  id="product-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Ex: Royal Diamond Ring"
                  required
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="product-category">Category</Label>
                  <select
                    id="product-category"
                    value={category}
                    onChange={(event) => setCategory(event.target.value)}
                    className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm outline-none focus:border-zinc-500"
                  >
                    {categories.map((item) => (
                      <option key={item.name} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="product-price">Price (INR)</Label>
                  <Input
                    id="product-price"
                    type="number"
                    min="1"
                    value={price}
                    onChange={(event) => setPrice(event.target.value)}
                    placeholder="Ex: 45000"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="product-metal">Metal Type</Label>
                <select
                  id="product-metal"
                  value={metal}
                  onChange={(event) => setMetal(event.target.value as MetalType)}
                  className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm outline-none focus:border-zinc-500"
                >
                  {metalOptions.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="jewelry-image">Jewelry Image</Label>
                  <Input
                    id="jewelry-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageChange(event, 'jewelry')}
                    required
                  />
                  {jewelryFile && <p className="text-xs text-zinc-400">Selected: {jewelryFile.name}</p>}
                  {jewelryPreview && (
                    <img
                      src={jewelryPreview}
                      alt="Jewelry preview"
                      className="h-28 w-28 rounded-md border border-zinc-700 object-cover"
                    />
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="model-image">Model Image</Label>
                  <Input
                    id="model-image"
                    type="file"
                    accept="image/*"
                    onChange={(event) => handleImageChange(event, 'model')}
                    required
                  />
                  {modelFile && <p className="text-xs text-zinc-400">Selected: {modelFile.name}</p>}
                  {modelPreview && (
                    <img
                      src={modelPreview}
                      alt="Model preview"
                      className="h-28 w-28 rounded-md border border-zinc-700 object-cover"
                    />
                  )}
                </div>
              </div>

              <div className="space-y-3 rounded-md border border-zinc-800 bg-zinc-950/60 p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm text-zinc-300">Generate merged product images using Python service</p>
                  <Button type="button" variant="outline" onClick={handleGenerateImages} disabled={isMergingImages}>
                    {isMergingImages ? 'Generating...' : 'Generate Normal + Hover'}
                  </Button>
                </div>

                <label className="flex items-center gap-2 rounded-md border border-zinc-800 p-2 text-sm text-zinc-300">
                  <input
                    type="checkbox"
                    checked={useManualPlacement}
                    onChange={(event) => setUseManualPlacement(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Use manual neck placement controls
                </label>

                {useManualPlacement && (
                  <div className="grid gap-3 sm:grid-cols-2">
                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Neck center X: {necklaceCenterX.toFixed(2)}</p>
                      <input
                        type="range"
                        min="0.2"
                        max="0.8"
                        step="0.01"
                        value={necklaceCenterX}
                        onChange={(event) => setNecklaceCenterX(Number(event.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Neck center Y: {necklaceCenterY.toFixed(2)}</p>
                      <input
                        type="range"
                        min="0.35"
                        max="0.85"
                        step="0.01"
                        value={necklaceCenterY}
                        onChange={(event) => setNecklaceCenterY(Number(event.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Necklace width ratio: {necklaceWidthRatio.toFixed(2)}</p>
                      <input
                        type="range"
                        min="0.2"
                        max="0.8"
                        step="0.01"
                        value={necklaceWidthRatio}
                        onChange={(event) => setNecklaceWidthRatio(Number(event.target.value))}
                        className="w-full"
                      />
                    </div>

                    <div className="space-y-1">
                      <p className="text-xs text-zinc-400">Vertical offset: {verticalOffsetRatio.toFixed(2)}</p>
                      <input
                        type="range"
                        min="0.05"
                        max="0.8"
                        step="0.01"
                        value={verticalOffsetRatio}
                        onChange={(event) => setVerticalOffsetRatio(Number(event.target.value))}
                        className="w-full"
                      />
                    </div>
                  </div>
                )}

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-zinc-400">Normal Image</p>
                    {generatedNormalImage ? (
                      <img
                        src={generatedNormalImage}
                        alt="Generated normal"
                        className="h-36 w-full rounded-md border border-zinc-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-zinc-700 text-xs text-zinc-500">
                        Not generated yet
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    <p className="text-xs uppercase tracking-wide text-zinc-400">Hover Image</p>
                    {generatedHoverImage ? (
                      <img
                        src={generatedHoverImage}
                        alt="Generated hover"
                        className="h-36 w-full rounded-md border border-zinc-700 object-cover"
                      />
                    ) : (
                      <div className="flex h-36 items-center justify-center rounded-md border border-dashed border-zinc-700 text-xs text-zinc-500">
                        Not generated yet
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                <label className="flex items-center gap-2 rounded-md border border-zinc-800 p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isNew}
                    onChange={(event) => setIsNew(event.target.checked)}
                    className="h-4 w-4"
                  />
                  New
                </label>
                <label className="flex items-center gap-2 rounded-md border border-zinc-800 p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={isBestSeller}
                    onChange={(event) => setIsBestSeller(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Best Seller
                </label>
                <label className="flex items-center gap-2 rounded-md border border-zinc-800 p-2 text-sm">
                  <input
                    type="checkbox"
                    checked={engravable}
                    onChange={(event) => setEngravable(event.target.checked)}
                    className="h-4 w-4"
                  />
                  Engravable
                </label>
              </div>

              <Button type="submit" className="w-full">
                Add Product
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="flex flex-col gap-4">
          <Card className="border-zinc-800 bg-zinc-900/70">
            <CardHeader className="space-y-2">
              <CardTitle className="text-xl">Category Wise Added Products</CardTitle>
              <p className="text-sm text-zinc-400">Showing products added from admin panel for selected category.</p>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="filter-category">Select Category</Label>
                <select
                  id="filter-category"
                  value={category}
                  onChange={(event) => setCategory(event.target.value)}
                  className="h-9 w-full rounded-md border border-zinc-700 bg-zinc-950 px-3 text-sm outline-none focus:border-zinc-500"
                >
                  {categories.map((item) => (
                    <option key={item.name} value={item.name}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              {selectedCategoryProducts.length === 0 && (
                <p className="rounded-md border border-dashed border-zinc-700 p-3 text-sm text-zinc-400">
                  No admin-added products in {category} yet.
                </p>
              )}

              {selectedCategoryProducts.length > 0 && (
                <ul className="space-y-2">
                  {selectedCategoryProducts.map((item) => (
                    <li key={item.id} className="rounded-md border border-zinc-800 bg-zinc-950/70 p-3">
                      <p className="font-medium text-zinc-100">{item.name}</p>
                      <p className="text-sm text-zinc-400">INR {item.price.toLocaleString('en-IN')}</p>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>
          </Card>

          <Card className="border-zinc-800 bg-zinc-900/70">
            <CardHeader>
              <CardTitle className="text-xl">Session Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-3">
                <Button asChild variant="secondary">
                  <Link to="/">Go to Storefront</Link>
                </Button>
                <Button variant="outline" onClick={handleLogout}>
                  Logout
                </Button>
              </div>
              <p className="mt-3 text-xs text-zinc-400">
                Total admin-added products: {adminProducts.length}. Categories used: {Object.keys(productsByCategory).length}.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
