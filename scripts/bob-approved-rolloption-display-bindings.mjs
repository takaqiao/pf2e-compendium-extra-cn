// Approved display values unchanged; three exact reviewed complete body guards refreshed.
export const BOB_ROLLOPTION_DISPLAY_SOURCES = Object.freeze({
  "schemaVersion": 3,
  "count": 18,
  "currentlyApplicableMaximum": 16,
  "unsupportedLootCount": 2,
  "previousFrozenInput": {
    "path": "C:\\Users\\Taka\\Desktop\\fvtt\\冒险\\BoB\\模组汉化\\qa\\bob-rolloption-display-frozen-input-v2.json",
    "sha256": "59ee799fd396d45871fba72a996b9e02059025ab30f6886158202700e3e2f04b"
  },
  "currentFieldLedgerSha256": "fb67eee6937ec69b9e75e80680072cc9a3cfb272235d975eadea3d575c6005f0",
  "currentRuleLedgerSha256": "1430a61c18364f7d3ad49bd0c3b985fcaf659100d4149e4e3676903bb7f2a99e",
  "effectiveNameDisplayRevision": {
    "path": "actors[139].items[0].system.rules[0].label",
    "ledgerSha256": "86f5c3558908d8a8082768488aa4c71189c8a5d1dc961c0ccbbf5f99ddb7ee17",
    "recordSha256": "b163302042436da57a6cded328ddb56748ed9f508ca10583cfaa4f91e755b93d",
    "currentNameRecordSha256": "6a4d5850763087e47149ac807f23b87446802864d132976e9f039e4c8b3bc867"
  },
  "bodyGuardRefreshes": [
    {
      "bindingPath": "actors[139].items[0].system.rules[0].label",
      "bodyPath": "actors[139].items[0].system.description.value",
      "newRecordSha256": "ece354c8ffb1eb1a94df6a145624c48b886818b5b9625c62d3e4138d8218c840",
      "review": "C:\\Users\\Taka\\Desktop\\fvtt\\冒险\\BoB\\模组汉化\\reviews\\remaining-body-review-10-v3.json",
      "reviewSha256": "9444338df3717e184614aabe03caf627408dc9d74a3b058dfef939137b82a5f6"
    },
    {
      "bindingPath": "actors[178].items[0].system.rules[0].label",
      "bodyPath": "actors[178].items[0].system.description.value",
      "newRecordSha256": "d77ed02739a0400a0b8ae07153c3762ee8aad22efd8e2cf5ce4b2e53e986710c",
      "review": "C:\\Users\\Taka\\Desktop\\fvtt\\冒险\\BoB\\模组汉化\\reviews\\remaining-body-review-19-gap-v2.json",
      "reviewSha256": "dcabe03d83d4dc7cb0a1dc0f98f86d358cf3373a416d4d6275a94817c30732be"
    },
    {
      "bindingPath": "actors[312].items[0].system.rules[0].label",
      "bodyPath": "actors[312].items[0].system.description.value",
      "newRecordSha256": "d82c080277372f40f1479ba8f5d9bb4104d1a6209a7623bba4a8b5adbf56389c",
      "review": "C:\\Users\\Taka\\Desktop\\fvtt\\冒险\\BoB\\模组汉化\\reviews\\remaining-body-review-19-gap-v2.json",
      "reviewSha256": "dcabe03d83d4dc7cb0a1dc0f98f86d358cf3373a416d4d6275a94817c30732be"
    }
  ],
  "policy": "Root Actor Items only; source value absent/boolean, selection absent/original enum; foreign selected mergeable option makes whole group native."
});
export const BOB_APPROVED_ROLLOPTION_DISPLAYS = Object.freeze([
  {
    "path": "actors[16].items[3].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "B597QiPcxXkMejnz",
      "type": "npc",
      "names": [
        "Scarecrow",
        "稻草人 Scarecrow"
      ],
      "folder": "cGe8iQTsYWPjF3s7",
      "sourceUuid": "Compendium.pf2e.pathfinder-monster-core.Actor.2p7MEk4SdXfLbzxO"
    },
    "item": {
      "id": "oYtncLyCKuBAQThk",
      "type": "action",
      "names": [
        "Clawing Fear",
        "恐惧之爪 Clawing Fear"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": "clawing-fear",
      "bodies": [
        "<p>The scarecrow's strikes deal an additional 1d6 mental damage to @UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{Frightened} creatures.</p>",
        "<p>稻草人的打击对@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧}的生物额外造成1d6心灵伤害。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.SpecificRule.TOTMToggle.Frightened",
        "option": "target:condition:frightened",
        "toggleable": "totm"
      },
      {
        "damageType": "mental",
        "diceNumber": 1,
        "dieSize": "d6",
        "key": "DamageDice",
        "predicate": [
          "target:condition:frightened"
        ],
        "selector": "strike-damage"
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "启用需要惊惧目标的能力",
    "approvalSha256": "c59410736137f8b5a335e82196ff8f6df32593c3bbabb20e6505e5ba970e654d"
  },
  {
    "path": "actors[290].items[45].system.rules[0].suboptions[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "V90ggUnKvweg3G0q",
      "type": "npc",
      "names": [
        "Irrokcis Arudora",
        "伊罗克西斯·阿鲁多拉 Irrokcis Arudora"
      ],
      "folder": "nCHw2Vcj0Eth0Evy",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.V90ggUnKvweg3G0q"
    },
    "item": {
      "id": "EXR7BRT6fAsDJPVm",
      "type": "action",
      "names": [
        "Reach Spell",
        "及远法术 Reach Spell"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": null,
      "bodies": [
        "<p>If the next action Irrokcis takes is to Cast a Spell that has a range, increase that spell's range by 30 feet.</p>",
        "<p>若伊罗克西斯的下一个动作是施放一道具有距离的法术，则将该法术的距离增加30尺。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.TraitSpellshape",
        "mergeable": true,
        "option": "spellshape",
        "placement": "spellcasting",
        "suboptions": [
          {
            "label": "{item|name}",
            "value": "reach-spell"
          }
        ],
        "toggleable": true
      },
      {
        "itemType": "spell",
        "key": "ItemAlteration",
        "mode": "add",
        "predicate": [
          "spellshape:reach-spell"
        ],
        "property": "description",
        "value": [
          {
            "text": "PF2E.SpecificRule.Spellshape.ReachSpell"
          }
        ]
      }
    ],
    "selectionEnum": [
      "reach-spell"
    ],
    "kind": "suboption",
    "suboptionValue": "reach-spell",
    "display": "及远法术",
    "approvalSha256": "51d90c60c801181ae6904a14b8667e927e3243ecf3db28ff8d31a35876c6d57a"
  },
  {
    "path": "actors[53].items[12].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "I5RtQqy4YfR2oMjo",
      "type": "npc",
      "names": [
        "Sovina Vosslund",
        "索维娜·沃斯伦德 Sovina Vosslund"
      ],
      "folder": "iLgWS8UttuvCFKJ4",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.I5RtQqy4YfR2oMjo"
    },
    "item": {
      "id": "afFY7VoD2uafM3Qm",
      "type": "action",
      "names": [
        "Ride Corpse",
        "驾驭尸体 Ride Corpse"
      ],
      "folder": null,
      "sourceUuid": "Compendium.pf2e.pathfinder-monster-core-2.Actor.Bz8Sexx3bGFhE1Lq.Item.IVnGWQzHYIx6BwIf",
      "slug": null,
      "bodies": [
        "<p>The penanggalan inserts their entrails into their humanoid body, allowing them to appear as and move about like a normal human. The body has 10 Hit Points and the same defenses as the penanggalan.</p><p>When the body is destroyed, the penanggalan is ejected unharmed. The body becomes a corpse, and if it is neither controlled by the penanggalan nor stored in an alchemical vat, it decays as normal.</p>",
        "<p>庞南加兰将内脏塞回自己的类人躯体中，使自己能够像普通人类一样显现和移动。躯体具有10 HP，防御与庞南加兰相同。</p><p>躯体被摧毁时，庞南加兰会被弹出，但不受伤害。躯体变成尸体；若既不受庞南加兰控制，也未保存在炼金槽中，便会正常腐烂。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "option": "ride-corpse",
        "toggleable": true,
        "label": "In human disguise",
        "value": false
      },
      {
        "key": "ActiveEffectLike",
        "path": "system.details.alliance",
        "mode": "override",
        "value": "party",
        "predicate": [
          "ride-corpse"
        ]
      },
      {
        "key": "TokenImage",
        "value": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/GmgFarmer.webp",
        "ring": {
          "subject": {
            "texture": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/GmgFarmer.webp"
          },
          "colors": {}
        },
        "scale": 1,
        "predicate": [
          "ride-corpse"
        ],
        "animation": {
          "transition": "morph"
        }
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "伪装成人类时",
    "approvalSha256": "031f227e32352490693184e03c5e8998277ba662785caefca791c509e6891c99"
  },
  {
    "path": "actors[78].items[6].system.rules[1].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "httXfBPGseF9csXa",
      "type": "npc",
      "names": [
        "Bugbear Tormentor",
        "熊地精折磨者 Bugbear Tormentor"
      ],
      "folder": "ZZgtHCUkCZvhw1kt",
      "sourceUuid": "Compendium.pf2e.pathfinder-monster-core.Actor.httXfBPGseF9csXa"
    },
    "item": {
      "id": "YMj2YteKtdg79DoF",
      "type": "action",
      "names": [
        "Sneak Attack",
        "偷袭 Sneak Attack"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": "sneak-attack",
      "bodies": [
        "<p>The bugbear tormentor deals 1d6 extra precision damage to @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard} creatures.</p>",
        "<p>熊地精折磨者对@UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{措手不及}的生物造成1d6额外精准伤害。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 1,
    "rules": [
      {
        "category": "precision",
        "diceNumber": 1,
        "dieSize": "d6",
        "key": "DamageDice",
        "predicate": [
          "target:condition:off-guard"
        ],
        "selector": "strike-damage"
      },
      {
        "key": "RollOption",
        "label": "PF2E.SpecificRule.TOTMToggle.OffGuard",
        "option": "target:condition:off-guard",
        "toggleable": "totm"
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "启用需要目标措手不及的能力",
    "approvalSha256": "4dfb9abab3195b0eb597d5ef9a85535d7e0028e22bd13d1994c0e60a5fd79e63"
  },
  {
    "path": "actors[84].items[7].system.rules[1].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "Gxn47A5xWacBglVu",
      "type": "npc",
      "names": [
        "Grinder-Widget",
        "研磨机仆 Grinder-Widget"
      ],
      "folder": "ZZgtHCUkCZvhw1kt",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.Gxn47A5xWacBglVu"
    },
    "item": {
      "id": "MH7wNM2dBDOtmzVO",
      "type": "action",
      "names": [
        "Sneak Attack",
        "偷袭 Sneak Attack"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": "sneak-attack",
      "bodies": [
        "<p>A dig-widget's Strikes deal an additional 1d6 precision damage to @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard} creatures.</p>",
        "<p>打洞狗的打击对 @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{措手不及} 的生物额外造成1d6点精准伤害。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 1,
    "rules": [
      {
        "category": "precision",
        "diceNumber": 1,
        "dieSize": "d6",
        "key": "DamageDice",
        "predicate": [
          "target:condition:off-guard"
        ],
        "selector": "strike-damage"
      },
      {
        "key": "RollOption",
        "label": "PF2E.SpecificRule.TOTMToggle.OffGuard",
        "option": "target:condition:off-guard",
        "toggleable": "totm"
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "启用需要目标措手不及的能力",
    "approvalSha256": "1e5dfef279ede49ffa321f9b4261f9ff27f7b4859d7fe7018e831bb28a4f7a25"
  },
  {
    "path": "actors[95].items[3].system.rules[1].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "Th7iJykrTmTt9CDg",
      "type": "npc",
      "names": [
        "Skirrin",
        "斯基林 Skirrin"
      ],
      "folder": "ZZgtHCUkCZvhw1kt",
      "sourceUuid": "Compendium.pf2e.pathfinder-monster-core.Actor.JGwKk83oX4gTGlqe"
    },
    "item": {
      "id": "G3Hz9uWIYCEyoBRq",
      "type": "action",
      "names": [
        "Sneak Attack",
        "偷袭 Sneak Attack"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": "sneak-attack",
      "bodies": [
        "<p>The tiger deals 1d6 extra precision damage to @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard} creatures.</p>",
        "<p>老虎对@UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{措手不及}的生物造成1d6额外精准伤害。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 1,
    "rules": [
      {
        "category": "precision",
        "diceNumber": 1,
        "dieSize": "d6",
        "key": "DamageDice",
        "predicate": [
          "target:condition:off-guard"
        ],
        "selector": "strike-damage"
      },
      {
        "key": "RollOption",
        "label": "PF2E.SpecificRule.TOTMToggle.OffGuard",
        "option": "target:condition:off-guard",
        "toggleable": "totm"
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "启用需要目标措手不及的能力",
    "approvalSha256": "cb46179ff96b33eab455a0ebf8d8bfa8888a2123ac0d6a5da55508b09ddc6ba5"
  },
  {
    "path": "actors[96].items[7].system.rules[1].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "2DdJrqM3R6iCcGtl",
      "type": "npc",
      "names": [
        "Slaughtermay",
        "屠戮梅 Slaughtermay"
      ],
      "folder": "ZZgtHCUkCZvhw1kt",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.2DdJrqM3R6iCcGtl"
    },
    "item": {
      "id": "cV47fOayFv5uJU6k",
      "type": "action",
      "names": [
        "Sneak Attack",
        "偷袭 Sneak Attack"
      ],
      "folder": null,
      "sourceUuid": "Compendium.pf2e.bestiary-ability-glossary-srd.Item.AWvNPE4U0kEJSL1T",
      "slug": "sneak-attack",
      "bodies": [
        "<p>The creature's Strikes deal an additional 1d6 precision damage to @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard} creatures.</p>",
        "<p>该生物的打击对@UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{措手不及}的生物造成额外1d6精准伤害。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 1,
    "rules": [
      {
        "category": "precision",
        "diceNumber": 1,
        "dieSize": "d6",
        "key": "DamageDice",
        "predicate": [
          "target:condition:off-guard"
        ],
        "selector": "strike-damage"
      },
      {
        "key": "RollOption",
        "label": "PF2E.SpecificRule.TOTMToggle.OffGuard",
        "option": "target:condition:off-guard",
        "toggleable": "totm"
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "启用需要目标措手不及的能力",
    "approvalSha256": "53346d1e804fc9127ddbfcc68173e750368af2ee703697a5c8f9cafc2aac6539"
  },
  {
    "path": "actors[229].items[24].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "2kPiynr0PsKZI0LK",
      "type": "npc",
      "names": [
        "Linisriel",
        "莉妮丝瑞尔 Linisriel"
      ],
      "folder": "IDeegHUXlrynZ2Jw",
      "sourceUuid": "Compendium.pf2e.pathfinder-monster-core.Actor.PcBcC9HZBrM4gWu3"
    },
    "item": {
      "id": "CULP9RaOhk5YCdvr",
      "type": "action",
      "names": [
        "Sneak Attack",
        "偷袭 Sneak Attack"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": null,
      "bodies": [
        "<p>The raja-krodha deals 2d6 extra precision damage to @UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{Off-Guard} creatures.</p>",
        "<p>忿怒罗刹对@UUID[Compendium.pf2e.conditionitems.Item.AJh5ex99aV6VTggg]{措手不及}的生物造成2d6额外精准伤害。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.SpecificRule.TOTMToggle.OffGuard",
        "option": "target:condition:off-guard",
        "toggleable": "totm"
      },
      {
        "category": "precision",
        "diceNumber": 2,
        "dieSize": "d6",
        "key": "DamageDice",
        "predicate": [
          "target:condition:off-guard"
        ],
        "selector": "strike-damage"
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "启用需要目标措手不及的能力",
    "approvalSha256": "fd5f56818055c70e3fc362d30a5c751a0f7f8ce9ec36d7fd50529f25843f74e5"
  },
  {
    "path": "actors[139].items[0].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "br1fuSnpsRfkYW1z",
      "type": "npc",
      "names": [
        "Ghostlight Sister",
        "幽光姐妹 Ghostlight Sister"
      ],
      "folder": "g4Sd0AmMN3is4nXo",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.br1fuSnpsRfkYW1z"
    },
    "item": {
      "id": "iU95LL6xQRX0h6Yy",
      "type": "equipment",
      "names": [
        "Maestro's Intrument",
        "大师乐器 Maestro's Intrument"
      ],
      "folder": null,
      "sourceUuid": "Compendium.pf2e.equipment-srd.Item.bAfyWCvgsYDyw3ff",
      "slug": "maestros-instrument-lesser",
      "bodies": [
        "<p>A <em>maestro's instrument</em> can be crafted in the form of any variety of handheld musical instruments. A <em>maestro's instrument</em> grants you a +1 item bonus to Performance checks while playing music with the instrument.</p><hr><p><strong>Activate—Charming Performance</strong> <span class=\"action-glyph\">2</span> (manipulate)</p>\n<p><strong>Frequency</strong> once per day</p>\n<p><strong>Effect</strong> You play the instrument, causing it to cast a DC 17 @UUID[Compendium.pf2e.spells-srd.Item.vLA0q0WOK2YPuJs6]{Charm} spell.</p><hr><p><strong>Craft Requirements</strong> You must supply a casting of <em>charm</em> of the appropriate rank.</p>",
        "<p><em>大师乐器</em>可以制成任意种类的手持乐器。使用<em>大师乐器</em>演奏音乐时，你的表演检定获得+1物品加值。</p><hr><p><strong>启动——魅惑演奏</strong> <span class=\"action-glyph\">2</span>（操作）</p>\n<p><strong>频率</strong> 每日一次</p>\n<p><strong>效果</strong> 你演奏乐器，使其施放一道DC 17的@UUID[Compendium.pf2e.spells-srd.Item.vLA0q0WOK2YPuJs6]{魅惑术}。</p><hr><p><strong>制作需求</strong> 你必须提供一次相应环阶的<em>魅惑术</em>施法。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "domain": "performance",
        "key": "RollOption",
        "label": "PF2E.SpecificRule.PlayingItem",
        "option": "playing",
        "toggleable": true
      },
      {
        "key": "FlatModifier",
        "predicate": [
          "playing"
        ],
        "selector": "performance",
        "type": "item",
        "value": 1
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "演奏 大师乐器",
    "approvalSha256": "b163302042436da57a6cded328ddb56748ed9f508ca10583cfaa4f91e755b93d"
  },
  {
    "path": "actors[178].items[0].system.rules[0].label",
    "approved": true,
    "scope": "unsupported-loot-actor-source",
    "actor": {
      "id": "vIutUG9WhLUTPUqo",
      "type": "loot",
      "names": [
        "Ruined Instruments",
        "损毁的乐器 Ruined Instruments"
      ],
      "folder": "jDhEGfku5UX52SkM",
      "sourceUuid": null
    },
    "item": {
      "id": "z07UTr2No43TmM8j",
      "type": "equipment",
      "names": [
        "Trickster's Mandolin (Greater)",
        "高等骗子的曼陀林 Trickster's Mandolin (Greater)"
      ],
      "folder": null,
      "sourceUuid": "Compendium.pf2e.equipment-srd.Item.Pq7JhHw3QhqqxY9d",
      "slug": "tricksters-mandolin-greater",
      "bodies": [
        "<p>Sought after by many unscrupulous bards, this instrument is surprisingly light and easy to carry, but also empowered with a number of spells carefully selected to help with fooling others or making a hasty retreat. While playing the mandolin, you gain a +1 item bonus to Deception and Performance checks.</p><hr><p><strong>Activate</strong> <span class=\"action-glyph\">1</span> (concentrate)</p>\n<p><strong>Effect</strong> You change the instrument's color and shape to one you prefer, and you can turn it into a different handheld string instrument that takes two hands to play.</p><hr><p><strong>Activate</strong> Cast a Spell</p>\n<p><strong>Effect</strong> You expend a number of charges from this instrument to cast a spell from its list.</p><ul><li><strong>Cantrip</strong> @UUID[Compendium.pf2e.spells-srd.Item.Qw3fnUlaUbnn7ipC]{Prestidigitation}</li><li><strong>1st</strong> @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{Illusory Disguise}, @UUID[Compendium.pf2e.spells-srd.Item.4ZGte0i9YbLh4dRi]{Item Facade}, @UUID[Compendium.pf2e.spells-srd.Item.yV7Ouzaoe7DHLESI]{Ventriloquism}</li><li><strong>2nd</strong> @UUID[Compendium.pf2e.spells-srd.Item.3JG1t3T4mWn6vTke]{Blur}, @UUID[Compendium.pf2e.spells-srd.Item.f8SBoXiXQjlCKqly]{Illusory Creature}, @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{Illusory Disguise}, @UUID[Compendium.pf2e.spells-srd.Item.XXqE1eY3w3z6xJCB]{Invisibility}</li><li><strong>3rd</strong> @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{Illusory Disguise}, @UUID[Compendium.pf2e.spells-srd.Item.Pwq6T7xpfAJXV5aj]{Phantom Prison}, @UUID[Compendium.pf2e.spells-srd.Item.I0j56TNRmGcTyoqJ]{Shared Invisibility}</li></ul><hr><p><strong>Craft Requirements</strong> Supply one casting of all listed ranks of all listed spells.</p>",
        "<p>这种乐器被许多无耻的吟游诗人所追捧。它不仅格外轻巧、易于携带，而且还蕴含着许多精心挑选的法术，用来欺骗他人或仓促撤退。演奏这把曼陀林时，你在欺骗与表演检定上获得+1物品加值。</p><hr><p><strong>启动</strong> <span class=\"action-glyph\">1</span> （专注）</p>\n<p><strong>效果</strong> 你将乐器的颜色与形状改变成喜欢的模样，还可以把它变成另一种需要双手演奏的手持弦乐器。</p><hr><p><strong>启动</strong> 施放法术</p>\n<p><strong>效果</strong> 你消耗这件乐器的一定数量充能，施放其列表中的一个法术。</p><ul><li><strong>戏法</strong> @UUID[Compendium.pf2e.spells-srd.Item.Qw3fnUlaUbnn7ipC]{魔法伎俩}</li><li><strong>1环</strong> @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}, @UUID[Compendium.pf2e.spells-srd.Item.4ZGte0i9YbLh4dRi]{伪装物件}, @UUID[Compendium.pf2e.spells-srd.Item.yV7Ouzaoe7DHLESI]{腹语术}</li><li><strong>2环</strong> @UUID[Compendium.pf2e.spells-srd.Item.3JG1t3T4mWn6vTke]{朦胧术}, @UUID[Compendium.pf2e.spells-srd.Item.f8SBoXiXQjlCKqly]{幻象生物}, @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}, @UUID[Compendium.pf2e.spells-srd.Item.XXqE1eY3w3z6xJCB]{隐形术}</li><li><strong>3环</strong> @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}, @UUID[Compendium.pf2e.spells-srd.Item.Pwq6T7xpfAJXV5aj]{魅影监牢}, @UUID[Compendium.pf2e.spells-srd.Item.I0j56TNRmGcTyoqJ]{群体隐形}</li></ul><hr><p><strong>制作要求</strong> 为列表中所有法术的所有列出环级各提供一次施法。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "domain": "skill-check",
        "key": "RollOption",
        "label": "PF2E.SpecificRule.PlayingItem",
        "option": "playing",
        "toggleable": true
      },
      {
        "key": "FlatModifier",
        "predicate": [
          "playing"
        ],
        "selector": [
          "deception",
          "performance"
        ],
        "type": "item",
        "value": 1
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "演奏 高等骗子的曼陀林",
    "approvalSha256": "90727480c942a1ad22aafc8ffecf443737d57ce5d261a86ba2727f74b63f8bba"
  },
  {
    "path": "actors[312].items[0].system.rules[0].label",
    "approved": true,
    "scope": "unsupported-loot-actor-source",
    "actor": {
      "id": "fFr9oEikUHdWzAMR",
      "type": "loot",
      "names": [
        "Hidden Compartment",
        "隐藏的暗格 Hidden Compartment"
      ],
      "folder": "MwFp8GBDsukZ0rM4",
      "sourceUuid": null
    },
    "item": {
      "id": "AYxV6WyTin0TqfPo",
      "type": "equipment",
      "names": [
        "Trickster's Mandolin (Major)",
        "上等骗子的曼陀林 Trickster's Mandolin (Major)"
      ],
      "folder": null,
      "sourceUuid": "Compendium.pf2e.equipment-srd.Item.18ztTUiUZNjuc7K1",
      "slug": "tricksters-mandolin-major",
      "bodies": [
        "<p>Sought after by many unscrupulous bards, this instrument is surprisingly light and easy to carry, but also empowered with a number of spells carefully selected to help with fooling others or making a hasty retreat. While playing the mandolin, you gain a +2 item bonus to Deception and Performance checks.</p><hr><p><strong>Activate</strong> <span class=\"action-glyph\">1</span> (concentrate)</p>\n<p><strong>Effect</strong> You change the instrument's color and shape to one you prefer, and you can turn it into a different handheld string instrument that takes two hands to play.</p><hr><p><strong>Activate</strong> Cast a Spell</p>\n<p><strong>Effect</strong> You expend a number of charges from this instrument to cast a spell from its list.</p><ul><li><strong>Cantrip</strong> @UUID[Compendium.pf2e.spells-srd.Item.Qw3fnUlaUbnn7ipC]{Prestidigitation}</li><li><strong>1st</strong> @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{Illusory Disguise}, @UUID[Compendium.pf2e.spells-srd.Item.4ZGte0i9YbLh4dRi]{Item Facade}, @UUID[Compendium.pf2e.spells-srd.Item.yV7Ouzaoe7DHLESI]{Ventriloquism}</li><li><strong>2nd</strong> @UUID[Compendium.pf2e.spells-srd.Item.3JG1t3T4mWn6vTke]{Blur}, @UUID[Compendium.pf2e.spells-srd.Item.f8SBoXiXQjlCKqly]{Illusory Creature}, @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{Illusory Disguise}, @UUID[Compendium.pf2e.spells-srd.Item.XXqE1eY3w3z6xJCB]{Invisibility}</li><li><strong>3rd</strong> @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{Illusory Disguise}, @UUID[Compendium.pf2e.spells-srd.Item.Pwq6T7xpfAJXV5aj]{Phantom Prison}, @UUID[Compendium.pf2e.spells-srd.Item.I0j56TNRmGcTyoqJ]{Shared Invisibility}</li><li><strong>4th</strong> @UUID[Compendium.pf2e.spells-srd.Item.LiGbewa9pO0yjbsY]{Confusion}, @UUID[Compendium.pf2e.spells-srd.Item.XXqE1eY3w3z6xJCB]{Invisibility}, @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{Illusory Disguise}</li><li><strong>5th</strong> @UUID[Compendium.pf2e.spells-srd.Item.U58aQWJ47VrI36yP]{Hallucination}, @UUID[Compendium.pf2e.spells-srd.Item.Ucf8eynbZMfUucjE]{Illusory Scene}, @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{Illusory Disguise}</li></ul><hr><p><strong>Craft Requirements</strong> Supply one casting of all listed ranks of all listed spells.</p>",
        "<p>这种乐器被许多无耻的吟游诗人所追捧。它不仅格外轻巧、易于携带，而且还蕴含着许多精心挑选的法术，用来欺骗他人或仓促撤退。演奏这把曼陀林时，你在欺骗与表演检定上获得+2物品加值。</p><hr><p><strong>启动</strong> <span class=\"action-glyph\">1</span> （专注）</p>\n<p><strong>效果</strong> 你将乐器的颜色与形状改变成喜欢的模样，还可以把它变成另一种需要双手演奏的手持弦乐器。</p><hr><p><strong>启动</strong> 施放法术</p>\n<p><strong>效果</strong> 你消耗这件乐器的一定数量充能，施放其列表中的一个法术。</p><ul><li><strong>戏法</strong> @UUID[Compendium.pf2e.spells-srd.Item.Qw3fnUlaUbnn7ipC]{魔法伎俩}</li><li><strong>1环</strong> @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}, @UUID[Compendium.pf2e.spells-srd.Item.4ZGte0i9YbLh4dRi]{伪装物件}, @UUID[Compendium.pf2e.spells-srd.Item.yV7Ouzaoe7DHLESI]{腹语术}</li><li><strong>2环</strong> @UUID[Compendium.pf2e.spells-srd.Item.3JG1t3T4mWn6vTke]{朦胧术}, @UUID[Compendium.pf2e.spells-srd.Item.f8SBoXiXQjlCKqly]{幻象生物}, @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}, @UUID[Compendium.pf2e.spells-srd.Item.XXqE1eY3w3z6xJCB]{隐形术}</li><li><strong>3环</strong> @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}, @UUID[Compendium.pf2e.spells-srd.Item.Pwq6T7xpfAJXV5aj]{魅影监牢}, @UUID[Compendium.pf2e.spells-srd.Item.I0j56TNRmGcTyoqJ]{群体隐形}</li><li><strong>4环</strong> @UUID[Compendium.pf2e.spells-srd.Item.LiGbewa9pO0yjbsY]{困惑术}, @UUID[Compendium.pf2e.spells-srd.Item.XXqE1eY3w3z6xJCB]{隐形术}, @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}</li><li><strong>5环</strong> @UUID[Compendium.pf2e.spells-srd.Item.U58aQWJ47VrI36yP]{镜花水月}, @UUID[Compendium.pf2e.spells-srd.Item.Ucf8eynbZMfUucjE]{幻象场景}, @UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}</li></ul><hr><p><strong>制作要求</strong> 为列表中所有法术的所有列出环级各提供一次施法。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "domain": "skill-check",
        "key": "RollOption",
        "label": "PF2E.SpecificRule.PlayingItem",
        "option": "playing",
        "toggleable": true
      },
      {
        "key": "FlatModifier",
        "predicate": [
          "playing"
        ],
        "selector": [
          "deception",
          "performance"
        ],
        "type": "item",
        "value": 2
      }
    ],
    "selectionEnum": [],
    "kind": "label",
    "suboptionValue": null,
    "display": "演奏 上等骗子的曼陀林",
    "approvalSha256": "f1cf2e73c7edbc4d237b4e0c7ffa404847080ccfeee1c099bc60e429a915b116"
  },
  {
    "path": "actors[152].items[7].system.rules[0].suboptions[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "XwUby1tFKvbakwLR",
      "type": "npc",
      "names": [
        "The Mushfens Monster",
        "粘稠沼泽怪物 The Mushfens Monster"
      ],
      "folder": "g4Sd0AmMN3is4nXo",
      "sourceUuid": "Compendium.pf2e.pathfinder-monster-core-2.Actor.zGdsQWq6uHjE7TSx"
    },
    "item": {
      "id": "CKUI3nSiphtbHcaQ",
      "type": "action",
      "names": [
        "Change Shape",
        "变形 Change Shape"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": "change-shape",
      "bodies": [
        "<p>The tikbalang takes on the appearance of any Medium or Large humanoid. This doesn't change the tikbalang's Speed or their attack and damage modifiers with their Strikes.</p><hr><p>@Localize[PF2E.NPC.Abilities.Glossary.ChangeShape]</p>",
        "<p>提克巴兰呈现出任意中型或大型类人生物的外貌。这不会改变提克巴兰的速度，也不会改变其打击的攻击和伤害调整值。</p><hr><p>@Localize[PF2E.NPC.Abilities.Glossary.ChangeShape]</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "alwaysActive": true,
        "key": "RollOption",
        "label": "PF2E.NPCAbility.ChangeShape.Label",
        "option": "change-shape",
        "suboptions": [
          {
            "label": "Tikbalang",
            "value": "tikbalang"
          },
          {
            "label": "PF2E.NPCAbility.ChangeShape.Form.Humanoid.Medium",
            "value": "humanoid-medium"
          }
        ],
        "toggleable": true,
        "value": true,
        "selection": "tikbalang"
      },
      {
        "key": "TokenImage",
        "ring": {
          "subject": {
            "texture": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/Utgar.webp"
          },
          "colors": {}
        },
        "predicate": [
          "change-shape:humanoid-medium"
        ],
        "value": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/Utgar.webp",
        "scale": 1,
        "animation": {
          "transition": "morph"
        }
      },
      {
        "key": "CreatureSize",
        "predicate": [
          "change-shape:humanoid-medium"
        ],
        "value": "medium"
      }
    ],
    "selectionEnum": [
      "tikbalang",
      "humanoid-medium"
    ],
    "kind": "suboption",
    "suboptionValue": "tikbalang",
    "display": "提克巴兰",
    "approvalSha256": "d8b567d1aef1100641e2ca45ece745231ff75d7249f4bd9800a8fb0b4e576263"
  },
  {
    "path": "actors[321].items[5].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "ZixxJrXEmD4voY9g",
      "type": "npc",
      "names": [
        "Aron Mordimus",
        "阿隆·莫迪穆斯 Aron Mordimus"
      ],
      "folder": "h8uOhq5XwRdjsNhg",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.ZixxJrXEmD4voY9g"
    },
    "item": {
      "id": "P4bAeteoTmGGiI3W",
      "type": "action",
      "names": [
        "Physical Manifestation",
        "实体显现 Physical Manifestation"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": null,
      "bodies": [
        "<p>Upon reaching rank 1, Aron manifests a semi-physical body. He loses the incorporeal trait, his immunities and resistances, and his fly Speed, and gains a land Speed of 25 feet. He has a Strength modifier of +0, an Athletics modifier of +7, an AC of 21, 80 HP, and Pour Elixir. His other statistics do not change.</p>",
        "<p>达到1阶时，阿隆显现出一具半实体身躯。他失去虚体特征、免疫、抗力和飞行速度，并获得25尺陆地速度。他的力量调整值为+0，运动调整值为+7，AC为21，HP为80，并获得倾倒灵药能力。其他数据不变。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
        "option": "support-rank",
        "selection": "1",
        "suboptions": [
          {
            "label": "PF2E.SpecificRule.Numbers.One",
            "value": "1"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Two",
            "value": "2"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Three",
            "value": "3"
          }
        ],
        "toggleable": true,
        "value": false
      },
      {
        "key": "ActorTraits",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "remove": [
          "incorporeal"
        ]
      },
      {
        "key": "Immunity",
        "mode": "remove",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "type": [
          "bleed",
          "disease",
          "paralyzed",
          "poison",
          "precision"
        ]
      },
      {
        "doubleVs": [
          "non-magical"
        ],
        "exceptions": [
          "force",
          "ghost-touch",
          "spirit"
        ],
        "key": "Resistance",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "type": [
          "all-damage"
        ],
        "value": 5
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "land-speed",
        "value": 25
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "selector": "fly-speed",
        "value": 25
      },
      {
        "key": "ActiveEffectLike",
        "mode": "override",
        "path": "system.abilities.str.mod",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "value": 5
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "athletics",
        "slug": "base",
        "value": 8
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "ac",
        "slug": "base",
        "value": 11
      },
      {
        "key": "FlatModifier",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": [
          "hp"
        ],
        "value": 20
      },
      {
        "itemType": "action",
        "key": "ItemAlteration",
        "label": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
        "mode": "add",
        "predicate": [
          "item:slug:pour-elixir",
          {
            "not": "support-rank"
          }
        ],
        "property": "description",
        "value": [
          {
            "text": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.RequirementAddendum.RankOne"
          }
        ]
      }
    ],
    "selectionEnum": [
      "1",
      "2",
      "3"
    ],
    "kind": "label",
    "suboptionValue": null,
    "display": "援助等级",
    "approvalSha256": "9f32367c346d8a679ef5d35d51f9b17947e6229f0302aced74c352aee9b122cc"
  },
  {
    "path": "actors[322].items[5].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "amsxeDlpOVfUTxbx",
      "type": "npc",
      "names": [
        "Ausken Dast",
        "奥斯肯·达斯特 Ausken Dast"
      ],
      "folder": "h8uOhq5XwRdjsNhg",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.amsxeDlpOVfUTxbx"
    },
    "item": {
      "id": "I0ZvKacL2AOWXtLO",
      "type": "action",
      "names": [
        "Physical Manifestation",
        "实体显现 Physical Manifestation"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": null,
      "bodies": [
        "<p>Upon reaching rank 1, Ausken manifests a semi-physical body. He loses the incorporeal trait, his immunities and resistances, and his fly Speed, and gains a land Speed of 25 feet. He has a Strength modifier of +5, an Athletics modifier of +12, an AC of 22, 78 HP, and can use Sheriff's Blessing. His other statistics do not change.</p>",
        "<p>达到1阶时，奥斯肯显现出一具半实体身躯。他失去虚体特征、免疫、抗力和飞行速度，并获得25尺陆地速度。他的力量调整值为+5，运动调整值为+12，AC为22，HP为78，并能使用治安官的祝福。其他数据不变。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
        "option": "support-rank",
        "selection": "1",
        "suboptions": [
          {
            "label": "PF2E.SpecificRule.Numbers.One",
            "value": "1"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Two",
            "value": "2"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Three",
            "value": "3"
          }
        ],
        "toggleable": true
      },
      {
        "key": "ActorTraits",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "remove": [
          "incorporeal"
        ]
      },
      {
        "key": "Immunity",
        "mode": "remove",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "type": [
          "bleed",
          "disease",
          "paralyzed",
          "poison",
          "precision"
        ]
      },
      {
        "doubleVs": [
          "non-magical"
        ],
        "exceptions": [
          "force",
          "ghost-touch",
          "spirit"
        ],
        "key": "Resistance",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "type": [
          "all-damage"
        ],
        "value": 5
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "land-speed",
        "value": 25
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "selector": "fly-speed",
        "value": 25
      },
      {
        "key": "ActiveEffectLike",
        "mode": "override",
        "path": "system.abilities.str.mod",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "value": 5
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "athletics",
        "slug": "base",
        "value": 12
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "ac",
        "slug": "base",
        "value": 12
      },
      {
        "key": "FlatModifier",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": [
          "hp"
        ],
        "value": 18
      },
      {
        "itemType": "action",
        "key": "ItemAlteration",
        "label": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
        "mode": "add",
        "predicate": [
          "item:slug:sheriffs-blessing",
          {
            "not": "support-rank"
          }
        ],
        "property": "description",
        "value": [
          {
            "text": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.RequirementAddendum.RankOne"
          }
        ]
      }
    ],
    "selectionEnum": [
      "1",
      "2",
      "3"
    ],
    "kind": "label",
    "suboptionValue": null,
    "display": "援助等级",
    "approvalSha256": "3a1cf468464d96bbcd9e4dee209dbc9d0de50ec6c54c53719276dc763134c84f"
  },
  {
    "path": "actors[323].items[52].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "fzR7RcghT8KUk4nd",
      "type": "npc",
      "names": [
        "Banijer Greely",
        "班尼杰·格里利 Banijer Greely"
      ],
      "folder": "h8uOhq5XwRdjsNhg",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.fzR7RcghT8KUk4nd"
    },
    "item": {
      "id": "7MQUzgLLAnwKm3M1",
      "type": "action",
      "names": [
        "Physical Manifestation",
        "实体显现 Physical Manifestation"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": null,
      "bodies": [
        "<p>Upon reaching rank 1, Banijer manifests a semi-physical body. He loses the incorporeal trait, his immunities and resistances, and his fly Speed, and gains a land Speed of 25 feet. He has a Strength modifier of +1, an Athletics modifier of +9, an AC of 21, 73 HP, and primal innate spells. His other statistics do not change.</p>",
        "<p>达到1阶时，班尼杰显现出一具半实体身躯。他失去虚体特征、免疫、抗力和飞行速度，并获得25尺陆地速度。他的力量调整值为+1，运动调整值为+9，AC为21，HP为73，并获得原能内在法术。其他数据不变。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
        "option": "support-rank",
        "selection": "1",
        "suboptions": [
          {
            "label": "PF2E.SpecificRule.Numbers.One",
            "value": "1"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Two",
            "value": "2"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Three",
            "value": "3"
          }
        ],
        "toggleable": true
      },
      {
        "key": "ActorTraits",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "remove": [
          "incorporeal"
        ]
      },
      {
        "key": "Immunity",
        "mode": "remove",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "type": [
          "bleed",
          "disease",
          "paralyzed",
          "poison",
          "precision"
        ]
      },
      {
        "doubleVs": [
          "non-magical"
        ],
        "exceptions": [
          "force",
          "ghost-touch",
          "spirit"
        ],
        "key": "Resistance",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "type": [
          "all-damage"
        ],
        "value": 5
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "land-speed",
        "value": 25
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "selector": "fly-speed",
        "value": 25
      },
      {
        "key": "ActiveEffectLike",
        "mode": "override",
        "path": "system.abilities.str.mod",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "value": 1
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "athletics",
        "slug": "base",
        "value": 9
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "ac",
        "slug": "base",
        "value": 11
      },
      {
        "key": "FlatModifier",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": [
          "hp"
        ],
        "value": 21
      }
    ],
    "selectionEnum": [
      "1",
      "2",
      "3"
    ],
    "kind": "label",
    "suboptionValue": null,
    "display": "援助等级",
    "approvalSha256": "d8c70e3a9f9747d2fe757e286d4ebb39e94e33dba83b014ce27310fa1b562bde"
  },
  {
    "path": "actors[324].items[52].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "jjJtjn6IC9SC7zl3",
      "type": "npc",
      "names": [
        "Esmira Vermidian",
        "埃丝米拉·维尔米迪安 Esmira Vermidian"
      ],
      "folder": "h8uOhq5XwRdjsNhg",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.jjJtjn6IC9SC7zl3"
    },
    "item": {
      "id": "4DRyFKXHWDnAa0v1",
      "type": "action",
      "names": [
        "Physical Manifestation",
        "实体显现 Physical Manifestation"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": null,
      "bodies": [
        "<p>Upon reaching rank 1, Esmira manifests a semi-physical body. She loses the incorporeal trait, her immunities and resistances, and her fly Speed, and gains a land Speed of 25 feet. She has a Strength modifier of +1, an Athletics modifier of +8, an AC of 21, 72 HP, and arcane innate spells. Her other statistics do not change.</p>",
        "<p>达到1阶时，埃丝米拉显现出一具半实体身躯。她失去虚体特征、免疫、抗力和飞行速度，并获得25尺陆地速度。她的力量调整值为+1，运动调整值为+8，AC为21，HP为72，并获得奥术内在法术。其他数据不变。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
        "option": "support-rank",
        "selection": "1",
        "suboptions": [
          {
            "label": "PF2E.SpecificRule.Numbers.One",
            "value": "1"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Two",
            "value": "2"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Three",
            "value": "3"
          }
        ],
        "toggleable": true
      },
      {
        "key": "ActorTraits",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "remove": [
          "incorporeal"
        ]
      },
      {
        "key": "Immunity",
        "mode": "remove",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "type": [
          "bleed",
          "disease",
          "paralyzed",
          "poison",
          "precision"
        ]
      },
      {
        "doubleVs": [
          "non-magical"
        ],
        "exceptions": [
          "force",
          "ghost-touch",
          "spirit"
        ],
        "key": "Resistance",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "type": [
          "all-damage"
        ],
        "value": 5
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "land-speed",
        "value": 25
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "selector": "fly-speed",
        "value": 25
      },
      {
        "key": "ActiveEffectLike",
        "mode": "override",
        "path": "system.abilities.str.mod",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "value": 1
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "athletics",
        "slug": "base",
        "value": 8
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "ac",
        "slug": "base",
        "value": 11
      },
      {
        "key": "FlatModifier",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": [
          "hp"
        ],
        "value": 22
      }
    ],
    "selectionEnum": [
      "1",
      "2",
      "3"
    ],
    "kind": "label",
    "suboptionValue": null,
    "display": "援助等级",
    "approvalSha256": "c7837ba05d4f300ee19eb2d5fdc51a7184313155dc198fd5ab68d150f72265a7"
  },
  {
    "path": "actors[325].items[52].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "l4VX4Iwxdyyo4mAI",
      "type": "npc",
      "names": [
        "Ilana Greenbough",
        "伊拉娜·绿枝 Ilana Greenbough"
      ],
      "folder": "h8uOhq5XwRdjsNhg",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.l4VX4Iwxdyyo4mAI"
    },
    "item": {
      "id": "it2iPlGi5aqGjeK4",
      "type": "action",
      "names": [
        "Physical Manifestation",
        "实体显现 Physical Manifestation"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": null,
      "bodies": [
        "<p>Upon reaching rank 1, Ilana manifests a semi-physical body. She loses the incorporeal trait, her immunities and resistances, and her fly Speed, and gains a land Speed of 25 feet. She has a Strength modifier of +3, an Athletics modifier of +10, an AC of 21, 74 HP, and occult innate spells. Her other statistics do not change.</p>",
        "<p>达到第1阶时，伊拉娜会显现出半实体身躯。她失去虚体特征、各项免疫与抗力，以及飞行速度，并获得25尺陆地速度。她的力量调整值为+3，运动调整值为+10，防御等级为21，生命值为74，并获得异能内在法术。她的其他数据不变。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
        "option": "support-rank",
        "selection": "1",
        "suboptions": [
          {
            "label": "PF2E.SpecificRule.Numbers.One",
            "value": "1"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Two",
            "value": "2"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Three",
            "value": "3"
          }
        ],
        "toggleable": true
      },
      {
        "key": "ActorTraits",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "remove": [
          "incorporeal"
        ]
      },
      {
        "key": "Immunity",
        "mode": "remove",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "type": [
          "bleed",
          "disease",
          "paralyzed",
          "poison",
          "precision"
        ]
      },
      {
        "doubleVs": [
          "non-magical"
        ],
        "exceptions": [
          "force",
          "ghost-touch",
          "spirit"
        ],
        "key": "Resistance",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "type": [
          "all-damage"
        ],
        "value": 5
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "land-speed",
        "value": 25
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "selector": "fly-speed",
        "value": 25
      },
      {
        "key": "ActiveEffectLike",
        "mode": "override",
        "path": "system.abilities.str.mod",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "value": 3
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "athletics",
        "slug": "base",
        "value": 10
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "ac",
        "slug": "base",
        "value": 11
      },
      {
        "key": "FlatModifier",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": [
          "hp"
        ],
        "value": 21
      }
    ],
    "selectionEnum": [
      "1",
      "2",
      "3"
    ],
    "kind": "label",
    "suboptionValue": null,
    "display": "援助等级",
    "approvalSha256": "7d7bb635a6c2fad2a218e0bf6fbb407f8baa76da4be0648c648fc85381f601be"
  },
  {
    "path": "actors[326].items[52].system.rules[0].label",
    "approved": true,
    "scope": "native-root-actor-rule",
    "actor": {
      "id": "y4pwwFi0rSVwHOz6",
      "type": "npc",
      "names": [
        "Shirail Animender",
        "希蕾尔·阿尼门德 Shirail Animender"
      ],
      "folder": "h8uOhq5XwRdjsNhg",
      "sourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.y4pwwFi0rSVwHOz6"
    },
    "item": {
      "id": "mG4oUZMSyLxBQQpK",
      "type": "action",
      "names": [
        "Physical Manifestation",
        "实体显现 Physical Manifestation"
      ],
      "folder": null,
      "sourceUuid": null,
      "slug": null,
      "bodies": [
        "<p>Upon reaching rank 1, Shirail manifests a semi-physical body. She loses the incorporeal trait, her immunities and resistances, and her fly Speed, and gains a land Speed of 25 feet. She has a Strength modifier of +2, an Athletics modifier of +9, an AC of 21, 75 HP, and divine innate spells. Her other statistics do not change.</p>",
        "<p>达到位阶1时，希蕾尔显现出半实体的身体。她失去虚体特征、免疫、抗力与飞行速度，获得25尺陆地速度。她的力量调整值为+2，运动调整值为+9，AC为21，HP为75，并获得神术内在法术。其他数据不变。</p>"
      ],
      "gmBodies": [
        ""
      ]
    },
    "ruleIndex": 0,
    "rules": [
      {
        "key": "RollOption",
        "label": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
        "option": "support-rank",
        "selection": "1",
        "suboptions": [
          {
            "label": "PF2E.SpecificRule.Numbers.One",
            "value": "1"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Two",
            "value": "2"
          },
          {
            "label": "PF2E.SpecificRule.Numbers.Three",
            "value": "3"
          }
        ],
        "toggleable": true,
        "value": false
      },
      {
        "key": "ActorTraits",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "remove": [
          "incorporeal"
        ]
      },
      {
        "key": "Immunity",
        "mode": "remove",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "type": [
          "bleed",
          "disease",
          "paralyzed",
          "poison",
          "precision"
        ]
      },
      {
        "doubleVs": [
          "non-magical"
        ],
        "exceptions": [
          "force",
          "ghost-touch",
          "spirit"
        ],
        "key": "Resistance",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "type": [
          "all-damage"
        ],
        "value": 5
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "land-speed",
        "value": 25
      },
      {
        "key": "BaseSpeed",
        "predicate": [
          {
            "not": "support-rank"
          }
        ],
        "selector": "fly-speed",
        "value": 25
      },
      {
        "key": "ActiveEffectLike",
        "mode": "override",
        "path": "system.abilities.str.mod",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "value": 2
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "athletics",
        "slug": "base",
        "value": 9
      },
      {
        "key": "AdjustModifier",
        "mode": "upgrade",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": "ac",
        "slug": "base",
        "value": 11
      },
      {
        "key": "FlatModifier",
        "predicate": [
          {
            "gte": [
              "support-rank",
              1
            ]
          }
        ],
        "selector": [
          "hp"
        ],
        "value": 19
      }
    ],
    "selectionEnum": [
      "1",
      "2",
      "3"
    ],
    "kind": "label",
    "suboptionValue": null,
    "display": "援助等级",
    "approvalSha256": "599dc04ab8c2a5231e91717eb3295df2183e9297bdcde641b35aab2e8604ef45"
  }
]);
