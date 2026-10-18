import data from './team-plus-aspect-data.mjs';

const MODULE = 'pf2e-team-plus-magic';
const withoutType = uuid => uuid?.replace('.Macro.', '.');

/** Babele passes the source document as its third converter argument. */
export function translateAspectCommand(command, translation, document, compendium) {
  if (typeof command !== 'string' || document?.type !== 'script') return command;
  const source = translation?.sourceUuid;
  const match = typeof source === 'string' && source.match(/^Compendium\.pf2e-team-plus-magic\.(macros|sf2e-macros)\.Macro\.([A-Za-z0-9]{16})$/);
  if (!match || document._id !== match[2] || !Object.hasOwn(data.identities, match[2])) return command;
  const collection = `${MODULE}.${match[1]}`;
  if (typeof compendium?.collection === 'string' && compendium.collection !== collection) return command;
  const origin = document._stats?.compendiumSource;
  if (origin && withoutType(origin) !== withoutType(source)) return command;
  const identity = data.identities[match[2]];
  const prefix = match[1] === 'sf2e-macros' ? 'sf2e-' : '';
  // The same IDs exist in both packs. Their actor and effect targets must agree with the mapping.
  for (const [variable, pack, target] of [['actorUuid', 'actors', identity.actor], ['effectUuid', 'misc', identity.effect]]) {
    if (!command.includes(`const ${variable} = 'Compendium.${MODULE}.${prefix}${pack}.${target}';`)) return command;
  }
  for (const row of data.messages) {
    const sourceLiteral = row.prefix + JSON.stringify(row.source);
    command = command.replaceAll(sourceLiteral, row.prefix + JSON.stringify(row.translation));
  }
  return command;
}
