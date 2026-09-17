import {prepareBobTokenItemIdentity} from './bob-token-item-identity.mjs';
const installed = new WeakSet();
const normalized = value => value ?? null;
const BOB_PACK_PREFIX = 'pf2e-bastion-of-blasphemies.';
const EXTRA_ID = 'pf2e-compendium-extra-cn';

/** Adapt only proved name-fallback consumers. Ordinary Item.slug stays native. */
export function installBobIdentityCompatibility({ItemClass, itemClasses, LoreClass, NPCClass, HazardClass, MeleeClass,
  ActorClass, ActorDeltaClass, TokenDocumentClass, SceneClass,
  EffectClass, SpellcastingEntryClass, RuleElementClass, TextEditorClass, CharacterClass, FeatClass, ActorClasses = [], ActorSheetClasses = [], inlineDamage = false,
  attackEffectLabels = {}, sluggify, identities, isEnabled}) {
  const prototypes = new Set();
  for (const ItemClass of itemClasses) {
    for (let prototype = ItemClass.prototype; prototype && prototype !== Object.prototype; prototype = Object.getPrototypeOf(prototype)) {
      prototypes.add(prototype);
    }
  }
  if ([...prototypes].some(prototype => installed.has(prototype))) {
    throw new Error('BoB identity compatibility is already installed.');
  }
  const lore = Object.getOwnPropertyDescriptor(LoreClass.prototype, 'slug');
  const attack = Object.getOwnPropertyDescriptor(NPCClass.prototype, 'getAttackEffects');
  if (typeof lore?.get !== 'function' || typeof attack?.value !== 'function'
    || typeof sluggify !== 'function' || typeof isEnabled !== 'function') {
    throw new Error('PF2e identity consumers or utility are unavailable.');
  }
  const methodOwner = (prototype, key) => {
    while (prototype && !Object.hasOwn(prototype, key)) prototype = Object.getPrototypeOf(prototype);
    return prototype;
  };
  const requireMethod = (target, key) => {
    const descriptor = target && Object.getOwnPropertyDescriptor(target, key);
    if (typeof descriptor?.value !== 'function' || descriptor.configurable !== true) {
      throw new Error(`PF2e compatible own method is unavailable: ${key}`);
    }
  };
  if (lore.configurable !== true || attack.configurable !== true) throw new Error('PF2e identity getters are not configurable.');
  // Preflight every optional native entry before the first prototype mutation.
  if (ItemClass) requireMethod(methodOwner(ItemClass.prototype, 'prepareRuleElements'), 'prepareRuleElements');
  if (EffectClass) requireMethod(EffectClass.prototype, 'prepareBaseData');
  if (SpellcastingEntryClass) for (const key of ['prepareBaseData','buildStatistic']) requireMethod(SpellcastingEntryClass.prototype,key);
  if (MeleeClass) {
    requireMethod(MeleeClass.prototype,'prepareSiblingData');
    for (const ActorClass of new Set([NPCClass,HazardClass].filter(Boolean))) requireMethod(ActorClass.prototype,'prepareDerivedData');
  }
  if (RuleElementClass) requireMethod(RuleElementClass.prototype,'resolveInjectedProperties');
  if (TextEditorClass) requireMethod(TextEditorClass,'createActionOptions');
  if (CharacterClass) requireMethod(CharacterClass.prototype,'prepareFeats');
  if (FeatClass) {
    requireMethod(FeatClass.prototype,'prepareActorData');
    const descriptor = Object.getOwnPropertyDescriptor(methodOwner(FeatClass.prototype,'slug'),'slug');
    if (typeof descriptor?.get !== 'function' || (Object.hasOwn(FeatClass.prototype,'slug') && descriptor.configurable !== true)) {
      throw new Error('PF2e compatible Feat slug getter is unavailable.');
    }
  }
  for (const prototype of prototypes) if (Object.hasOwn(prototype,'getRollOptions')) requireMethod(prototype,'getRollOptions');
  const statisticOwners = new Set(ActorClasses.map(ActorClass => methodOwner(ActorClass.prototype,'getStatistic')));
  for (const owner of statisticOwners) requireMethod(owner,'getStatistic');
  const collectDropOwners = classes => {
    const owners = new Set();
    for (const SheetClass of classes) {
      let owner = null;
      for (let prototype = SheetClass.prototype; prototype; prototype = Object.getPrototypeOf(prototype)) {
        if (Object.hasOwn(prototype,'_handleDroppedItem')) owner = prototype;
      }
      if (owner) owners.add(owner);
    }
    for (const owner of owners) requireMethod(owner,'_handleDroppedItem');
    if (classes.length && !owners.size) throw new Error('PF2e actor sheet drop entry is unavailable.');
    return owners;
  };
  const dropOwners = collectDropOwners(ActorSheetClasses);
  const baseSlugOwner = ItemClass && methodOwner(ItemClass.prototype,'slug');
  if (inlineDamage) {
    const descriptor = baseSlugOwner && Object.getOwnPropertyDescriptor(baseSlugOwner,'slug');
    if (typeof descriptor?.get !== 'function' || descriptor.configurable !== true) throw new Error('PF2e configurable Item slug getter is unavailable.');
    for (const key of ['enrichString','_onClickInlineRoll']) requireMethod(TextEditorClass,key);
  }
  if (MeleeClass) {
    const owner = methodOwner(MeleeClass.prototype,'slug'), descriptor = owner && Object.getOwnPropertyDescriptor(owner,'slug');
    if (typeof descriptor?.get !== 'function' || (Object.hasOwn(MeleeClass.prototype,'slug') && descriptor.configurable !== true)) {
      throw new Error('PF2e compatible Melee slug getter is unavailable.');
    }
  }
  const rows = new Map();
  for (const identity of identities) {
    const key = identity.scope === 'tokenItem'
      ? `${identity.scope}/${identity.sceneId}/${identity.tokenId}/${identity.actorId}/${identity.itemId}`
      : `${identity.scope}/${identity.actorId ?? ''}/${identity.itemId}`;
    if (rows.has(key)) throw new Error(`Duplicate BoB approved identity: ${key}`);
    rows.set(key, Object.freeze({...identity}));
  }
  const tokenItems = prepareBobTokenItemIdentity({identities:[...rows.values()],ActorClass,ActorDeltaClass,TokenDocumentClass,SceneClass});
  let active = true;
  const hasFingerprints = identity => identity?.scope === 'worldItem'
    && /^[a-f0-9]{64}$/.test(identity.sourceFingerprint) && /^[a-f0-9]{64}$/.test(identity.approvalFingerprint);
  const markerIdentity = item => {
    const marker = item._source?.flags?.[EXTRA_ID]?.bobIdentity;
    if (!marker || typeof marker !== 'object' || Array.isArray(marker) || marker.version !== 1
      || Object.keys(marker).sort().join(',') !== 'approvalFingerprint,key,sourceFingerprint,version') return null;
    const identity = rows.get(marker.key);
    return hasFingerprints(identity) && marker.sourceFingerprint === identity.sourceFingerprint
      && marker.approvalFingerprint === identity.approvalFingerprint ? identity : null;
  };
  function approved(item, ruleConsumer = false) {
    if (!active || !isEnabled() || !ruleConsumer && item.system?.slug != null) return null;
    const actor = item.actor ?? (item.parent?.documentName === 'Actor' ? item.parent : null);
    if ([item.pack, actor?.pack].some(pack => pack && !pack.startsWith(BOB_PACK_PREFIX))) return null;
    // Only an owned copy may use a marker; an unowned source must still pass
    // the original Adventure identity. The marker binds one approved version,
    // original source fingerprint, exact translated name and Item type.
    if (actor) {
      const identity = markerIdentity(item);
      if (identity && item.type === identity.itemType && item.name === identity.approvedName
        && (!ruleConsumer || normalized(item.system?.slug) === normalized(identity.itemSlug))) return identity;
    }
    if (actor && tokenItems.hasOwnDeltaItem(item,actor)) return tokenItems.resolve(item,actor);
    const scope = actor ? 'actorItem' : 'worldItem';
    const identity = rows.get(`${scope}/${actor?.id ?? ''}/${item.id}`);
    if (!identity || item.type !== identity.itemType || item.name !== identity.approvedName
      || ruleConsumer && normalized(item.system?.slug) !== normalized(identity.itemSlug)
      || normalized(item._source?.folder) !== normalized(identity.itemFolderId)
      || normalized(item._source?._stats?.compendiumSource) !== normalized(identity.itemSourceUuid)) return null;
    if (actor && (actor.type !== identity.actorType
      || normalized(actor._source?.folder) !== normalized(identity.actorFolderId)
      || normalized(actor._source?._stats?.compendiumSource) !== normalized(identity.actorSourceUuid))) return null;
    return identity;
  }

  // Native getters retain the real receiver (including private-field getters).
  // Only the consuming method sees the approved original name, never the source.
  // Foundry's items collection is an own, non-configurable, read-only property.
  // Use a separate facade target so overrides obey Proxy invariants as well.
  const viewOf = (target, overrides) => new Proxy(Object.create(Object.getPrototypeOf(target)), {
    get(_facade, key) { return Object.hasOwn(overrides, key) ? overrides[key] : Reflect.get(target, key, target); },
    has(_facade, key) { return key in target; }
  });
  const nameView = (item, identity) => viewOf(item, {name: identity.originalName});
  const restores = [];
  function replace(prototype, key, descriptor) {
    const previous = Object.getOwnPropertyDescriptor(prototype, key);
    try { Object.defineProperty(prototype, key, descriptor); }
    catch (error) {
      active = false;
      for (const restore of [...restores].reverse()) restore();
      throw error;
    }
    restores.push(() => {
      const current = Object.getOwnPropertyDescriptor(prototype, key);
      if (current?.value === descriptor.value && current?.get === descriptor.get) {
        if (previous) Object.defineProperty(prototype, key, previous);
        else delete prototype[key];
      }
    });
  }
  const installedDropOwners = new Set();
  tokenItems.install(replace);
  const markedDropCopy = item => {
    const identity = item && approved(item, true);
    if (identity?.scope !== 'worldItem' || item.actor || !hasFingerprints(identity)) return item;
    // This ephemeral copy preserves the native receiver/owner context. Each
    // original acquisition method retains its own clone and ID policy.
    const copy = item.clone({}, {keepId:true, parent:item.parent, pack:item.pack});
    copy.updateSource({flags:{[EXTRA_ID]:{bobIdentity:{version:1,
      key:`worldItem//${identity.itemId}`,sourceFingerprint:identity.sourceFingerprint,
      approvalFingerprint:identity.approvalFingerprint}}}});
    return copy;
  };
  function installDrops(owners) {
  for (const owner of owners) {
    if (installedDropOwners.has(owner)) continue;
    const descriptor = Object.getOwnPropertyDescriptor(owner,'_handleDroppedItem');
    replace(owner,'_handleDroppedItem',{...descriptor,value:function(event,item,...args){
      return Reflect.apply(descriptor.value,this,[event,markedDropCopy(item),...args]);
    }});
    installedDropOwners.add(owner);
  }
  }
  installDrops(dropOwners);
  if (CharacterClass) {
    const descriptor = Object.getOwnPropertyDescriptor(CharacterClass.prototype,'prepareFeats');
    const collections = new WeakSet();
    replace(CharacterClass.prototype,'prepareFeats',{...descriptor,value:function(...args){
      const result = Reflect.apply(descriptor.value,this,args);
      if (!active || collections.has(this.feats)) return result;
      try {
        const collection = this.feats, owner = collection && methodOwner(collection,'insertFeat');
        requireMethod(owner,'insertFeat');
        const previous = Object.getOwnPropertyDescriptor(collection,'insertFeat');
        if (!previous && !Object.isExtensible(collection)) throw new Error('PF2e feat collection cannot be adapted.');
        const original = collection.insertFeat;
        const wrapped = function(item,...args){return Reflect.apply(original,this,[markedDropCopy(item),...args]);};
        Object.defineProperties(wrapped,{name:{value:original.name},length:{value:original.length}});
        Object.defineProperty(collection,'insertFeat',{value:wrapped,configurable:true,writable:true,enumerable:false});
        collections.add(collection);
        // prepareFeats constructs a new collection each reset. Do not retain
        // obsolete collections, but restore every surviving instance on rollback.
        const reference = new WeakRef(collection);
        restores.push(()=>{
          const target = reference.deref();
          if (target && Object.getOwnPropertyDescriptor(target,'insertFeat')?.value === wrapped) {
            if (previous) Object.defineProperty(target,'insertFeat',previous);
            else delete target.insertFeat;
          }
        });
      } catch (error) { dispose(); throw error; }
      return result;
    }});
  }
  if (inlineDamage) {
    let depth = 0;
    const within = operation => { depth++; try { return operation(); } finally { depth--; } };
    const slug = Object.getOwnPropertyDescriptor(baseSlugOwner,'slug');
    replace(baseSlugOwner,'slug',{...slug,get:function(){
      const native = Reflect.apply(slug.get,this,[]);
      const identity = native == null && depth > 0 && approved(this);
      return identity ? sluggify(identity.originalName) : native;
    }});
    const enrich = Object.getOwnPropertyDescriptor(TextEditorClass,'enrichString');
    replace(TextEditorClass,'enrichString',{...enrich,value:function(match,...args){
      const invoke = () => Reflect.apply(enrich.value,this,[match,...args]);
      // Check enrichment has an intentional explicit-null slug branch. Only
      // Damage reaches the verified name-fallback domains before its first await.
      return match?.[1] === 'Damage' ? within(invoke) : invoke();
    }});
    const click = Object.getOwnPropertyDescriptor(TextEditorClass,'_onClickInlineRoll');
    replace(TextEditorClass,'_onClickInlineRoll',{...click,value:function(event,...args){
      const data = event?.target?.closest?.('a')?.dataset;
      const invoke = () => Reflect.apply(click.value,this,[event,...args]);
      return data?.formula && data.baseFormula && Object.hasOwn(data,'damageRoll') ? within(invoke) : invoke();
    }});
  }
  if (FeatClass) {
    const depth = new WeakMap();
    const nativeSlug = Object.getOwnPropertyDescriptor(methodOwner(FeatClass.prototype,'slug'),'slug').get;
    replace(FeatClass.prototype,'slug',{configurable:true,enumerable:false,get:function(){
      const native = Reflect.apply(nativeSlug,this,[]);
      const identity = native == null && depth.get(this) > 0 && approved(this);
      return identity ? sluggify(identity.originalName) : native;
    }});
    const descriptor = Object.getOwnPropertyDescriptor(FeatClass.prototype,'prepareActorData');
    replace(FeatClass.prototype,'prepareActorData',{...descriptor,value:function(...args){
      if (!approved(this)) return Reflect.apply(descriptor.value,this,args);
      // Native 8.5.1 is synchronous and reads its slug only for feat/feature
      // roll options. Keep the real receiver so same-Item comparisons and
      // this.name display attributions retain their original semantics.
      depth.set(this,(depth.get(this) ?? 0)+1);
      try { return Reflect.apply(descriptor.value,this,args); }
      finally { depth.set(this,depth.get(this)-1); }
    }});
  }
  const adaptedStatistics = new WeakSet();
  for (const owner of statisticOwners) {
    const descriptor = Object.getOwnPropertyDescriptor(owner,'getStatistic');
    replace(owner,'getStatistic',{...descriptor,value:function(...args){
      const statistic = Reflect.apply(descriptor.value,this,args);
      if (!statistic || typeof statistic.roll !== 'function' || adaptedStatistics.has(statistic)) return statistic;
      const own = Object.getOwnPropertyDescriptor(statistic,'roll');
      if (own?.configurable === false) return statistic;
      const original = statistic.roll;
      Object.defineProperty(statistic,'roll',{configurable:true,writable:true,value:function(options,...rest){
        const identity = options?.item && approved(options.item);
        if (identity && Array.isArray(options.extraRollOptions)) {
          const before = sluggify(identity.approvedName), after = sluggify(identity.originalName);
          const replacements = new Map(['origin','target'].map(role => [`${role}:action:slug:${before}`,`${role}:action:slug:${after}`]));
          const values = options.extraRollOptions.map(value => replacements.get(value) ?? value);
          if (values.some((value,index) => value !== options.extraRollOptions[index])) options = {...options,extraRollOptions:values};
        }
        return Reflect.apply(original,this,[options,...rest]);
      }});
      adaptedStatistics.add(statistic);
      return statistic;
    }});
  }
  if (TextEditorClass) {
    const descriptor = Object.getOwnPropertyDescriptor(TextEditorClass,'createActionOptions');
    replace(TextEditorClass,'createActionOptions',{...descriptor,value:function(item,...args){
      const identity = item && approved(item);
      return Reflect.apply(descriptor.value,this,[identity ? nameView(item,identity) : item,...args]);
    }});
  }
  if (RuleElementClass) {
    const descriptor = Object.getOwnPropertyDescriptor(RuleElementClass.prototype,'resolveInjectedProperties');
    replace(RuleElementClass.prototype,'resolveInjectedProperties',{...descriptor,value:function(value,options={}){
      const item = this.item, identity = item && approved(item, true);
      const expected = identity?.fallbackRules?.find(rule => rule.key === 'Weakness' && rule.sourceIndex === this.sourceIndex);
      const source = item?._source?.system?.rules?.[this.sourceIndex];
      if (this.key === 'Weakness' && value === this.definition && expected && source
        && JSON.stringify(source) === expected.sourceJSON && !this.invalid && !options.injectables?.item) {
        options = {...options,injectables:{...options.injectables,item:nameView(item,identity)}};
      }
      return Reflect.apply(descriptor.value,this,[value,options]);
    }});
  }
  if (MeleeClass) {
    const depth = new WeakMap(), suppressed = new WeakMap();
    const within = (items, operation) => {
      for (const item of items) depth.set(item, (depth.get(item) ?? 0) + 1);
      try { return operation(); }
      finally { for (const item of items) depth.set(item, depth.get(item) - 1); }
    };
    let slugOwner = MeleeClass.prototype;
    while (slugOwner && !Object.getOwnPropertyDescriptor(slugOwner, 'slug')) slugOwner = Object.getPrototypeOf(slugOwner);
    const nativeSlug = Object.getOwnPropertyDescriptor(slugOwner, 'slug').get;
    replace(MeleeClass.prototype, 'slug', {configurable: true, enumerable: false, get: function () {
      const native = Reflect.apply(nativeSlug, this, []);
      if (native != null || !(depth.get(this) > 0) || suppressed.get(this) > 0) return native;
      const identity = approved(this);
      return identity ? sluggify(identity.originalName) : native;
    }});
    const sibling = Object.getOwnPropertyDescriptor(MeleeClass.prototype, 'prepareSiblingData');
    replace(MeleeClass.prototype, 'prepareSiblingData', {...sibling, value: function (...args) {
      suppressed.set(this, (suppressed.get(this) ?? 0) + 1);
      try { return Reflect.apply(sibling.value, this, args); }
      finally { suppressed.set(this, suppressed.get(this) - 1); }
    }});
    for (const ActorClass of new Set([NPCClass, HazardClass].filter(Boolean))) {
      const prototype = ActorClass.prototype;
      const prepare = Object.getOwnPropertyDescriptor(prototype, 'prepareDerivedData');
      replace(prototype, 'prepareDerivedData', {...prepare, value: function (...args) {
        const items = (this.itemTypes?.melee ?? []).filter(item => approved(item));
        const result = within(items, () => Reflect.apply(prepare.value, this, args));
        for (const action of this.system.actions ?? []) {
          const item = action.item;
          if (item?.type === 'melee' && approved(item)) {
            for (const key of ['damage', 'critical']) {
              const original = action[key];
              if (typeof original !== 'function') continue;
              action[key] = function (...args) {
                // Native 8.5.1 computes damage domains before its first await.
                // Return its exact Promise and release scope immediately: never
                // keep a global or per-Item identity override across an await.
                return within([item], () => Reflect.apply(original, this, args));
              };
            }
          }
          for (const effect of action.additionalEffects ?? []) {
            if (attackEffectLabels[effect.tag] != null) continue;
            const target = this.items.find(item => {
              const identity = item.type !== 'melee' && approved(item);
              return identity && sluggify(identity.originalName) === effect.tag;
            });
            if (target) effect.label = target.name;
          }
        }
        return result;
      }});
    }
  }
  for (const prototype of prototypes) {
    const descriptor = Object.getOwnPropertyDescriptor(prototype, 'getRollOptions');
    if (typeof descriptor?.value !== 'function') continue;
    const original = descriptor.value;
    replace(prototype, 'getRollOptions', {...descriptor, value: function (...args) {
      const identity = approved(this);
      return Reflect.apply(original, identity ? nameView(this, identity) : this, args);
    }});
  }
  if (ItemClass) {
    let prototype = ItemClass.prototype;
    while (prototype && !Object.hasOwn(prototype, 'prepareRuleElements')) prototype = Object.getPrototypeOf(prototype);
    const prepare = Object.getOwnPropertyDescriptor(prototype, 'prepareRuleElements');
    replace(prototype, 'prepareRuleElements', {...prepare, value: function (...args) {
      const rules = Reflect.apply(prepare.value, this, args), identity = approved(this, true);
      if (!identity) return rules;
      for (const expected of identity.fallbackRules ?? []) {
        const source = this._source?.system?.rules?.[expected.sourceIndex];
        if (!source || source.key !== expected.key || JSON.stringify(source) !== expected.sourceJSON) continue;
        const rule = rules.find(rule => rule.sourceIndex === expected.sourceIndex && rule.key === expected.key);
        if (!rule || rule.invalid || source.slug != null) continue;
        if (rule.key === 'Aura' && rule.slug === sluggify(this.name)) {
          rule.slug = sluggify(identity.originalName);
        } else if ((rule.key === 'DamageDice' || rule.key === 'FlatModifier' && source.label === undefined)
          && rule.slug == null && typeof rule.beforePrepareData === 'function') {
          const fallback = rule.key === 'DamageDice' ? sluggify(identity.originalName)
            : sluggify(Reflect.apply(rule.getReducedLabel,
              viewOf(rule, {label: identity.originalName, parent: nameView(this, identity)}), []));
          let depth = 0, native = rule.slug;
          const within = operation => { depth++; try { return operation(); } finally { depth--; } };
          // Preserve the native public null. FlatModifier consumes the fallback
          // synchronously while preparing its closure; DamageDice consumes it
          // later, inside each synchronous deferredDice invocation.
          Object.defineProperty(rule, 'slug', {configurable:true, enumerable:true,
            get: () => native == null && depth > 0 && approved(this, true) ? fallback : native,
            set: value => { native = value; }});
          const before = rule.beforePrepareData;
          Object.defineProperty(rule,'beforePrepareData',{configurable:true,writable:true,enumerable:false,value:function beforePrepareData(...args) {
            if (rule.key === 'FlatModifier') return within(() => Reflect.apply(before, this, args));
            const dictionary = rule.actor.synthetics.damageDice;
            const existing = new Set(Object.values(dictionary).flat());
            const result = Reflect.apply(before, this, args);
            for (const callbacks of Object.values(dictionary)) {
              for (let index = 0; index < callbacks.length; index++) {
                const callback = callbacks[index];
                if (typeof callback !== 'function' || existing.has(callback)) continue;
                const wrapped = function (...args) {
                  return within(() => Reflect.apply(callback, this, args));
                };
                Object.defineProperties(wrapped,{name:{value:callback.name},length:{value:callback.length}});
                callbacks[index] = wrapped;
              }
            }
            return result;
          }});
        }
      }
      return rules;
    }});
  }
  if (EffectClass) {
    const effect = Object.getOwnPropertyDescriptor(EffectClass.prototype, 'prepareBaseData');
    replace(EffectClass.prototype, 'prepareBaseData', {...effect, value: function (...args) {
      const result = Reflect.apply(effect.value, this, args);
      const identity = approved(this);
      if (identity) this.rollOptionSlug = sluggify(identity.originalName).replace(/^(?:[a-z]+-)?(?:effect|stance)-/, '');
      return result;
    }});
  }
  if (SpellcastingEntryClass) {
    const prototype = SpellcastingEntryClass.prototype;
    const build = Object.getOwnPropertyDescriptor(prototype, 'buildStatistic');
    replace(prototype, 'buildStatistic', {...build, value: function (...args) {
      const identity = approved(this);
      return Reflect.apply(build.value, identity ? nameView(this, identity) : this, args);
    }});
    const prepare = Object.getOwnPropertyDescriptor(prototype, 'prepareBaseData');
    replace(prototype, 'prepareBaseData', {...prepare, value: function (...args) {
      const result = Reflect.apply(prepare.value, this, args);
      const identity = approved(this);
      // The temporary invalid Statistic uses a different fallback from buildStatistic.
      // Reconstruct it with the original native constructor input, before any sibling
      // or actor preparation can consume it. Never edit a constructed slug in place.
      if (identity && this.actor && this.statistic?.data?.label === 'PF2E.Actor.Creature.Spellcasting.InvalidProficiency') {
        this.statistic = new this.statistic.constructor(this.actor, {
          slug: sluggify(identity.originalName),
          label: 'PF2E.Actor.Creature.Spellcasting.InvalidProficiency', check: {type: 'check'}
        });
      }
      return result;
    }});
  }
  // Lore already has a derived getter; preserve its native normalization and
  // -lore suffix instead of treating every non-null getter result as explicit.
  replace(LoreClass.prototype, 'slug', {...lore, get: function () {
    const identity = approved(this);
    return Reflect.apply(lore.get, identity ? nameView(this, identity) : this, []);
  }});

  replace(NPCClass.prototype, 'getAttackEffects', {...attack, value: function (...args) {
    if (!active || !isEnabled()) return Reflect.apply(attack.value, this, args);
    const items = this.items;
    const lookupItems = new Proxy(items, {get(target, key) {
      if (key !== 'find') return Reflect.get(target, key, target);
      return (predicate, thisArg) => target.find((item, ...rest) => {
        const identity = approved(item);
        const view = identity ? viewOf(item, {slug: item.slug ?? sluggify(identity.originalName)}) : item;
        return Reflect.apply(predicate, thisArg, [view, ...rest]);
      });
    }});
    const actorView = viewOf(this, {items: lookupItems});
    // find returns the original Item, so note titles and descriptions stay Chinese.
    return Reflect.apply(attack.value, actorView, args);
  }});
  for (const prototype of prototypes) installed.add(prototype);
  function dispose() {
    active = false;
    for (const restore of [...restores].reverse()) restore();
    for (const prototype of prototypes) installed.delete(prototype);
  }
  // Foundry materializes queued actor sheets after world documents prepare.
  // Install mechanics at i18nInit, then append only these drop wrappers using
  // the same identity closure. A failed second phase rolls everything back.
  dispose.installActorSheets = classes => {
    if (!active) throw new Error('BoB identity compatibility is no longer active.');
    try {
      if (!classes.length) throw new Error('BoB identity compatibility requires the native PF2e actor sheets.');
      installDrops(collectDropOwners(classes));
    } catch (error) { dispose(); throw error; }
  };
  dispose.isActive = () => active;
  return dispose;
}
