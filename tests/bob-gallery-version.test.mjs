import assert from 'node:assert/strict';
import test from 'node:test';
import {createBobGalleryDisplayCompatibility} from '../scripts/bob-gallery-display-compat.mjs';
import {GALLERY_DISPLAY_BINDINGS} from '../scripts/bob-gallery-display-bindings.mjs';

const BOB='pf2e-bastion-of-blasphemies', READER='pf2e-tokens-characters';
const SHEET='bastion-of-blasphemies-creatures';
const SHEET_PATH='modules/pf2e-bastion-of-blasphemies/data/bastion-of-blasphemies-datasheet.json';
function fixture(){
  const data=GALLERY_DISPLAY_BINDINGS.map(row=>structuredClone(row.sourceRecord));
  class Gallery {
    static DEFAULT_OPTIONS={actions:{inspectImage(){return this.database.get(this.session.selected).label;}}};
    constructor(){
      this.options={actions:{...Gallery.DEFAULT_OPTIONS.actions}};
      this.database=new Map(data.map(row=>[row.key,row]));
      this.session={selected:'PZO15224_alisendra-arudora',preview:'portrait',targetActor:null};
      this.state=2;this.userHasAccess=true;
    }
  }
  const app=new Gallery();
  const bob={id:BOB,active:true,version:'9.0.0',flags:{galleryDatasheets:{[SHEET]:{sheet:SHEET_PATH}}}};
  const reader={id:READER,active:true,version:'9.0.0',application:app};
  const galleryData={SOURCES:[{id:SHEET,module:bob,data}]};
  const settings={galleryAccess:3,restrictedSheets:[]};
  const game={version:'15.999',system:{id:'pf2e',version:'9.9.9'},
    modules:new Map([[BOB,bob],[READER,reader],['pf2e-compendium-extra-cn',{active:true}]]),
    user:{id:'player',role:3,isGM:false,flags:{}},i18n:{lang:'cn',localize:()=> 'Source'},
    settings:{get:(_module,key)=>settings[key]}};
  return {app,bob,data,game,settings,loadModule:async path=>path.endsWith('/gallery.mjs')?{default:Gallery}:{GALLERY_DATA:galleryData}};
}

test('gallery inspect displays the approved Chinese label across dependency versions',async()=>{
  const f=fixture(),source=structuredClone(f.data);
  const dispose=await createBobGalleryDisplayCompatibility(f);
  try {
    assert.equal(f.app.options.actions.inspectImage.call(f.app),'阿莉森德拉·阿鲁多拉');
    assert.deepEqual(f.data,source);
    assert.equal(f.app.database.get(f.app.session.selected).label,'Alisendra Arudora');
    f.bob.version='another-version';
    assert.equal(f.app.options.actions.inspectImage.call(f.app),'阿莉森德拉·阿鲁多拉');
  } finally {dispose?.();}
});

test('gallery source and access checks still preserve native labels',async()=>{
  for(const mutate of [f=>f.bob.active=false,f=>f.app.userHasAccess=false,
    f=>f.bob.flags.galleryDatasheets[SHEET].sheet='foreign.json',
    f=>f.data[0].art.thumb='foreign.webp',
    f=>f.settings.restrictedSheets=[{moduleId:BOB,sheetId:SHEET}]]){
    const f=fixture(),dispose=await createBobGalleryDisplayCompatibility(f);
    try {mutate(f);assert.equal(f.app.options.actions.inspectImage.call(f.app),'Alisendra Arudora');}
    finally {dispose?.();}
  }
});

test('gallery accepts zh-Hans while other locales preserve native labels',async()=>{
  const f=fixture();f.bob.version='1.0.0';f.game.i18n.lang='zh-Hans';
  const dispose=await createBobGalleryDisplayCompatibility(f);
  try {
    assert.equal(f.app.options.actions.inspectImage.call(f.app),'阿莉森德拉·阿鲁多拉');
    f.game.i18n.lang='en';
    assert.equal(f.app.options.actions.inspectImage.call(f.app),'Alisendra Arudora');
  } finally {dispose?.();}
});
