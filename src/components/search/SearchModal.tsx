import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '../../lib/store';
import { Search, X, ArrowRight } from 'lucide-react';
import { PerfumeBottleGraphic } from '../ui/PerfumeBottleGraphic';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (path: string) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose, onNavigate }) => {
  const { products, settings } = useStore();
  const [query, setQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const normalized = query.trim().toLowerCase();
  const filteredProducts = normalized
    ? products.filter(
        (p) =>
          p.isActive &&
          (p.name.toLowerCase().includes(normalized) ||
            p.brand.toLowerCase().includes(normalized) ||
            p.fragranceFamily.toLowerCase().includes(normalized) ||
            p.category.toLowerCase().includes(normalized) ||
            p.topNotes.some((n) => n.toLowerCase().includes(normalized)) ||
            p.heartNotes.some((n) => n.toLowerCase().includes(normalized)) ||
            p.baseNotes.some((n) => n.toLowerCase().includes(normalized)))
      )
    : [];

  const quickPicks = ['Oud', 'Rose', 'Santal', 'Ambre', 'Cuir', 'Vanille', 'Cèdre'];

  const handleSelectProduct = (slug: string) => {
    onClose();
    onNavigate(`/product/${slug}`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-start justify-center pt-20 px-4">
      <div className="w-full max-w-2xl bg-[#121216] border border-[#2B2B38] rounded-sm shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search Input Bar */}
        <div className="p-4 border-b border-[#22222A] flex items-center gap-3">
          <Search className="w-5 h-5 text-[#D8B08C] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un parfum, une note olfactive (Oud, Rose, Ambre...)"
            className="flex-1 bg-transparent text-sm md:text-base text-[#F5F1EB] placeholder:text-[#666] focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-[#666] hover:text-[#F5F1EB] p-1 text-xs"
            >
              Effacer
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 text-[#A7A3A0] hover:text-[#F5F1EB] rounded-sm"
            aria-label="Fermer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Quick Suggestion Tags */}
        <div className="px-5 py-3 bg-[#0F0F13] border-b border-[#1E1E26] flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-[11px] text-[#A7A3A0] shrink-0 font-medium">Suggestions :</span>
          {quickPicks.map((pick) => (
            <button
              key={pick}
              onClick={() => setQuery(pick)}
              className="px-2.5 py-1 bg-[#1A1A22] hover:bg-[#252530] text-[#D8B08C] border border-[#2B2B38] rounded-sm text-xs transition-colors shrink-0"
            >
              {pick}
            </button>
          ))}
        </div>

        {/* Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4">
          {query.trim() === '' ? (
            <div className="py-8 text-center text-[#A7A3A0]">
              <p className="text-xs">Saisissez un mot-clé pour explorer notre univers olfactif.</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="py-12 text-center text-[#A7A3A0]">
              <p className="font-serif text-base text-[#F5F1EB]">Aucune fragrance trouvée</p>
              <p className="text-xs mt-1">
                Aucun résultat pour « {query} ». Essayez avec une note olfactive comme le santal ou la rose.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-[#1F1F27]">
              {filteredProducts.map((product) => (
                <div
                  key={product.id}
                  onClick={() => handleSelectProduct(product.slug)}
                  className="flex items-center gap-4 py-3 px-2 hover:bg-[#181820] rounded-sm cursor-pointer transition-colors group"
                >
                  <div className="w-12 h-14 bg-[#0B0B0D] rounded-sm flex items-center justify-center shrink-0 border border-[#252530] p-1">
                    <PerfumeBottleGraphic
                      name={product.name}
                      category={product.gender}
                      volume={product.volume}
                      accentColor={product.accentColor}
                      size="sm"
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-[11px] text-[#A7A3A0]">
                      <span className="text-[#D8B08C] uppercase font-mono">{product.gender}</span>
                      <span>·</span>
                      <span>{product.fragranceFamily}</span>
                    </div>
                    <h4 className="text-sm font-serif font-medium text-[#F5F1EB] group-hover:text-[#D8B08C] transition-colors truncate">
                      {product.name}
                    </h4>
                    <p className="text-[11px] text-[#A7A3A0]/70 truncate">
                      Notes : {product.topNotes.slice(0, 2).join(', ')} · {product.heartNotes[0]}
                    </p>
                  </div>

                  <div className="text-right shrink-0 flex items-center gap-3">
                    <div className="flex flex-col items-end">
                      <span className="text-xs font-mono font-semibold text-[#D8B08C]">
                        {product.price} {settings.currency}
                      </span>
                      {product.compareAtPrice && product.compareAtPrice > product.price && (
                        <del
                          className="text-[10px] text-[#9E9B97] font-mono line-through"
                          style={{ textDecoration: 'line-through' }}
                        >
                          {product.compareAtPrice} {settings.currency}
                        </del>
                      )}
                    </div>
                    <ArrowRight className="w-4 h-4 text-[#A7A3A0] group-hover:text-[#D8B08C] group-hover:translate-x-0.5 transition-all" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
