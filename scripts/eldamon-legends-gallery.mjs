/** Chinese form names for the Legends datasheet in Pathfinder Tokens: Character Gallery.
 * Display only: grid captions, the selected entry's name and source tooltip, and the title of
 * the image popout opened from the gallery. Gallery records, the data-* attributes that search
 * reads, and the names of actors created from the gallery stay native. Each record is matched
 * by its own English label (and source text), so when upstream changes one record only that
 * record falls back to English.
 */
const READER = 'pf2e-tokens-characters';
const LEGENDS = 'battlezoo-eldamon-legends-pf2e';
const SHEET = 'battlezoo-eldamon-legends-creatures';
const EXTRA = 'pf2e-compendium-extra-cn';

// One line per three-stage family; the names are those in the pf2e-eldamon description headers.
export const GALLERY_LABELS = new Map([
  ['Pegi', '佩姬'], ['Bellairo', '贝莱萝'], ['Krysoar', '克律索尔'],
  ['Psita', '晴空鹦'], ['Airini', '凌空鹦'], ['Atmocaw', '苍穹金刚鹦'],
  ['Aeromini', '小飞鼠'], ['Aeromist', '雾飞鼠'], ['Aeromight', '雄风飞鼠'],
  ['Flinch', '风雀'], ['Fringust', '阵风雀'], ['Fringale', '疾风雀'],
  ['Petrinite', '佩特里奈特'], ['Petrook', '佩特鲁克'], ['Petraegis', '佩特雷吉斯'],
  ['Loamby', '洛姆比'], ['Loambrox', '洛姆布洛克斯'], ['Terrestrox', '特瑞斯特洛克斯'],
  ['Steg', '斯泰格'], ['Stegeo', '斯泰吉欧'], ['Stegeosaur', '斯泰吉欧索尔'],
  ['Rocky', '洛基'], ['Bolder', '博尔德'], ['Bolderdash', '博尔德达什'],
  ['Fafnismol', '法夫小龙'], ['Fafnir', '法夫尼尔'], ['Fafnhoard', '法夫藏宝龙'],
  ['Blazey', '焰炬仔'], ['Blazier', '焰盆'], ['Blazelabra', '焰枝烛台'],
  ['Cansear', '灼蟹'], ['Razinoid', '拉兹诺伊德'], ['Carcinerate', '卡辛纳雷特'],
  ['Sparky', '火花仔'], ['Sparkane', '斯帕凯恩'], ['Sparkadia', '斯帕卡迪亚'],
  ['Ondi', '翁迪'], ['Tritone', '特里托恩'], ['Amphitrisea', '安菲特里希'],
  ['Eddy', '涡仔'], ['Maelstros', '迈尔斯特洛斯'], ['Karybdion', '卡律布狄昂'],
  ['Asteripple', '星涟'], ['Asterain', '星雨'], ['Asterosion', '星蚀'],
  ['Seatoma', '海螳虾'], ['Seaquilla', '海奎拉'], ['Seaquillago', '海奎拉戈'],
  ['Sundo', '茅膏仔'], ['Sunduel', '茅膏剑客'], ['Sunduke', '茅膏公爵'],
  ['Cactiny', '小仙掌'], ['Cactician', '仙掌谋士'], ['Cactitan', '仙掌泰坦'],
  ['Mushrunt', '菇仔'], ['Mushroar', '吼菇'], ['Mushrumble', '轰隆菇'],
  ['Mindragora', '小曼德拉'], ['Maxdragora', '大曼德拉'], ['Allraune', '阿尔劳娜'],
]);

export const GALLERY_SOURCES = new Map([
  ['Eldamon Legends: Air', '爱达梦传奇：气'],
  ['Eldamon Legends: Earth', '爱达梦传奇：土'],
  ['Eldamon Legends: Fire', '爱达梦传奇：火焰'],
  ['Eldamon Legends: Water', '爱达梦传奇：水'],
  ['Eldamon Legends: Wood', '爱达梦传奇：木'],
]);

export function installEldamonGalleryDisplay({hooks, getGame}) {
  // Legends records from the latest gallery render. The image popout is opened from that render.
  let shown = new Set();

  function enabled() {
    try {
      const game = getGame();
      return game.system?.id === 'pf2e' && game.i18n?.lang === 'cn'
        && ['babele', LEGENDS, EXTRA].every(id => game.modules.get(id)?.active === true)
        && ['full', 'ondemand'].includes(game.settings.get('babele', 'loadingMode'));
    } catch { return false; }
  }
  function isGallery(app) {
    return !!app && app === getGame().modules.get(READER)?.application && app.database instanceof Map;
  }
  // A key that another datasheet has taken over resolves to that sheet's record and is left alone.
  function legendsRecord(app, key) {
    const record = app.database.get(key);
    return shown.has(record) ? record : null;
  }
  function rename(node, label) {
    const name = GALLERY_LABELS.get(label);
    if (name && node && node.textContent === label) node.textContent = name;
  }

  function onRenderGallery(app, element, context) {
    if (!enabled() || !isGallery(app) || typeof element?.querySelectorAll !== 'function') return;
    const sheets = Array.isArray(context?.sources) ? context.sources : [];
    shown = new Set(sheets
      .filter(sheet => sheet?.id === SHEET && sheet.module?.id === LEGENDS && Array.isArray(sheet.data))
      .flatMap(sheet => sheet.data));
    if (!shown.size) return;
    for (const cell of element.querySelectorAll('[data-application-part="grid"] > .grid > .preview[data-key]')) {
      rename(cell.querySelector(':scope > figure > figcaption'), legendsRecord(app, cell.dataset.key)?.label);
    }
    const selection = element.querySelector('[data-application-part="details"] > section.selection[data-selection]');
    const record = selection && legendsRecord(app, selection.dataset.selection);
    if (!record) return;
    rename(selection.querySelector(':scope > header > p'), record.label);
    const info = selection.querySelector(':scope > header > div > i.info[data-tooltip]');
    const tooltip = info?.getAttribute('data-tooltip'), source = GALLERY_SOURCES.get(record.source);
    const native = `<em>${record.source}</em>`;
    if (source && tooltip?.endsWith(native)) {
      info.setAttribute('data-tooltip', `${tooltip.slice(0, -native.length)}<em>${source}</em>`);
    }
  }

  // The gallery's inspect action opens an ImagePopout titled with the record label. Retitling it
  // before the frame is drawn also covers the title sent when the GM shares the image.
  function onPreRenderImagePopout(popout, context, options) {
    if (!options?.isFirstRender || !enabled()) return;
    const app = getGame().modules.get(READER)?.application;
    if (!isGallery(app)) return;
    const record = legendsRecord(app, app.session?.selected), name = GALLERY_LABELS.get(record?.label);
    const window = popout?.options?.window;
    if (!name || !window || window.title !== record.label
      || popout.options.src !== (record.art?.[app.session.preview] || record.art?.portrait)) return;
    window.title = name;
    if (options.window) options.window.title = name;
    if (context) context.title = context.altText = name;
  }

  hooks.on('renderGalleryApplication', onRenderGallery);
  hooks.on('preRenderImagePopout', onPreRenderImagePopout);
}

if (globalThis.Hooks) installEldamonGalleryDisplay({hooks: globalThis.Hooks, getGame: () => globalThis.game});
