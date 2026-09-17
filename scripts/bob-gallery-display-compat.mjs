/** Explicit candidate installer only: no hooks, registration, source fetches or persisted changes. */
import {installBobGalleryDisplay} from './bob-gallery-display-core.mjs';
import {GALLERY_DISPLAY_BINDINGS} from './bob-gallery-display-bindings.mjs';
const READER = 'pf2e-tokens-characters', BOB = 'pf2e-bastion-of-blasphemies', EXTRA = 'pf2e-compendium-extra-cn';

export async function createBobGalleryDisplayCompatibility({game = globalThis.game, loadModule = path => import(path)} = {}) {
  const reader = game?.modules?.get(READER), bob = game?.modules?.get(BOB), extra = game?.modules?.get(EXTRA);
  const enabled = () => game?.version === '14.368' && game.system?.id === 'pf2e' && game.system.version === '8.5.1'
    && reader && game.modules.get(READER) === reader && reader.active && reader.version === '1.3.0'
    && bob && game.modules.get(BOB) === bob && bob.active && bob.version === '1.0.0'
    && extra && game.modules.get(EXTRA) === extra && extra.active;
  if (!enabled()) return null;
  let GalleryClass, data;
  try {
    const imported = await Promise.all([
      loadModule(`/modules/${READER}/module/gallery.mjs`),
      loadModule(`/modules/${READER}/module/data.mjs`),
    ]);
    GalleryClass = imported[0].default; data = imported[1].GALLERY_DATA;
  } catch { return null; }
  if (!enabled() || typeof GalleryClass !== 'function' || !Array.isArray(data?.SOURCES)
    || !(reader.application instanceof GalleryClass)) return null;
  return installBobGalleryDisplay({
    application: reader.application, GalleryClass, bindings: GALLERY_DISPLAY_BINDINGS,
    getSources: () => data.SOURCES, getApplication: () => reader.application,
    getUser: () => game.user, getLocale: () => game.i18n.lang,
    getGalleryAccess: () => game.settings.get(READER, 'galleryAccess'),
    getRestrictedSheets: () => game.settings.get(READER, 'restrictedSheets'),
    isEnabled: enabled, getModule: () => bob,
    getSourceTooltipLabel: () => game.i18n.localize('PF2ECG.APP.TOOLTIP.source'),
  });
}
