import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';

const manifest = JSON.parse(readFileSync(new URL('../module.json', import.meta.url), 'utf8'));

test('every declared language is a valid Intl locale for package installation', () => {
  for (const [index, language] of (manifest.languages ?? []).entries()) {
    assert.doesNotThrow(
      // Foundry's package language schema uses this same native validator.
      () => Intl.getCanonicalLocales(language.lang),
      `languages[${index}].lang (${language.lang}) is not a valid locale`,
    );
  }
});
