const nil = v => v ?? null;
const packOK = value => !value || value.startsWith('pf2e-bastion-of-blasphemies.');
const stable = v => JSON.stringify(v, (_k, x) => x && typeof x === 'object' && !Array.isArray(x)
  ? Object.fromEntries(Object.keys(x).sort().map(k => [k, x[k]])) : x);
const same = (a, b) => stable(a) === stable(b);
const freeze = x => { if (x && typeof x === 'object') { Object.values(x).forEach(freeze); Object.freeze(x); } return x; };
const tupleKeys = ['outcome', 'predicate', 'selector', 'text', 'title', 'visibility'];
const validTuple = x => x && same(Object.keys(x).sort(), tupleKeys) && typeof x.selector === 'string'
  && typeof x.text === 'string' && (x.title === null || typeof x.title === 'string')
  && Array.isArray(x.predicate) && Array.isArray(x.outcome) && [null, 'gm', 'owner'].includes(x.visibility);

/** Project approved text into existing final chat nodes; never alter note or document data. */
export function installBobNoteDisplay({NoteRuleClass, ItemClass, ActorClass, ChatMessageClass, TextEditorClass,
  bindings, isEnabled, getUser, getActors = () => [], matchesPreparedName = () => false}) {
  if ([NoteRuleClass, ItemClass, ActorClass, ChatMessageClass, TextEditorClass, isEnabled, getUser, getActors]
    .some(v => typeof v !== 'function') || !Array.isArray(bindings)) throw Error('Native Note consumers and gates required.');
  const rows = bindings.map(b => {
    if (b.approved !== true || !['actorItem','worldItem'].includes(b.scope) || b.sourceRule?.key !== 'Note'
      || !Number.isInteger(b.ruleIndex) || !/^[a-f0-9]{64}$/.test(b.sourceRuleSha256 ?? '')
      || !Object.keys(b.display ?? {}).length || Object.entries(b.display).some(([k,v]) => !['title','text'].includes(k)
        || typeof v !== 'string' || !/^[a-f0-9]{64}$/.test(b.approvalHashes?.[k] ?? '')))
      throw Error('Invalid approved Note binding.');
    return freeze(JSON.parse(JSON.stringify(b)));
  });
  const keys = rows.map(r => `${r.scope}/${r.actorId}/${r.itemId}/${r.ruleIndex}`);
  if (new Set(keys).size !== keys.length) throw Error('Duplicate Note identity binding.');
  const restorations = [], noteMethods = new Map(), captured = new WeakMap(), transient = new WeakMap();
  let active = true;
  const enabled = () => active && isEnabled() && !!getUser();
  function wrap(object, key, factory) {
    const own = Object.getOwnPropertyDescriptor(object, key);
    let owner = object;
    while (owner && !Object.hasOwn(owner, key)) owner = Object.getPrototypeOf(owner);
    const descriptor = owner && Object.getOwnPropertyDescriptor(owner, key);
    if (typeof descriptor?.value !== 'function' || own?.configurable === false) throw Error(`Native ${key} unavailable.`);
    const wrapped = factory(descriptor.value);
    Object.defineProperty(object, key, {...descriptor, configurable:true, value:wrapped});
    restorations.push(() => {
      if (Object.getOwnPropertyDescriptor(object, key)?.value !== wrapped) return;
      if (own) Object.defineProperty(object, key, own); else delete object[key];
    });
    return descriptor.value;
  }
  function actorOK(actor) {
    return actor instanceof ActorClass && actor.parent == null && actor.isToken === false && packOK(actor.pack);
  }
  // The optional proof covers only an approved native derived name; all Note source and marker gates remain below.
  function preparedNameOK(item, row) { try { return matchesPreparedName(item, row) === true; } catch { return false; } }
  function resolveRule(rule) {
    if (!enabled() || !(rule instanceof NoteRuleClass) || rule.key !== 'Note' || rule.ignored) return null;
    const item = rule.item, actor = item?.actor, source = item?._source, as = actor?._source;
    if (!(item instanceof ItemClass) || !actorOK(actor) || item.parent !== actor || actor.items?.get(item.id) !== item
      || !item.rules?.includes(rule) || rule.actor !== actor || !packOK(item.pack)) return null;
    const matches = rows.filter(row => {
      if (rule.sourceIndex !== row.ruleIndex || item.type !== row.itemType || source?.type !== row.itemType
        || (item.name !== row.itemName && !preparedNameOK(item, row)) || source.name !== row.itemName
        || nil(source._stats?.compendiumSource) !== nil(row.itemSourceUuid)
        || nil(source.system?.slug) !== nil(row.itemSlug) || nil(item.system?.slug) !== nil(row.itemSlug)
        || source.system?.description?.value !== row.description || item.system?.description?.value !== row.description
        || (source.system?.description?.gm ?? '') !== row.descriptionGM || (item.system?.description?.gm ?? '') !== row.descriptionGM
        || !same(source.system?.rules?.[row.ruleIndex], row.sourceRule)) return false;
      if (row.scope === 'actorItem') {
        if (actor.id !== row.actorId || as?._id !== row.actorId || actor.type !== row.actorType || as.type !== row.actorType
          || actor.name !== row.actorName || as.name !== row.actorName
          || nil(as.folder) !== nil(row.actorFolderId) || nil(as._stats?.compendiumSource) !== nil(row.actorSourceUuid)
          || item.id !== row.itemId || source._id !== row.itemId || nil(source.folder) !== nil(row.itemFolderId)) return false;
      } else {
        // Existing identity module's approved owned-copy marker, read only. No marker propagation here.
        const marker = source.flags?.['pf2e-compendium-extra-cn']?.bobIdentity, identity = row.markerIdentity;
        if (!identity || identity.scope !== 'worldItem' || identity.itemId !== row.itemId
          || !same(Object.keys(marker ?? {}).sort(), ['approvalFingerprint','key','sourceFingerprint','version'])
          || marker.version !== 1 || marker.key !== `worldItem//${row.itemId}`
          || marker.sourceFingerprint !== identity.sourceFingerprint || marker.approvalFingerprint !== identity.approvalFingerprint
          || identity.approvedName !== row.itemName || identity.itemType !== row.itemType) return false;
      }
      const r = row.sourceRule, selectors = typeof r.selector === 'string' ? [r.selector] : r.selector ?? [];
      return same([...rule.selector], selectors) && same([...rule.predicate], r.predicate ?? [])
        && same([...rule.outcome], r.outcome ?? []) && nil(rule.visibility) === nil(r.visibility)
        && nil(rule.title) === nil(r.title) && rule.text === r.text;
    });
    return matches.length === 1 ? {row:matches[0], item, actor, rule} : null;
  }
  function injected(value, item) {
    if (Array.isArray(value)) return value.map(v => injected(v,item));
    if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k,v]) => [k,injected(v,item)]));
    if (typeof value !== 'string') return value;
    return value.replace(/\{item\|([^}]+)\}/g, (all, key) => ({id:item.id, _id:item.id, name:item.name,
      description:item.description, 'system.description.gm':item.system.description.gm})[key] ?? all);
  }
  function expectedTuples(binding) {
    const {row, item} = binding, r = row.sourceRule;
    let title = injected(r.title ?? null,item)?.trim() ?? null;
    if (title === item.name && title.includes(':')) title = title.replace(/^[^:]+:\s*|\s*\([^)]+\)$/g, '');
    const text = String(injected(r.text,item)).trim();
    const selectors = typeof r.selector === 'string' ? [r.selector] : r.selector ?? [];
    return selectors.map(s => ({selector:injected(s,item),title,text,predicate:injected(r.predicate ?? [],item),
      outcome:r.outcome ?? [],visibility:r.visibility ?? null}));
  }
  function approve(note) {
    const binding = resolveRule(note?.rule);
    if (!binding || typeof note.toObject !== 'function') return null;
    const tuple = note.toObject();
    return validTuple(tuple) && expectedTuples(binding).some(t => same(t,tuple)) ? {...binding,note,tuple} : null;
  }
  function notes(actor) {
    return [...new Set(Object.values(actor?.synthetics?.rollNotes ?? {}).flat())]
      .filter(n => n && typeof n.toObject === 'function');
  }
  function observe(note) {
    const proto = Object.getPrototypeOf(note);
    if (noteMethods.has(proto)) return;
    const native = wrap(proto,'toHTML', original => function (...args) {
      const result = Reflect.apply(original,this,args);
      const binding = approve(this);
      if (binding && result instanceof HTMLElement) {
        let map = captured.get(binding.actor);
        if (!map) captured.set(binding.actor,map = new Map());
        map.set(stable(binding.tuple), {tuple:binding.tuple,raw:result.outerHTML});
      }
      return result;
    });
    noteMethods.set(proto,native);
  }
  function actorsFor(message) {
    return [...new Set([message.speakerActor,message.actor,message.target?.actor])].filter(actorOK);
  }
  function find(tuple, actors) {
    if (!validTuple(tuple)) return null;
    const matching = actors.flatMap(actor => notes(actor).filter(n => same(n.toObject(),tuple)));
    return matching.length === 1 ? approve(matching[0]) : null;
  }
  const parse = html => { const template = document.createElement('template'); template.innerHTML = html; return template.content; };
  function originalHTML(note, data) {
    observe(note);
    const native = noteMethods.get(Object.getPrototypeOf(note));
    return Reflect.apply(native,new note.constructor(data),[]).outerHTML;
  }
  function rawVariants(binding) {
    const {note,tuple,row} = binding, fields = ['title','text'];
    let values = [{...tuple}];
    for (const field of fields) {
      const english = row.nativeEnglish[tuple[field]];
      if (typeof english === 'string') values.push(...values.map(v => ({...v,[field]:english})));
    }
    return new Set(values.flatMap(v => [originalHTML(note,{...v,rule:note.rule}),originalHTML(note,{...v,rule:null})]));
  }
  function snapshot(message, actors) {
    const u = getUser();
    return [u,u?.id,u?.role,u?.isGM,message.isContentVisible,message._source.flavor,
      stable(message._source.flags?.pf2e?.context),...actors.flatMap(a => [a,a.isOwner,a.hasPlayerOwner])];
  }
  const unchanged = (a,b) => a.length === b.length && a.every((v,i) => Object.is(v,b[i]));
  function sourceTuples(message) {
    const serialized = message._source.flags?.pf2e?.context?.notes;
    return Array.isArray(serialized) ? serialized : transient.get(message) ?? [];
  }
  async function project(message, dom) {
    if (!enabled() || message.isContentVisible !== true || !(dom instanceof HTMLElement)) return dom;
    const actors = actorsFor(message), start = snapshot(message,actors), tuples = sourceTuples(message);
    const sourceHTML = message._source.flavor;
    if (!actors.length || typeof sourceHTML !== 'string' || !tuples.length) return dom;
    const sourceNodes = [...parse(sourceHTML).querySelectorAll('li.roll-note')], changes = [];
    const options = () => ({rollData:message.getRollData(),relativeTo:message,processVisibility:true,secrets:getUser()?.isGM === true});
    for (const tuple of tuples) {
      const binding = find(tuple,actors);
      if (!binding || tuples.filter(t => same(t,tuple)).length !== 1) continue;
      const variants = rawVariants(binding), rawNodes = sourceNodes.filter(n => variants.has(n.outerHTML));
      if (rawNodes.length !== 1) continue;
      const raw = rawNodes[0].outerHTML;
      const nativeDisplay = parse(await TextEditorClass.enrichHTML(raw,options())).querySelector('li.roll-note');
      if (!nativeDisplay) continue;
      const live = [...dom.querySelectorAll('li.roll-note')].filter(n => n.outerHTML === nativeDisplay.outerHTML);
      if (live.length !== 1) continue;
      const rule = rawNodes[0].hasAttribute('data-item-id') ? binding.note.rule : null;
      const translated = originalHTML(binding.note,{...tuple,...binding.row.display,rule});
      const display = parse(await TextEditorClass.enrichHTML(translated,options())).querySelector('li.roll-note');
      if (!display || !same([...display.attributes].map(a => [a.name,a.value]),[...live[0].attributes].map(a => [a.name,a.value]))) continue;
      changes.push({binding,tuple,node:live[0],before:live[0].outerHTML,display});
    }
    if (!enabled() || !unchanged(start,snapshot(message,actors))) return null;
    for (const change of changes) {
      const now = find(change.tuple,actors);
      if (now?.item !== change.binding.item || now.rule !== change.binding.rule || now.row !== change.binding.row
        || !dom.contains(change.node) || change.node.outerHTML !== change.before) return null;
    }
    for (const {node,display} of changes) node.replaceChildren(...display.childNodes);
    return dom;
  }
  try {
    wrap(NoteRuleClass.prototype,'beforePrepareData', native => function (...args) {
      const result = Reflect.apply(native,this,args);
      if (enabled()) for (const n of notes(this.actor)) if (n.rule instanceof NoteRuleClass) observe(n);
      return result;
    });
    wrap(ChatMessageClass.prototype,'_onCreate', native => function (...args) {
      const [data, _options, userId] = args, message = this;
      // The native hook calls ui.chat.postOne before create() resolves. Capture
      // synchronously before that hook, and only on the originating client.
      if (enabled() && userId === getUser().id && message instanceof ChatMessageClass
        && message._source.flags?.pf2e?.context?.type === 'damage-taken'
        && typeof data?.flavor === 'string' && data.flavor === message._source.flavor
        && same(data.flags?.pf2e?.context,message._source.flags?.pf2e?.context)
        && same(data.speaker,message._source.speaker)) {
        const actors = actorsFor(message), nodes = [...parse(data.flavor).querySelectorAll('li.roll-note')], values = [];
        for (const node of nodes) {
          const matches = actors.flatMap(actor => [...(captured.get(actor)?.values() ?? [])].filter(v => v.raw === node.outerHTML));
          if (matches.length !== 1 || !find(matches[0].tuple,actors)) continue;
          values.push(JSON.parse(JSON.stringify(matches[0].tuple)));
        }
        if (values.length) transient.set(message,values);
      }
      return Reflect.apply(native,this,args);
    });
    wrap(ChatMessageClass.prototype,'renderHTML', native => async function (...args) {
      const dom = await Reflect.apply(native,this,args);
      try {
        const display = await project(this,dom);
        return display ?? Reflect.apply(native,this,args);
      } catch {
        // Projection is optional. The original renderer and original data remain authoritative.
        return Reflect.apply(native,this,args);
      }
    });
    for (const actor of getActors()) for (const n of notes(actor)) if (n.rule instanceof NoteRuleClass) observe(n);
  } catch (error) {
    active = false; restorations.reverse().forEach(restore => restore()); throw error;
  }
  const dispose = () => { active = false; restorations.splice(0).reverse().forEach(restore => restore()); };
  dispose.isActive = () => active;
  return dispose;
}
