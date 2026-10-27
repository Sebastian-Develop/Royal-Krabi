import thai from '@/assets/massage-preview-1.webp.asset.json';
import thaiOil from '@/assets/massage-preview-2.webp.asset.json';
import relax from '@/assets/massage-preview-3.webp.asset.json';
import aroma from '@/assets/massage-preview-4.webp.asset.json';
import stones from '@/assets/massage-preview-5.webp.asset.json';
import herbs from '@/assets/massage-preview-6.webp.asset.json';
import sound from '@/assets/massage-preview-7.webp.asset.json';
import lymph from '@/assets/massage-preview-8.webp.asset.json';
import back from '@/assets/massage-preview-9.webp.asset.json';
import neck from '@/assets/massage-preview-10.webp.asset.json';
import head from '@/assets/massage-preview-11.webp.asset.json';
import foot from '@/assets/massage-preview-12.webp.asset.json';
import pair from '@/assets/massage-preview-13.webp.asset.json';

export type MassagePhoto = { url: string; alt: string };
export const massagePhotos: Record<string, MassagePhoto> = {
  'Royal Thai Massage – ohne Öl': { url: thai.url, alt: 'Traditionelle Thai-Massage mit Drucktechniken am bekleideten Rücken.' },
  'Royal Thai Massage': { url: thaiOil.url, alt: 'Thai-Öl-Massage mit Massagegriffen am Rücken.' },
  'Relax-Massage mit Öl': { url: relax.url, alt: 'Sanfte Relax-Massage mit Öl am Rücken.' },
  'Aromaöl-Massage': { url: aroma.url, alt: 'Aromaöl-Massage mit fließenden Massagegriffen am Rücken.' },
  'Hot-Stone-Massage': { url: stones.url, alt: 'Glatte Massagesteine entlang des Rückens bei einer Hot-Stone-Massage.' },
  'Thai-Kräuterstempelmassage': { url: herbs.url, alt: 'Thai-Massage mit Kräuterstempeln am Rücken.' },
  'Royal Sound Healing – Royal Krabi Signature': { url: sound.url, alt: 'Royal Sound Healing – Royal Krabi Signature mit einer Klangschale über einer bekleideten Person.' },
  'Kosmetische Lymphdrainage – Ganzkörper': { url: lymph.url, alt: 'Sanfte Massagegriffe am Oberkörper bei der kosmetischen Lymphdrainage.' },
  'Rückenmassage mit Öl': { url: back.url, alt: 'Rückenmassage mit Öl und gezielten Massagegriffen.' },
  'Nacken- und Schultermassage': { url: neck.url, alt: 'Massagegriffe an Nacken und Schultern.' },
  'Kopfmassage': { url: head.url, alt: 'Entspannende Kopfmassage an Kopf und Kopfhaut.' },
  'Thai-Fußreflexzonenmassage': { url: foot.url, alt: 'Thai-Fußreflexzonenmassage mit sanften Drucktechniken am Fuß.' },
  'Royal Paarmassage': { url: pair.url, alt: 'Zwei Personen genießen gemeinsam eine Massage in einem Raum.' },
};