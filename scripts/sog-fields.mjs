/** One reviewed display label in the PF2e 8.5.1 SoG actor translation. */
const CONVERTER = 'sog-deception-special';
const LABEL = 'Impersonating Governor Heh Shan-Bao';
const TRANSLATION = '冒充镇长和善保时';
const PACK = 'pf2e.season-of-ghosts-bestiary';
const matches = entry => entry?.label === LABEL && entry.base === 29
  && Array.isArray(entry.predicate) && entry.predicate.length === 2
  && entry.predicate[0] === 'manifest-body'
  && entry.predicate[1] === 'action:impersonate';

function enabled() {
  const game = globalThis.game;
  return game?.system?.id === 'pf2e'
    && game.system.version === '8.5.1'
    && /^(?:cn|zh(?:[-_]|$))/i.test(game?.i18n?.lang ?? '')
    && game.modules?.get('pf2e-compendium-extra-cn')?.active
    && game.modules?.get('babele')?.version === '2.9.1';
}

export function createSogDeceptionSpecialConverter() {
  return {
    prepare() {},
    extract(context) {
      if (!Array.isArray(context.value) || !context.value.some(matches)) return undefined;
      return {[LABEL]: LABEL};
    },
    translate(context) {
      if (!enabled() || context.contextCompendium?.metadata?.id !== PACK
        || context.source?._id !== 'HxgtQw1rldkMf83o'
        || context.source?.type !== 'npc'
        || context.path !== 'system.skills.deception.special'
        || context.translation?.[LABEL] !== TRANSLATION
        || !Array.isArray(context.value)) return undefined;

      if (!context.value.some(matches)) return undefined;
      return context.value.map(entry => matches(entry) ? {...entry, label: TRANSLATION} : entry);
    },
  };
}

Hooks.once('babele.init', babele => {
  // Register early; version/language/source guards apply when translating.
  if (globalThis.game?.modules?.get('babele')?.version !== '2.9.1'
    || babele.converterRegistry?.named(CONVERTER)) return;
  babele.registerConverters({[CONVERTER]: createSogDeceptionSpecialConverter()});
});
