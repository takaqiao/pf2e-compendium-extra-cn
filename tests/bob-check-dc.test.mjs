import assert from 'node:assert/strict';
import test from 'node:test';
import {cleanBobCheckLabels, installBobJournalCheckDisplay} from '../scripts/bob-journal-check-display-core.mjs';
import {BINDINGS} from '../scripts/bob-journal-check-display-bindings.mjs';

test('reported checks retain their parameters and leave the DC to the native renderer', () => {
  const options='|name:PF2E.Actions.RecallKnowledge.Title|options:action:recall-knowledge|traits:concentrate,secret';
  const text=`@Check[occultism|dc:20${options}]{DC 20神秘}或@Check[religion|dc:20${options}]{DC 20宗教}或@Check[arcana|dc:25${options}]{DC 25奥法}`;
  assert.equal(cleanBobCheckLabels(text), `@Check[occultism|dc:20${options}]{神秘}或@Check[religion|dc:20${options}]{宗教}或@Check[arcana|dc:25${options}]{奥法}`);
});

test('different, dynamic or absent DC values and empty labels remain unchanged', () => {
  for (const text of ['@Check[will|dc:20]{DC 20.5意志}', '@Check[will|dc:2]{DC 20意志}', '@Check[will|dc:2]{DC 20}', '@Check[will|dc:20]{DC 20}', '@Check[will|dc:@actor.level]{DC 20意志}', '@Check[will]{DC 20意志}', '@Check[will|dc:20]{意志}', 'DC 20神秘']) {
    assert.equal(cleanBobCheckLabels(text), text);
  }
});

test('existing BoB journal display is cleaned without changing source, options or unrelated journals', async () => {
  const text='原文 @Check[occultism|dc:20|traits:secret]{DC 20神秘}';
  class Journal {}
  class Page {}
  class Editor { static async enrichHTML(value, options) { return {value, options}; } }
  const journal=new Journal(), page=new Page(), journals=new Map();
  Object.assign(journal,{id:'journal',pages:new Map(),visible:true,collection:journals,_source:{flags:{core:{sheetClass:'pf2e-bastion-of-blasphemies.BastionJournalSheet'}}}});
  Object.assign(page,{id:'page',type:'text',parent:journal,collection:journal.pages,visible:true,text:{content:text},_source:{text:{content:text}}});
  journals.set(journal.id,journal);journal.pages.set(page.id,page);
  const options={relativeTo:page,secrets:false};
  const dispose=installBobJournalCheckDisplay({TextEditorClass:Editor,JournalClass:Journal,PageClass:Page,bindings:BINDINGS,document:{createElement(){}},isEnabled:()=>true,getLocale:()=> 'cn',getUser:()=>({}),getJournals:()=>journals,format:()=>''});
  try {
    const result=await Editor.enrichHTML(text,options);
    assert.equal(result.value,'原文 @Check[occultism|dc:20|traits:secret]{神秘}');
    assert.equal(result.options,options);
    assert.equal(page._source.text.content,text);
    assert.equal((await Editor.enrichHTML(text+'片段',options)).value,text+'片段');
    journal._source.flags.core.sheetClass='other.Sheet';
    assert.equal((await Editor.enrichHTML(text,options)).value,text);
  } finally {dispose();}
});
