/** Register the approved gallery adapter without replacing the reader's application accessor. */
export function registerBobGalleryDisplay({hooks, getGame, createCompatibility, reportError = error => console.error('BoB gallery display:', error)}) {
  const readerId = 'pf2e-tokens-characters';
  let active = true, installation = null, application = null, pending = null;
  const current = () => getGame()?.modules?.get(readerId)?.application;
  const isReady = () => active && application === current() && installation?.isActive() === true;
  async function ensure(requested, repaint) {
    const game = getGame(), target = current();
    if (!active || !target || (requested && requested !== target)) return false;
    if (isReady()) return true;
    if (pending?.application === target) {
      pending.repaint ||= repaint;
      return pending.promise;
    }
    const attempt = {application: target, repaint, promise: null};
    pending = attempt;
    attempt.promise = (async () => {
      const candidate = await createCompatibility({game});
      if (!candidate) return false;
      if (!active || getGame() !== game || current() !== target || pending !== attempt) {
        candidate();
        return false;
      }
      installation?.();
      installation = candidate;
      application = target;
      // Native ready does not await datasheet imports. A first render may arrive before installation.
      // Re-render only these two parts once; native search/artwork state is left untouched.
      if (attempt.repaint && target.state === 2) await target.render({parts: ['grid', 'details']});
      return true;
    })().catch(error => {reportError(error); return false;}).finally(() => {
      if (pending === attempt) pending = null;
    });
    return attempt.promise;
  }
  const readyHook = hooks.once('ready', () => ensure(null, current()?.state === 2));
  const renderHook = hooks.on('renderGalleryApplication', app => ensure(app, true));
  if (getGame()?.ready === true) void ensure(null, current()?.state === 2);
  return {
    isReady,
    dispose() {
      if (!active) return;
      active = false;
      hooks.off('ready', readyHook);
      hooks.off('renderGalleryApplication', renderHook);
      installation?.();
      installation = application = null;
    }
  };
}
