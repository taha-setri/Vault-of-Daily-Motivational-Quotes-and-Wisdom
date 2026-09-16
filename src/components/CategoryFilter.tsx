import React from 'react';
import { CATEGORIES } from '../data/quotes';
import { CategoryType, Language } from '../types';
import { Sparkles, Flame, BookOpen, Cpu, Feather, Compass } from 'lucide-react';

interface CategoryFilterProps {
  selectedCategory: CategoryType;
  onSelectCategory: (category: CategoryType) => void;
  quotesCountByCategory: Record<CategoryType, number>;
  language?: Language;
}

export const CategoryFilter: React.FC<CategoryFilterProps> = ({
  selectedCategory,
  onSelectCategory,
  quotesCountByCategory,
  language = 'ar',
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Sparkles':
        return <Sparkles className="w-4 h-4" />;
      case 'Flame':
        return <Flame className="w-4 h-4" />;
      case 'BookOpen':
        return <BookOpen className="w-4 h-4" />;
      case 'Cpu':
        return <Cpu className="w-4 h-4" />;
      case 'Feather':
        return <Feather className="w-4 h-4" />;
      case 'Compass':
        return <Compass className="w-4 h-4" />;
      default:
        return <Sparkles className="w-4 h-4" />;
    }
  };

  return (
    <div className="w-full overflow-x-auto py-2 scrollbar-none">
      <div className="flex items-center gap-2.5 min-w-max pb-1">
        {CATEGORIES.map((cat) => {
          const isSelected = selectedCategory === cat.id;
          const count = quotesCountByCategory[cat.id] || 0;
          const label = language === 'en' ? cat.labelEn : cat.label;

          return (
            <button
              key={cat.id}
              id={`filter-category-${cat.id}`}
              onClick={() => onSelectCategory(cat.id)}
              className={`group relative flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-all duration-300 cursor-pointer ${
                isSelected
                  ? `${cat.borderActive} bg-slate-900/90`
                  : 'border-slate-800/80 bg-slate-900/40 text-slate-400 hover:text-slate-200 hover:border-slate-700 hover:bg-slate-900/70'
              }`}
            >
              {isSelected && (
                <span className="absolute inset-0 rounded-xl bg-cyan-500/5 -z-10 blur-sm"></span>
              )}

              <span className={`transition-transform duration-300 group-hover:scale-110 ${isSelected ? 'text-current' : 'text-slate-500 group-hover:text-slate-300'}`}>
                {getIcon(cat.iconName)}
              </span>

              <span>{label}</span>

              <span
                className={`text-[11px] px-2 py-0.5 rounded-full font-future transition-colors ${
                  isSelected
                    ? 'bg-cyan-500/20 text-cyan-200'
                    : 'bg-slate-800/80 text-slate-500 group-hover:text-slate-400'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
