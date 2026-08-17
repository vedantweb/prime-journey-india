import { destinations } from './destinations';
import { packages } from './packages';
import { experiences } from './experiences';
import { img } from './siteConfig';

// Structured, alias-driven search corpus — add new entries to the data files
// or EXTRA_PLACES and they become searchable automatically (no if/else chains).

const EXTRA_PLACES = [
  { name: 'Golden Temple', type: 'Attraction', path: '/destinations/amritsar', image: img('1621377099913-ac1ec4848e52', 200), keywords: ['temple', 'golden', 'harmandir', 'darbar sahib', 'amritsar'] },
  { name: 'Wagah Border', type: 'Attraction', path: '/destinations/amritsar', image: img('1532375810709-75b1da00537c', 200), keywords: ['border', 'wagah', 'india pakistan', 'attari', 'beating retreat', 'flag'] },
  { name: 'Pangong Lake', type: 'Attraction', path: '/packages/ladakh-explorer', image: img('1600356033695-a003690a6351', 200), keywords: ['pangong', 'lake', 'ladakh', 'blue'] },
  { name: 'Dal Lake', type: 'Attraction', path: '/destinations/kashmir', image: img('1595815771614-ade9d652a65d', 200), keywords: ['dal', 'lake', 'shikara', 'srinagar'] },
  { name: 'Gulmarg', type: 'Attraction', path: '/destinations/kashmir', image: img('1418985991508-e47386d96a71', 200), keywords: ['gulmarg', 'snow', 'ski', 'gondola'] },
  { name: 'Mehrangarh Fort', type: 'Attraction', path: '/destinations/rajasthan', image: img('1580389672842-9755d100d18e', 200), keywords: ['fort', 'mehrangarh', 'jodhpur', 'royal'] },
];

export const searchCorpus = [
  ...destinations.map((d) => ({ name: d.name, type: 'Destination', path: `/destinations/${d.id}`, image: d.image, keywords: d.keywords || [] })),
  ...packages.map((p) => ({ name: p.name, type: 'Package', path: `/packages/${p.id}`, image: p.image, keywords: [p.destination, ...(p.route || '').split('·').map((s) => s.trim())] })),
  ...experiences.map((e) => ({ name: e.title, type: 'Experience', path: `/destinations/${e.destId}`, image: e.image, keywords: e.keywords || [] })),
  ...EXTRA_PLACES,
];

const norm = (s) => s.toLowerCase().trim();

export function searchPlaces(query, limit = 7) {
  const tokens = norm(query).split(/\s+/).filter(Boolean);
  if (!tokens.length) return [];
  return searchCorpus
    .map((item) => {
      const name = norm(item.name);
      const kws = item.keywords.map(norm);
      let score = 0;
      const matchedAll = tokens.every((t) => {
        if (name === t) { score += 12; return true; }
        if (name.startsWith(t)) { score += 10; return true; }
        if (name.includes(t)) { score += 6; return true; }
        const kw = kws.find((k) => k === t || k.startsWith(t) || k.includes(t));
        if (kw) { score += kw === t ? 8 : 4; return true; }
        return false;
      });
      return matchedAll ? { ...item, score } : null;
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}
