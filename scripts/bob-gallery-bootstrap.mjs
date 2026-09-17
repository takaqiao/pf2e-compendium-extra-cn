import {createBobGalleryDisplayCompatibility} from './bob-gallery-display-compat.mjs';
import {registerBobGalleryDisplay} from './bob-gallery-registration.mjs';

const control = registerBobGalleryDisplay({
  hooks: Hooks,
  getGame: () => game,
  createCompatibility: createBobGalleryDisplayCompatibility
});
export const isBobGalleryDisplayReady = () => control.isReady();
export const disposeBobGalleryDisplay = () => control.dispose();
