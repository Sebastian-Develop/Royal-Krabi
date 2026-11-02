import { Fragment } from 'react';
import { AddressLink } from './site';
import { contact, withdrawalEmail, withdrawalMailHref } from '@/lib/contact';
export function LegalText({ text }: { text: string }) {
  const address = `${contact.street}, ${contact.city}`;
  const escape = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const tokens = text.split(new RegExp(`(${[address, withdrawalEmail, contact.email, contact.phone].map(escape).join('|')})`));
  return <>{tokens.map((part, i) => <Fragment key={i}>{part === address ? <AddressLink>{part}</AddressLink> : part === withdrawalEmail ? <a href={withdrawalMailHref}>{part}</a> : part === contact.email ? <a href={withdrawalMailHref}>{part}</a> : part === contact.phone ? <a href={contact.phoneHref}>{part}</a> : part}</Fragment>)}</>;
}
