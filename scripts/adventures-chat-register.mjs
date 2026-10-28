import data from './adventures-presentation-data.mjs';
import contracts from './adventures-chat-contracts.mjs';
import {createAdventuresChat, notificationCallsites, sourceCallAt} from './adventures-chat.mjs';
import {sha256} from './team-plus-presentation-core.mjs';

const KEY = Symbol.for('pf2e-compendium-extra-cn.adventures-chat');
Hooks.once('init', () => {
  if (globalThis[KEY]) return;
  const adapter = createAdventuresChat({game, data});
  globalThis[KEY] = adapter;
  Hooks.on('renderChatMessageHTML', adapter.chat);
  Hooks.once('ready', async () => {
    if (!adapter.enabled()) return;
    let source;
    try {
      const response = await fetch('modules/pf2e-team-plus-adventures/dist/pf2e-team-plus-adventures.js');
      if (!response.ok) throw Error(`HTTP ${response.status}`);
      source = await response.text();
    } catch (error) {
      adapter.diagnostics.sourceError = String(error);
      console.warn('Extra CN | Could not verify Adventures+ notification sources', error);
      return;
    }
    adapter.diagnostics.sourceSHA256 = sha256(source);
    const calls = notificationCallsites(source, contracts);
    adapter.diagnostics.sourceCalls = calls.length;
    adapter.diagnostics.unmatchedCalls = contracts.filter(contract => !calls.some(call => call.sha256 === contract.sha256)).map(contract => contract.id);
    adapter.installNotifications(ui.notifications, (method, stack) => sourceCallAt(stack, calls, method));
    for (const root of document.querySelectorAll('li.message[data-message-id]')) {
      const message = game.messages?.get(root.dataset.messageId);
      if (message) adapter.chat(message, root);
    }
  });
});
