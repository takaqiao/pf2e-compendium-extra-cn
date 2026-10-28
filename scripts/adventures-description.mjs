/** Match the complete description so older rules keep their own translation. */
export function translateAdventuresDescription(description, translation) {
  if (typeof description !== 'string') return undefined;
  if (typeof translation === 'string') return translation;
  if (!Array.isArray(translation?.sources)) return undefined;
  return translation.sources.find(row => row?.source === description
    && typeof row.translation === 'string')?.translation;
}

translateAdventuresDescription.extract = description => typeof description === 'string' ? description : undefined;
