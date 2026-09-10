/** Bounded display compatibility: Character Gallery 1.3.0 + Leshy Dragons 2.3.
 * Original adapter only. No reader code, art, world writes or additional fetches.
 * Approved G01/G02/M01 text; Brine/Umbral follow the 2026-09-10 main ruling.
 */
const READER = 'pf2e-tokens-characters';
const LESHY = 'battlezoo-dragons-leshy-dragons-pf2e';
const EXTRA = 'pf2e-compendium-extra-cn';
const SOURCE_EN = 'Battlezoo Leshy Dragons';
const SOURCE_CN = '战斗动物园：莱西龙';
const LABELS = new Map([
  ['battlezoo-leshy-dragons-arboreal-adult', ['Adult Arboreal Dragon', '成年林木龙']],
  ['battlezoo-leshy-dragons-floral-adult', ['Adult Floral Dragon', '成年花卉龙']],
  ['battlezoo-leshy-dragons-brine-wyrm', ['Brine Dragon Great Wyrm', '太古洋龙']],
  ['battlezoo-leshy-dragons-arboreal-crusher', ['Arboreal Dragon Crusher', '林木龙粉碎者']],
  ['battlezoo-leshy-dragons-floral-alchemist', ['Floral Dragon Alchemist', '花卉龙炼金术士']],
  ['battlezoo-leshy-dragons-harvest-adult', ['Adult Harvest Dragon', '成年丰收龙']],
  ['battlezoo-leshy-dragons-kelp-adult', ['Adult Kelp Dragon', '成年海带龙']],
  ['battlezoo-leshy-dragons-toadstool-adult', ['Adult Toadstool Dragon', '成年毒蕈龙']],
  ['battlezoo-leshy-dragons-arboreal-wyrm', ['Arboreal Dragon Great Wyrm', '太古林木龙']],
  ['battlezoo-leshy-dragons-arboreal-fighter', ['Arboreal Dragon Fighter', '林木龙战士']],
  ['battlezoo-leshy-dragons-cloud-wyrm', ['Cloud Dragon Great Wyrm', '太古云龙']],
  ['battlezoo-leshy-dragons-crystal-wyrm', ['Crystal Dragon Great Wyrm', '太古水晶龙']],
  ['battlezoo-leshy-dragons-magma-Wyrm', ['Magma Dragon Great Wyrm', '太古熔岩龙']],
  ['battlezoo-leshy-dragons-umbral-wyrm', ['Umbral Dragon Great Wyrm', '太古影龙']],
  ['battlezoo-leshy-dragons-floral-wyrm', ['Floral Dragon Great Wyrm', '太古花卉龙']],
  ['battlezoo-leshy-dragons-floral-witch', ['Floral Dragon Witch', '花卉龙女巫']],
  ['battlezoo-leshy-kallizandrex', ['Kallizandrex', '卡利赞德雷克斯']],
  ['battlezoo-leshy-dragons-harvest-farmer', ['Harvest Dragon Farmer', '丰收龙农夫']],
  ['battlezoo-leshy-dragons-harvest-2', ['Harvest Dragon Reaper', '丰收龙收割者']],
  ['battlezoo-leshy-dragons-harvest-wyrm', ['Harvest Dragon Great Wyrm', '太古丰收龙']],
  ['battlezoo-leshy-dragons-harvest-thaumaturge', ['Harvest Dragon Thaumaturge', '丰收龙奇术师']],
  ['battlezoo-leshy-dragons-kelp-wyrm', ['Kelp Dragon Great Wyrm', '太古海带龙']],
  ['battlezoo-leshy-dragons-kelp-monk', ['Kelp Dragon Monk', '海带龙武僧']],
  ['battlezoo-leshy-dragons-kelp-summoner', ['Kelp Dragon Summoner', '海带龙召唤师']],
  ['battlezoo-leshy-dragons-kelp-fighter', ['Kelp Dragon Fighter', '海带龙战士']],
  ['battlezoo-leshy-dragons-toadstool-wyrm', ['Toadstool Dragon Great Wyrm', '太古毒蕈龙']],
  ['battlezoo-leshy-dragons-toadstool-cleric', ['Toadstool Dragon Cleric', '毒蕈龙牧师']],
  ['battlezoo-leshy-dragons-toadstool-fighter', ['Toadstool Dragon Fighter', '毒蕈龙战士']],
  ['battlezoo-leshy-dragons-toadstool-witch', ['Toadstool Dragon Witch', '毒蕈龙女巫']],
  ['battlezoo-leshy-dragons-avatar', ['Arboreal Dragon Elemental Avatar', '林木龙元素化身']],
  ['battlezoo-leshy-dragons-avatar-background', ['Arboreal Dragon Elemental Avatar (Background)', '林木龙元素化身（背景版）']],
  ['battlezoo-leshy-dragons-floral-bard', ['Floral Dragon Bard', '花卉龙吟游诗人']]
]);
const METADATA = {
  label: ['Battlezoo: Leshy Dragons Datasheet', '战斗动物园：莱西龙数据表'],
  hint: ['Artwork from Battlezoo: Leshy Dragons.', '《战斗动物园：莱西龙》中的美术素材。']
};
const installedModules = new WeakSet();
const installedApplications = new WeakSet();
const ownedMetadata = new WeakMap();

function enabled() {
  try {
    const game = globalThis.game;
    return game?.system?.id === 'pf2e' && game.i18n?.lang === 'cn'
      && game.modules.get(EXTRA)?.active === true
      && game.modules.get(READER)?.active === true && game.modules.get(READER)?.version === '1.3.0'
      && game.modules.get(LESHY)?.active === true && game.modules.get(LESHY)?.version === '2.3'
      && game.settings.get('babele', 'loadingMode') === 'full';
  } catch { return false; }
}

