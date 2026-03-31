import { supabase } from '@/lib/supabase';

type CategoryRow = {
  id: number;
  name: string;
  slug: string;
};

type CollectionRow = {
  id: number;
  name: string;
  slug: string;
  subtitle: string | null;
  description: string | null;
  image_url: string | null;
};

type ProductRow = {
  id: number;
  name: string;
  slug: string;
  base_price: number;
  image_url: string | null;
  hover_image_url: string | null;
  description: string | null;
  rating: number | null;
  is_new: boolean | null;
  is_best_seller: boolean | null;
  is_engravable: boolean | null;
  stock_quantity: number | null;
  created_at: string;
  category_id: number;
  collection_id: number | null;
};

type ProductImageRow = {
  image_url: string;
  sort_order: number;
};

type ProductMetalRow = {
  metal_type: string;
};

type RingSizeRow = {
  size_label: string;
  is_available: boolean;
};

type ProductOptionRow = {
  option_type: string;
  option_value: string;
};

export type ShopCategory = {
  id: number;
  name: string;
  slug: string;
};

export type ShopCollection = {
  id: number;
  name: string;
  slug: string;
  subtitle: string;
  description: string;
  image: string;
};

export type ShopProductCard = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  collectionSlug: string | null;
  price: number;
  image: string;
  hoverImage: string;
  rating: number;
  isNew: boolean;
  isBestSeller: boolean;
  engravable: boolean;
  metal: string;
  createdAt: string;
  reviewsCount: number;
};

export type ShopCollectionProduct = {
  id: number;
  name: string;
  price: string;
  priceValue: number;
  image: string;
  hoverImage: string;
  badges: string[];
  rating: number;
  reviews: number;
  collectionSlug: string;
};

export type ShopProductDetail = {
  id: number;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  collectionSlug: string | null;
  description: string;
  price: number;
  image: string;
  hoverImage: string;
  gallery: string[];
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  isNew: boolean;
  isBestSeller: boolean;
  metalOptions: string[];
  caratOptions: number[];
  diamondOptions: string[];
  ringSizes: string[];
  unavailableRingSizes: string[];
};

const fallbackImage = '/collection-1.jpg';

function toNumber(value: string): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asIntRating(value: number | null): number {
  if (!value || Number.isNaN(value)) {
    return 4;
  }

  return Math.max(1, Math.min(5, Math.round(value)));
}

function getDiamondTypeLabel(optionValue: string): string {
  const lower = optionValue.toLowerCase();
  if (lower.includes('lab')) {
    return 'Lab-Grown';
  }

  return 'Natural';
}

function normalizeCollection(row: CollectionRow): ShopCollection {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    subtitle: row.subtitle ?? '',
    description: row.description ?? '',
    image: row.image_url || fallbackImage,
  };
}

function mapProductCard(
  row: ProductRow,
  category: ShopCategory,
  collectionSlug: string | null,
  primaryMetal: string,
  reviewsCount: number,
): ShopProductCard {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: category.name,
    categorySlug: category.slug,
    collectionSlug,
    price: row.base_price,
    image: row.image_url || fallbackImage,
    hoverImage: row.hover_image_url || row.image_url || fallbackImage,
    rating: asIntRating(row.rating),
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_best_seller),
    engravable: Boolean(row.is_engravable),
    metal: primaryMetal,
    createdAt: row.created_at,
    reviewsCount,
  };
}

async function getCategoriesByIds(ids: number[]): Promise<Map<number, ShopCategory>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .in('id', ids);

  if (error) {
    throw error;
  }

  const map = new Map<number, ShopCategory>();
  (data as CategoryRow[]).forEach((row) => {
    map.set(row.id, {
      id: row.id,
      name: row.name,
      slug: row.slug,
    });
  });

  return map;
}

async function getCollectionsByIds(ids: number[]): Promise<Map<number, ShopCollection>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('collections')
    .select('id, name, slug, subtitle, description, image_url')
    .in('id', ids);

  if (error) {
    throw error;
  }

  const map = new Map<number, ShopCollection>();
  (data as CollectionRow[]).forEach((row) => {
    map.set(row.id, normalizeCollection(row));
  });

  return map;
}

async function getPrimaryMetalsByProductIds(ids: number[]): Promise<Map<number, string>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('product_metals')
    .select('product_id, metal_type')
    .in('product_id', ids)
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  const map = new Map<number, string>();
  (data as Array<{ product_id: number; metal_type: string }>).forEach((row) => {
    if (!map.has(row.product_id)) {
      map.set(row.product_id, row.metal_type);
    }
  });

  return map;
}

