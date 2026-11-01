import { useState } from 'react';
import { brandFallbackPhoto } from '@/lib/massage-photos';
import type { ShopProduct } from '@/lib/shop';

export function ShopProductImage({ product, thumbnail = false }: { product: ShopProduct; thumbnail?: boolean }) {
  const [failed, setFailed] = useState(false);
  const photo = failed ? brandFallbackPhoto : product.photo;
  return <img className={`${thumbnail ? 'cart-product-image' : 'shop-product-photo'}${photo.fit === 'contain' ? ' product-image-contain' : ''}`} src={photo.url} alt={photo.alt} width={thumbnail ? 80 : 400} height={thumbnail ? 80 : 300} loading="lazy" onError={() => setFailed(true)}/>;
}