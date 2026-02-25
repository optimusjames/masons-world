'use client';

import s from '../styles.module.css';

const c = (classes: string) => classes.split(' ').map(n => s[n]).filter(Boolean).join(' ');

interface Recipe {
  id: string;
  name: string;
  colors: string[];
  prompt: string;
}

interface RecipeModalProps {
  recipe: Recipe;
  copySuccess: boolean;
  onClose: () => void;
  onCopy: () => void;
}

export function RecipeModal({ recipe, copySuccess, onClose, onCopy }: RecipeModalProps) {
  return (
    <>
      <div className={c('recipe-overlay visible')} onClick={onClose} />
      <div className={c('recipe-modal visible')}>
        <div className={c('recipe-modal-header')}>
          {recipe.name} · {recipe.id.toUpperCase()}
        </div>
        <div className={c('recipe-modal-swatches')}>
          {recipe.colors.map((color: string, i: number) => (
            <div key={i} className={c('recipe-swatch')} style={{ background: color }} />
          ))}
        </div>
        <div className={c('recipe-modal-prompt')}>
          {recipe.prompt}
        </div>
        <div className={c('recipe-modal-footer')}>
          <button
            className={`${s['recipe-copy-btn']} ${copySuccess ? s.copied : ''}`}
            onClick={(e) => {
              e.stopPropagation();
              onCopy();
            }}
          >
            {copySuccess ? 'Copied!' : 'Copy Prompt'}
          </button>
        </div>
      </div>
    </>
  );
}
