/** Preserve existing HAD world cards when the standalone translation is retired. */
const EXTRA_ID = 'pf2e-compendium-extra-cn';
const BASE_ID = 'pf2e-hero-deck-unofficial';
const LEGACY_ID = 'pf2e-hero-deck-cn';
const CHINESE = new Set(['cn', 'zh-CN', 'zh_Hans', 'zh-Hans', 'zh-cn', 'zh_hans']);
const OLD_IMAGES = `modules/${LEGACY_ID}/assets/cards/`;
const NEW_IMAGES = `modules/${EXTRA_ID}/assets/hero-action-deck/cards/`;
const TRANSLATION = `modules/${EXTRA_ID}/compendium/${BASE_ID}.pf2e-hero-action-card-deck-unofficial.json`;
const STACK_NAMES = [
  ['deck.id.hand', 'Hero Actions: Hand', '英雄行动：手牌'],
  ['deck.id.discard', 'Hero Actions: Discard', '英雄行动：弃牌堆'],
];
const STACK_SETTINGS = new Set(['deck.id.hero-actions', 'deck.id.hand', 'deck.id.discard']
  .map(key => `${BASE_ID}.${key}`));
let imageMap;
let pending = Promise.resolve();

function mayWrite() {
  return game.system?.id === 'pf2e' && CHINESE.has(game.i18n?.lang)
    && game.modules.get(EXTRA_ID)?.active === true
    && game.modules.get(BASE_ID)?.active === true
    && game.modules.get(LEGACY_ID)?.active !== true
    && game.user?.isGM === true && game.user.active === true
    && game.users?.activeGM?.id === game.user.id;
}

async function loadImageMap() {
  if (imageMap) return imageMap;
  const response = await fetch(TRANSLATION);
  if (!response.ok) throw new Error('Cannot load the HAD card image whitelist');
  const translation = await response.json();
  const cards = Object.values(translation?.entries?.['Hero Action Deck']?.cards ?? {});
  const replacements = new Map();
  if (cards.length !== 52) throw new Error('Expected 52 translated HAD cards');
  for (const card of cards) {
    if (!Array.isArray(card.faces) || card.faces.length !== 1) {
      throw new Error('Unexpected HAD card face layout');
    }
    const img = card.faces[0]?.img;
    const filename = typeof img === 'string' && img.startsWith(NEW_IMAGES)
      ? img.slice(NEW_IMAGES.length) : '';
    if (!/^[a-z0-9_]+\.webp$/.test(filename)) throw new Error('Unexpected HAD image path');
    replacements.set(OLD_IMAGES + filename, img);
  }
  if (replacements.size !== 52) throw new Error('Expected 52 distinct HAD card images');
  imageMap = replacements;
  return imageMap;
}

async function renameConfiguredStacks() {
  const updates = [];
  for (const [key, original, translated] of STACK_NAMES) {
    let id;
    try { id = game.settings.get(BASE_ID, key); } catch { continue; }
    const stack = game.cards?.get(id);
    if (stack?.name === original) updates.push({ _id: stack.id, name: translated });
  }
  if (updates.length && mayWrite()) await Cards.updateDocuments(updates);
}

function hasLegacyImages() {
  return (game.cards?.contents ?? []).some(stack => (stack.cards?.contents ?? []).some(card =>
    card.toObject().faces?.some(face => typeof face?.img === 'string' && face.img.startsWith(OLD_IMAGES))
  ));
}

async function migrate() {
  if (!mayWrite()) return;
  await renameConfiguredStacks();
  if (!mayWrite() || !hasLegacyImages()) return;
  const replacements = await loadImageMap();
  // Fetching the translation and each document update yield to other clients.
  // Recheck the designated GM and read current faces after those awaits.
  for (const stack of game.cards?.contents ?? []) {
    if (!mayWrite()) return;
    const updates = [];
    for (const card of stack.cards?.contents ?? []) {
      const faces = card.toObject().faces;
      if (!Array.isArray(faces)) continue;
      let changed = false;
      const nextFaces = faces.map(face => {
        const img = replacements.get(face?.img);
        if (!img) return face;
        changed = true;
        return { ...face, img };
      });
      // Updating only faces keeps id, name, text, draw state, origin, sort and
      // selected face intact. The existing face objects retain all other fields.
      if (changed) updates.push({ _id: card.id, faces: nextFaces });
    }
    if (updates.length) await stack.updateEmbeddedDocuments('Card', updates);
  }
}

function schedule() {
  // Foundry does not await hook callbacks. Serialize our own runs so ready and
  // settings arriving together cannot issue duplicate writes from this client.
  pending = pending.then(migrate).catch(error => {
    console.warn(`${EXTRA_ID} | HAD world-card compatibility failed`, error);
  });
  return pending;
}

Hooks.once('ready', schedule);
// Upstream helpers.js awaits Cards.create, then stores its ID. A first world
// setting creates a Setting document; replacing an existing ID updates it.
// These hooks prove ownership through configured IDs without guessing from names.
for (const event of ['createSetting', 'updateSetting']) {
  Hooks.on(event, setting => {
    if (STACK_SETTINGS.has(setting?.key)) return schedule();
  });
}