function targetSource(source) {
  return source?.module?.id === LESHY && source.id === LESHY && Array.isArray(source.data);
}

function translation(record, sources) {
  const pair = LABELS.get(record?.key);
  if (!pair || record.label !== pair[0] || record.source !== SOURCE_EN || !Array.isArray(sources)) return null;
  const targets = sources.filter(targetSource);
  if (targets.length !== 1) return null;
  const matches = targets[0].data.filter(r => r.key === record.key);
  // The winner must be this exact source object, not a different source with a matching key/name.
  if (matches.length !== 1 || matches[0] !== record) return null;
  if (sources.some(s => s !== targets[0] && Array.isArray(s.data) && s.data.includes(record))) return null;
  return pair[1];
}

function syncMetadata(sources, active) {
  if (!Array.isArray(sources)) return;
  for (const source of sources) {
    if (!targetSource(source)) continue;
    let owned = ownedMetadata.get(source);
    for (const [field, [en, zh]] of Object.entries(METADATA)) {
      if (Object.getOwnPropertyDescriptor(source, field)?.writable !== true) continue;
      if (active && source[field] === en) {
        if (!owned) ownedMetadata.set(source, owned = new Set());
        owned.add(field);
        source[field] = zh;
      } else if (!active && owned?.has(field)) {
        // Never overwrite another extension's subsequent change.
        if (source[field] === zh) source[field] = en;
        owned.delete(field);
      }
    }
  }
}

function installApplication(app) {
  if (!enabled() || !app || installedApplications.has(app)) return;
  if (app.constructor?.name !== 'GalleryApplication' || !(app.database instanceof Map)
    || typeof app._prepareContext !== 'function' || !Object.isExtensible(app)) return;
  const actions = app.options?.actions;
  const names = ['createActor', 'inspectImage', 'openGallerySourceDialog'];
  if (!actions || names.some(k => typeof actions[k] !== 'function'
    || actions[k] !== app.constructor.DEFAULT_OPTIONS?.actions?.[k]
    || Object.getOwnPropertyDescriptor(actions, k)?.writable !== true)) return;
  const prepare = app._prepareContext;
  let sources;

  function remember(context) {
    sources = context.sources;
    syncMetadata(sources, enabled());
    return context;
  }

  app._prepareContext = function (...args) {
    const result = Reflect.apply(prepare, this, args);
    if (this !== app) return result;
    return result.then(context => {
      remember(context);
      if (!enabled()) return context;
      const selectedCN = translation(context.selected, sources);
      return {
        ...context,
        selected: selectedCN ? {...context.selected, label: selectedCN, source: SOURCE_CN} : context.selected,
        displayData: context.displayData.map(row => {
          const original = app.database.get(row.key);
          const zh = translation(original, sources);
          // Preserve a preceding wrapper's changed row and stale contexts across awaits.
          return zh && row.label === original.label && row.source === original.source
            && row.art === original.art && row.tags === original.tags
            ? {...row, label: zh, source: SOURCE_CN} : row;
        })
      };
    });
  };

  for (const name of names) {
    const original = actions[name];
    actions[name] = function (...args) {
      syncMetadata(sources, enabled());
      if (this !== app || !enabled()) return Reflect.apply(original, this, args);
      // Normal UI actions follow _prepareContext. Cold direct calls can obtain the same
      // real sources without importing/fetching/rebuilding; snapshot selection before awaiting.
      const database = new Map(app.database);
      const session = {...app.session};
      const data = database.get(session.selected);
      const invoke = () => {
        syncMetadata(sources, enabled());
        if (name === 'openGallerySourceDialog') return Reflect.apply(original, app, args);
        const zh = enabled() ? translation(data, sources) : null;
        if (zh) database.set(session.selected, {...data, label: name === 'createActor' ? `${zh} ${data.label}` : zh});
        // This fixed reader's create/inspect actions only read database/session, no private fields.
        // Own descriptors shadow the non-writable inherited database without touching the shared Map.
        const view = Object.create(app, {database: {value: database}, session: {value: session}});
        return Reflect.apply(original, view, args);
      };
      if (Array.isArray(sources)) return invoke();
      return Reflect.apply(prepare, app, []).then(context => { remember(context); return invoke(); });
    };
  }
  installedApplications.add(app);
}

/** Idempotent in this ESmodule instance. No attempt to reclaim a later extension's entry. */
export function installLeshyGalleryCompat() {
  if (!enabled()) return false;
  const module = game.modules.get(READER);
  if (installedModules.has(module)) return true;
  const descriptor = Object.getOwnPropertyDescriptor(module, 'application');
  // Reader 1.3.0 assigns an ordinary data property after import. Respect foreign accessors/locks.
  if (descriptor && (!('value' in descriptor) || !descriptor.configurable || !descriptor.writable)) return false;
  if (!descriptor && (!Object.isExtensible(module) || 'application' in module)) return false;
  let application = descriptor?.value;
  Object.defineProperty(module, 'application', {
    configurable: true, enumerable: descriptor?.enumerable ?? true,
    get() { return application; },
    set(value) { application = value; installApplication(value); }
  });
  installApplication(application);
  installedModules.add(module);
  return true;
}

// init precedes language initialization in Foundry 14.367; never latch language there.
Hooks.once('setup', installLeshyGalleryCompat);
if (globalThis.game?.ready === true) installLeshyGalleryCompat();