async function getReviewCountsByProductIds(ids: number[]): Promise<Map<number, number>> {
  if (ids.length === 0) {
    return new Map();
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('product_id')
    .in('product_id', ids)
    .eq('is_approved', true);

  if (error) {
    throw error;
  }

  const counts = new Map<number, number>();
  (data as Array<{ product_id: number }>).forEach((row) => {
    counts.set(row.product_id, (counts.get(row.product_id) ?? 0) + 1);
  });

  return counts;
}

async function getProductCards(rows: ProductRow[]): Promise<ShopProductCard[]> {
  const productIds = rows.map((row) => row.id);
  const categoryIds = Array.from(new Set(rows.map((row) => row.category_id)));
  const collectionIds = Array.from(new Set(rows.map((row) => row.collection_id).filter((id): id is number => Boolean(id))));

  const [categoriesMap, collectionsMap, metalsMap, reviewCountsMap] = await Promise.all([
    getCategoriesByIds(categoryIds),
    getCollectionsByIds(collectionIds),
    getPrimaryMetalsByProductIds(productIds),
    getReviewCountsByProductIds(productIds),
  ]);

  return rows.map((row) => {
    const category = categoriesMap.get(row.category_id) ?? {
      id: row.category_id,
      name: 'Jewelry',
      slug: 'jewelry',
    };

    const collectionSlug = row.collection_id ? collectionsMap.get(row.collection_id)?.slug ?? null : null;
    const metal = metalsMap.get(row.id) ?? 'Gold';
    const reviewsCount = reviewCountsMap.get(row.id) ?? 0;

    return mapProductCard(row, category, collectionSlug, metal, reviewsCount);
  });
}

export async function fetchAllCategories(): Promise<ShopCategory[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('is_active', true)
    .order('sort_order', { ascending: true });

  if (error) {
    throw error;
  }

  return (data as CategoryRow[]).map((row) => ({ id: row.id, name: row.name, slug: row.slug }));
}

export async function fetchCategoryBySlug(slug: string): Promise<ShopCategory | null> {
  const { data, error } = await supabase
    .from('categories')
    .select('id, name, slug')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const category = data as CategoryRow;
  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
  };
}

export async function fetchProductsByCategorySlug(slug: string): Promise<{ category: ShopCategory | null; products: ShopProductCard[] }> {
  const category = await fetchCategoryBySlug(slug);
  if (!category) {
    return {
      category: null,
      products: [],
    };
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, base_price, image_url, hover_image_url, description, rating, is_new, is_best_seller, is_engravable, stock_quantity, created_at, category_id, collection_id')
    .eq('category_id', category.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const productRows = (data ?? []) as ProductRow[];
  const products = await getProductCards(productRows);

  return {
    category,
    products,
  };
}

export async function fetchCollectionBySlug(slug: string): Promise<ShopCollection | null> {
  const { data, error } = await supabase
    .from('collections')
    .select('id, name, slug, subtitle, description, image_url')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  return normalizeCollection(data as CollectionRow);
}

export async function fetchProductsByCollectionSlug(slug: string): Promise<{ collection: ShopCollection | null; products: ShopCollectionProduct[] }> {
  const collection = await fetchCollectionBySlug(slug);
  if (!collection) {
    return {
      collection: null,
      products: [],
    };
  }

  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, base_price, image_url, hover_image_url, description, rating, is_new, is_best_seller, is_engravable, stock_quantity, created_at, category_id, collection_id')
    .eq('collection_id', collection.id)
    .eq('is_active', true)
    .order('created_at', { ascending: false });

  if (error) {
    throw error;
  }

  const rows = (data ?? []) as ProductRow[];
  const productIds = rows.map((row) => row.id);
  const reviewCounts = await getReviewCountsByProductIds(productIds);

  const mapped = rows.map((row) => {
    const badges: string[] = [];

    if (row.is_best_seller) {
      badges.push('Best Seller');
    }

    if (row.is_new) {
      badges.push('New');
    }

    if (row.is_engravable) {
      badges.push('Engravable');
    }

    return {
      id: row.id,
      name: row.name,
      price: new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR',
        maximumFractionDigits: 0,
      }).format(row.base_price),
      priceValue: row.base_price,
      image: row.image_url || fallbackImage,
      hoverImage: row.hover_image_url || row.image_url || fallbackImage,
      badges,
      rating: asIntRating(row.rating),
      reviews: reviewCounts.get(row.id) ?? 0,
      collectionSlug: collection.slug,
    };
  });

  return {
    collection,
    products: mapped,
  };
}

