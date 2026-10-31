const pages = new Set(['pf2e', 'sf2e'].map(system =>
  `Compendium.pf2e-team-plus-adventures.${system}-journals.JournalEntry.wKHOSd6WYx3q5L0A.JournalEntryPage.e9nykXPZit7kJXIP`));

export function installAdventuresJournalAnchors({PageSheetClass, isEnabled}) {
  const onRender = PageSheetClass.prototype._onRender;
  PageSheetClass.prototype._onRender = async function (...args) {
    const result = await onRender.apply(this, args);
    if (!isEnabled() || !this.isView || !this.options.includeTOC) return result;
    const page = this.page, heading = this.toc?.['永不死亡'];
    if (!pages.has(page.uuid) || page.type !== 'text'
      || !page.text.content.includes('<h2>永不死亡</h2>')
      || heading?.text !== '永不死亡' || heading.level !== 2 || 'never-die' in this.toc) return result;
    // Native links keep the English fragment; sidebar enumeration keeps only the translated heading.
    this.toc = Object.defineProperty({...this.toc}, 'never-die', {value: heading});
    return result;
  };
}
