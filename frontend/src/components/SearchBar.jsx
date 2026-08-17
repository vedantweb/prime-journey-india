import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { MapPin, Search } from 'lucide-react';
import { searchPlaces } from '../data/searchIndex';

export default function SearchBar({ testid = 'hero-search', className = '' }) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [results, setResults] = useState([]);
  const navigate = useNavigate();
  const boxRef = useRef(null);

  useEffect(() => {
    const onDoc = (e) => {
      if (boxRef.current && !boxRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const onChange = (e) => {
    const q = e.target.value;
    setQuery(q);
    setResults(searchPlaces(q));
    setOpen(q.trim().length > 0);
  };

  const pick = (item) => {
    setOpen(false);
    setQuery('');
    navigate(item.path);
  };

  return (
    <div ref={boxRef} data-testid={testid} className={`relative ${className}`}>
      <div className="flex items-center gap-3 rounded-full border border-white/40 bg-white/90 py-3 pl-5 pr-2 shadow-[0_16px_44px_rgba(6,24,43,0.3)] backdrop-blur-xl transition-[box-shadow,border-color] duration-300 focus-within:border-saffron focus-within:shadow-[0_20px_54px_rgba(6,24,43,0.4)]">
        <Search size={17} className="shrink-0 text-ocean/50" />
        <input
          data-testid={`${testid}-input`}
          value={query}
          onChange={onChange}
          onFocus={() => query.trim() && setOpen(true)}
          placeholder="Where do you want to go?"
          aria-label="Search destinations, packages and experiences"
          className="w-full bg-transparent text-sm font-semibold text-ocean outline-none placeholder:text-ocean/40"
        />
        <span className="hidden shrink-0 rounded-full bg-ocean px-4 py-1.5 text-[11px] font-bold uppercase tracking-widest text-white sm:block">
          Search
        </span>
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            data-testid={`${testid}-results`}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.22 }}
            className="absolute inset-x-0 bottom-full mb-3 overflow-hidden rounded-2xl border border-ocean/10 bg-white/97 shadow-[0_24px_60px_rgba(6,24,43,0.35)] backdrop-blur-xl"
          >
            {results.length === 0 ? (
              <p className="px-5 py-4 text-sm font-medium text-ink/50">
                No matches — try “Kashmir”, “fort”, “beach” or “border”.
              </p>
            ) : (
              results.map((r) => (
                <button
                  key={`${r.type}-${r.name}`}
                  data-testid={`search-result-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
                  onClick={() => pick(r)}
                  className="flex w-full items-center gap-3.5 px-4 py-3 text-left transition-colors duration-150 hover:bg-saffron/10"
                >
                  <img src={r.image} alt="" loading="lazy" className="h-10 w-12 shrink-0 rounded-lg object-cover" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-display text-[15px] font-bold text-ocean">{r.name}</span>
                    <span className="flex items-center gap-1 text-[11px] font-bold uppercase tracking-widest text-turq">
                      <MapPin size={10} /> {r.type}
                    </span>
                  </span>
                </button>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