export async function fetchProductDetailById(productId: number): Promise<ShopProductDetail | null> {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, slug, base_price, image_url, hover_image_url, description, rating, is_new, is_best_seller, is_engravable, stock_quantity, created_at, category_id, collection_id')
    .eq('id', productId)
    .eq('is_active', true)
    .maybeSingle();

  if (error) {
    throw error;
  }

  if (!data) {
    return null;
  }

  const row = data as ProductRow;

  const [categoriesMap, collectionsMap, imagesRes, metalsRes, sizesRes, optionsRes, reviewsRes] = await Promise.all([
    getCategoriesByIds([row.category_id]),
    row.collection_id ? getCollectionsByIds([row.collection_id]) : Promise.resolve(new Map<number, ShopCollection>()),
    supabase
      .from('product_images')
      .select('image_url, sort_order')
      .eq('product_id', row.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('product_metals')
      .select('metal_type')
      .eq('product_id', row.id),
    supabase
      .from('ring_sizes')
      .select('size_label, is_available')
      .eq('product_id', row.id),
    supabase
      .from('product_options')
      .select('option_type, option_value')
      .eq('product_id', row.id)
      .in('option_type', ['carat', 'diamond_type', 'metal', 'size']),
    supabase
      .from('reviews')
      .select('id', { count: 'exact', head: true })
      .eq('product_id', row.id)
      .eq('is_approved', true),
  ]);

  if (imagesRes.error) {
    throw imagesRes.error;
  }

  if (metalsRes.error) {
    throw metalsRes.error;
  }

  if (sizesRes.error) {
    throw sizesRes.error;
  }

  if (optionsRes.error) {
    throw optionsRes.error;
  }

  if (reviewsRes.error) {
    throw reviewsRes.error;
  }

  const imageRows = (imagesRes.data ?? []) as ProductImageRow[];
  const metalRows = (metalsRes.data ?? []) as ProductMetalRow[];
  const sizeRows = (sizesRes.data ?? []) as RingSizeRow[];
  const optionRows = (optionsRes.data ?? []) as ProductOptionRow[];

  const category = categoriesMap.get(row.category_id) ?? {
    id: row.category_id,
    name: 'Jewelry',
    slug: 'jewelry',
  };

  const collectionSlug = row.collection_id ? collectionsMap.get(row.collection_id)?.slug ?? null : null;

  const metalOptionsFromOptions = optionRows
    .filter((option) => option.option_type === 'metal')
    .map((option) => option.option_value);

  const metalOptions = Array.from(
    new Set([
      ...metalRows.map((metal) => metal.metal_type),
      ...metalOptionsFromOptions,
    ]),
  );

  const caratOptions = Array.from(
    new Set(
      optionRows
        .filter((option) => option.option_type === 'carat')
        .map((option) => toNumber(option.option_value))
        .filter((value) => value > 0),
    ),
  ).sort((a, b) => a - b);

  const diamondOptions = Array.from(
    new Set(
      optionRows
        .filter((option) => option.option_type === 'diamond_type')
        .map((option) => getDiamondTypeLabel(option.option_value)),
    ),
  );

  const availableSizes = sizeRows.filter((size) => size.is_available).map((size) => size.size_label);
  const unavailableSizes = sizeRows.filter((size) => !size.is_available).map((size) => size.size_label);

  const gallery = Array.from(
    new Set([
      row.image_url || fallbackImage,
      row.hover_image_url || row.image_url || fallbackImage,
      ...imageRows.map((item) => item.image_url),
    ]),
  );

  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    category: category.name,
    categorySlug: category.slug,
    collectionSlug,
    description: row.description ?? '',
    price: row.base_price,
    image: row.image_url || fallbackImage,
    hoverImage: row.hover_image_url || row.image_url || fallbackImage,
    gallery,
    rating: asIntRating(row.rating),
    reviewsCount: reviewsRes.count ?? 0,
    inStock: (row.stock_quantity ?? 0) > 0,
    isNew: Boolean(row.is_new),
    isBestSeller: Boolean(row.is_best_seller),
    metalOptions: metalOptions.length > 0 ? metalOptions : ['Gold'],
    caratOptions: caratOptions.length > 0 ? caratOptions : [2, 3, 4, 5, 6],
    diamondOptions: diamondOptions.length > 0 ? diamondOptions : ['Natural', 'Lab-Grown'],
    ringSizes: availableSizes.length > 0 ? availableSizes : ['6'],
    unavailableRingSizes: unavailableSizes,
  };
}
