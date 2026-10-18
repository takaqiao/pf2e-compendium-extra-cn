import data from './team-plus-aspect-data.mjs';
import {replaceText} from './team-plus-presentation-core.mjs';

function label(table, slug, context) {
  const entry = context.config?.[table]?.[slug];
  const key = typeof entry === 'string' ? entry : entry?.label;
  if (!key) return slug;
  const value = context.localize(key);
  return value && value !== key ? value : /[\u3400-\u9fff]/.test(key) ? key : slug;
}

function saves(text) {
  if (!/^Fort (?:[+-]\d+|0)(, | · )Ref (?:[+-]\d+|0)\1Will (?:[+-]\d+|0)( \(to your own\))?$/.test(text)) return text;
  return text.replace('Fort ', '强韧 ').replace('Ref ', '反射 ').replace('Will ', '意志 ')
    .replace(' (to your own)', '（加到自身豁免上）');
}

/** Translate only a complete string emitted by the named configurator field. */
export function aspectText(kind, text, context = {}) {
  if (typeof text !== 'string') return text;
  const source = text.trim();
  let result = source;
  if (kind === 'title') result = source.replace(/^Configure (.+)$/, '配置$1');
  else if (kind === 'mode') result = source.replace(/^(Shift|Summon)(?: for (.+))?$/, (_, mode, actor) => `${mode === 'Shift' ? '变形' : '召唤'}${actor ? `（目标：${actor}）` : ''}`);
  else if (kind === 'caster') result = source.replace(/^(.+) · level (\d+) · spell DC (\d+)$/, '$1 · $2级 · 法术DC $3');
  else if (kind === 'count') result = source.replace(/^Pick (\d+)\.$/, '选择$1项。');
  else if (kind === 'issue') {
    result = source.replace(/^(?:(.+): )?No option is available\.$/, (_, name) => `${name ? `${name}：` : ''}没有可用选项。`)
      .replace(/^(?:(.+): )?Pick (\d+) \((\d+) picked\)\.$/, (_, name, count, picked) => `${name ? `${name}：` : ''}选择${count}项（已选${picked}项）。`);
  } else if (kind === 'changed') result = source.replace(/^was (.+)$/, (_, value) => `原为${value === 'nothing' ? '无' : saves(value)}`);
  else if (kind === 'save-choice' || kind === 'Saves') result = saves(source);
  else if (kind === 'size-card') {
    result = source.replace(/^reach (\d+) ft$/, '触及$1尺').replace(/^\+(\d+) ft Speed$/, '+$1尺速度')
      .replace(/^(.+) · reach (\d+) ft(?: · (\d+) × (\d+) ft)?$/, (_, size, reach, width, height) => `${size} · 触及${reach}尺${width ? ` · ${width} × ${height}尺` : ''}`);
  } else if (kind === 'Size') result = source.replace(/^(.+), reach (\d+) ft(?:, (\d+) × (\d+) ft)?$/, (_, size, reach, width, height) => `${size}, 触及${reach}尺${width ? `, ${width} × ${height}尺` : ''}`);
  else if (kind === 'Speed') {
    if (source === 'none') result = '无';
    else result = source.split(', ').map(speed => speed.replace(/^(?:(burrow|climb|fly|swim) )?(\d+) ft$/, (_, type, value) => {
      const key = type && `PF2E.Actor.Speed.Type.${type[0].toUpperCase()}${type.slice(1)}`;
      const localized = key && context.localize(key);
      return `${type ? (localized && localized !== key ? localized : `${type} `) : ''}${value}尺`;
    })).join(', ');
  } else if (kind === 'Traits' || kind === 'strike-traits') {
    result = source.split(', ').map(slug => label(kind === 'Traits' ? 'creatureTraits' : 'npcAttackTraits', slug, context)).join(', ');
  } else if (kind === 'Skills') {
    result = source.split(', ').map(skill => skill.replace(/^(.+) ([+-]\d+|0)$/, (original, name, value) =>
      Object.hasOwn(data.skillLabels, name) ? `${data.skillLabels[name]} ${value}` : original)).join(', ');
  } else if (kind === 'Senses') {
    result = source.split(', ').map(sense => {
      const match = sense.match(/^([a-z][a-z -]*)(?: \(([a-z]+)\))?(?: (\d+) ft)?$/);
      if (!match) return sense;
      const slug = match[1].replaceAll(' ', '-'), translated = label('senses', slug, context);
      if (translated === slug) return sense;
      return translated + (match[2] ? `（${label('senseAcuities', match[2], context)}）` : '') + (match[3] ? `${match[3]}尺` : '');
    }).join(', ');
  } else if (kind === 'Defenses') {
    result = source.split('; ').map(part => {
      const match = part.match(/^(Immune|Resist|Weak) ([a-z0-9, -]+)$/);
      if (!match) return part;
      const [table, heading] = {Immune: ['immunityTypes', '免疫'], Resist: ['resistanceTypes', '抗力'], Weak: ['weaknessTypes', '弱点']}[match[1]];
      return heading + match[2].split(', ').map(value => value.replace(/^([a-z-]+)(.*)$/, (_, slug, amount) => label(table, slug, context) + amount)).join(', ');
    }).join('; ');
  } else if (kind === 'strike') {
    result = source.replace(/^([+-]\d+) \((\d+d\d+(?:[+-]\d+){0,2}) ([a-z][a-z-]*)(?:, range (\d+) ft)?\)$/, (_, attack, dice, type, range) => `${attack} (${dice} ${label('damageTypes', type, context)}${range ? `, 射程${range}尺` : ''})`);
  } else if (kind === 'art-use') {
    result = source === 'Use' ? '使用' : source === 'art' ? '的立绘' : source.replace(/^Use (.+)'s art$/, '使用$1的立绘');
  } else if (kind === 'art-tooltip') result = source.replace(/^Uncheck (.+)'s art to use your own$/, '取消勾选$1的立绘后，可使用自定义图像');
  else if (kind === 'art-placeholder') result = source === 'Default' ? '默认' : source.replace(/^(.+)'s art$/, '$1的立绘');
  else if (kind === 'name-placeholder') result = source.replace(/^(.+)'s (.+)$/, '$1的$2');
  else if (kind === 'art-missing') result = source.replace(/^No art is installed for (.+)\. A token art module, such as Pathfinder Tokens: Bestiaries, can provide it\.$/, '未安装$1的立绘。可通过Pathfinder Tokens: Bestiaries等Token立绘模组提供。');
  return result === source ? text : text.replace(source, result);
}

export function isAspectConfigurator(app) {
  const classes = app?.options?.classes;
  return Array.isArray(classes) && classes.includes('magic-plus') && classes.includes('aspect-configurator');
}

function directText(element, kind, context) {
  let count = 0;
  for (const node of element.childNodes) {
    if (node.nodeType !== 3) continue;
    const translated = aspectText(kind, node.data, context);
    if (translated !== node.data) { node.data = translated; count++; }
  }
  return count;
}

export function presentAspect(app, root, context) {
  if (!isAspectConfigurator(app) || !root?.matches('.magic-plus.aspect-configurator')
    || !root.querySelector('.aspect-header input[name="rank"]') || !root.querySelector('.aspect-footer [data-action="confirm"]')) return 0;
  let count = 0;
  // Read the source heading before replacing it, so a value never leaks into another context.
  for (const heading of root.querySelectorAll('.aspect-preview dt')) {
    const value = heading.nextElementSibling;
    if (value?.tagName === 'DD') count += directText(value, heading.textContent.trim(), context);
  }
  for (const [selector, kind] of [
    ['.window-title', 'title'], ['.aspect-mode', 'mode'], ['.aspect-caster', 'caster'],
    ['.aspect-field > p.hint', 'count'], ['.aspect-issue, .aspect-issues > li', 'issue'],
    ['.aspect-changed', 'changed'], ['.aspect-saves .aspect-choice > span', 'save-choice'],
    ['.aspect-size > span, .aspect-field > p', 'size-card'],
    ['.aspect-strikes > li', 'strike'], ['.aspect-strikes .aspect-traits', 'strike-traits'],
    ['.aspect-art-bestiary > span', 'art-use'], ['.aspect-art > p.hint', 'art-missing'],
  ]) for (const element of root.querySelectorAll(selector)) count += directText(element, kind, context);
  for (const element of root.querySelectorAll('.aspect-art-row > label[data-tooltip]')) {
    const before = element.getAttribute('data-tooltip'), after = aspectText('art-tooltip', before, context);
    if (after !== before) { element.setAttribute('data-tooltip', after); count++; }
  }
  for (const element of root.querySelectorAll('.aspect-art file-picker[placeholder], .aspect-art file-picker input[placeholder], .aspect-art input[name="art.name"][placeholder]')) {
    const before = element.getAttribute('placeholder');
    const after = aspectText(element.getAttribute('name') === 'art.name' ? 'name-placeholder' : 'art-placeholder', before, context);
    if (after !== before) { element.setAttribute('placeholder', after); count++; }
  }
  for (const row of data.labels) for (const element of root.querySelectorAll(row.selector)) count += replaceText(element, row.source, row.translation);
  return count;
}

/** This dialog has no producer flag; require an open recognised configurator and its complete form. */
export function presentAspectPreset(app, root, hasConfigurator, saveLabel = 'Save') {
  if (!hasConfigurator || (app.title ?? app.options?.window?.title) !== 'Save Aspect Preset') return 0;
  const label = root?.querySelector('.dialog-content > label');
  const input = label?.querySelector('input[type="text"][name="name"]');
  const button = root?.querySelector('button[data-action="ok"]');
  if (!input || label.textContent.trim() !== 'Preset name' || !['Save', saveLabel].includes(button?.textContent.trim())) return 0;
  return replaceText(root.querySelector('.window-title'), 'Save Aspect Preset', '保存层面预设')
    + replaceText(label, 'Preset name', '预设名称') + replaceText(button, 'Save', '保存');
}
