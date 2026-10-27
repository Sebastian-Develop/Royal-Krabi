import { useState, type ReactNode } from 'react';
import { massagePhotos } from '@/lib/massage-photos';

export function MassagePhotoCard({ name, children }: { name: string; children: ReactNode }) {
  return <article className="price-card massage-photo-card" aria-label={name}>{children}</article>;
}

export function MassagePhotoName({ name, level = 3 }: { name: string; level?: 3 | 4 }) {
  const [broken, setBroken] = useState(false);
  const Heading = level === 3 ? 'h3' : 'h4';
  const photo = massagePhotos[name];
  return <>
    {level === 3 && photo && !broken && <img className="massage-photo-inline" src={photo.url} alt={photo.alt} loading="lazy" onError={() => setBroken(true)}/>}
    <Heading>{name}</Heading>
  </>;
}
