// Exact approved display carriers; original rule data is never translated.
export const RULE_DISPLAY_BINDINGS = [
  {
    "key": "L3vRwN2JcJVk88Ij/3Eksrmh390T4SrP7",
    "sourcePath": "actors[6].items[2]",
    "actorId": "L3vRwN2JcJVk88Ij",
    "actorName": "埃丝米拉·维尔米迪安 Esmira Vermidian",
    "actorType": "npc",
    "actorFolderId": "cGe8iQTsYWPjF3s7",
    "actorSourceUuid": "Compendium.pf2e.pathfinder-monster-core.Actor.KgJq51AeYrENo3Db",
    "itemId": "3Eksrmh390T4SrP7",
    "itemName": "魔法免疫 Magic Immunity",
    "itemType": "action",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"exceptions\":[{\"definition\":[\"item:type:spell\",{\"or\":[\"item:slug:force-barrage\",\"item:slug:quandary\",\"item:slug:revealing-light\"]}],\"label\":\"PF2E.IWR.Custom.WispVulnerabilities\"}],\"key\":\"Immunity\",\"type\":\"magic\"}]",
    "itemBody": "<p>鬼火免疫所有法术，但@UUID[Compendium.pf2e.spells-srd.Item.gKKqvLohtrSJj3BM]{力场飞弹}、@UUID[Compendium.pf2e.spells-srd.Item.Oj1PJBMQD9vuwCv7]{迷障术}和@UUID[Compendium.pf2e.spells-srd.Item.0qaqksrGGDj74HXE]{显光尘}除外。</p>",
    "itemImage": "systems/pf2e/icons/actions/Passive.webp",
    "sourceFingerprint": "9f04729fd3c7217fea56c34a714eaff62af09ac09511e8a861fb4113f4697414",
    "expectedSource": {
      "_id": "3Eksrmh390T4SrP7",
      "img": "systems/pf2e/icons/actions/Passive.webp",
      "name": "魔法免疫 Magic Immunity",
      "sort": 300000,
      "system": {
        "actionType": {
          "value": "passive"
        },
        "actions": {
          "value": null
        },
        "category": "defensive",
        "description": {
          "value": "<p>鬼火免疫所有法术，但@UUID[Compendium.pf2e.spells-srd.Item.gKKqvLohtrSJj3BM]{力场飞弹}、@UUID[Compendium.pf2e.spells-srd.Item.Oj1PJBMQD9vuwCv7]{迷障术}和@UUID[Compendium.pf2e.spells-srd.Item.0qaqksrGGDj74HXE]{显光尘}除外。</p>",
          "gm": ""
        },
        "publication": {
          "license": "ORC",
          "remaster": true,
          "title": "Pathfinder怪物核心",
          "authors": ""
        },
        "rules": [
          {
            "exceptions": [
              {
                "definition": [
                  "item:type:spell",
                  {
                    "or": [
                      "item:slug:force-barrage",
                      "item:slug:quandary",
                      "item:slug:revealing-light"
                    ]
                  }
                ],
                "label": "PF2E.IWR.Custom.WispVulnerabilities"
              }
            ],
            "key": "Immunity",
            "type": "magic"
          }
        ],
        "slug": null,
        "traits": {
          "value": [],
          "otherTags": []
        },
        "_migration": {
          "version": 0.959,
          "previous": null
        }
      },
      "type": "action",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": null,
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "flags": {},
      "ownership": {
        "default": 0
      }
    },
    "rules": [
      {
        "index": 0,
        "key": "Immunity",
        "source": {
          "exceptions": [
            {
              "definition": [
                "item:type:spell",
                {
                  "or": [
                    "item:slug:force-barrage",
                    "item:slug:quandary",
                    "item:slug:revealing-light"
                  ]
                }
              ],
              "label": "PF2E.IWR.Custom.WispVulnerabilities"
            }
          ],
          "key": "Immunity",
          "type": "magic"
        },
        "sourceFingerprint": "bd850d77ee6a2fad4234aca9784f9b4fbed1687cd1664d61e058b44adf243671",
        "fields": [
          {
            "path": "actors[6].items[2].system.rules[0].exceptions[0].label",
            "before": "PF2E.IWR.Custom.WispVulnerabilities",
            "after": "鬼火的魔法免疫例外",
            "recordSha256": "b1bb565eb9158cd5f643250549eb75dd663e6b02fae2d0d503d9731e1736dc28"
          }
        ]
      }
    ],
    "approvalFingerprint": "a64936de6b5a44468327ea68e5d4b6e302676b49c05dbc6a87f976c5fdf20074"
  },
  {
    "key": "KgJq51AeYrENo3Db/3Eksrmh390T4SrP7",
    "sourcePath": "actors[154].items[2]",
    "actorId": "KgJq51AeYrENo3Db",
    "actorName": "鬼火 Will-o'-Wisp",
    "actorType": "npc",
    "actorFolderId": "g4Sd0AmMN3is4nXo",
    "actorSourceUuid": "Compendium.pf2e.pathfinder-monster-core.Actor.KgJq51AeYrENo3Db",
    "itemId": "3Eksrmh390T4SrP7",
    "itemName": "魔法免疫 Magic Immunity",
    "itemType": "action",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"exceptions\":[{\"definition\":[\"item:type:spell\",{\"or\":[\"item:slug:force-barrage\",\"item:slug:quandary\",\"item:slug:revealing-light\"]}],\"label\":\"PF2E.IWR.Custom.WispVulnerabilities\"}],\"key\":\"Immunity\",\"type\":\"magic\"}]",
    "itemBody": "<p>鬼火免疫所有法术，但@UUID[Compendium.pf2e.spells-srd.Item.gKKqvLohtrSJj3BM]{力场飞弹}、@UUID[Compendium.pf2e.spells-srd.Item.Oj1PJBMQD9vuwCv7]{迷障术}和@UUID[Compendium.pf2e.spells-srd.Item.0qaqksrGGDj74HXE]{显光尘}除外。</p>",
    "itemImage": "systems/pf2e/icons/actions/Passive.webp",
    "sourceFingerprint": "9f04729fd3c7217fea56c34a714eaff62af09ac09511e8a861fb4113f4697414",
    "expectedSource": {
      "_id": "3Eksrmh390T4SrP7",
      "img": "systems/pf2e/icons/actions/Passive.webp",
      "name": "魔法免疫 Magic Immunity",
      "sort": 300000,
      "system": {
        "actionType": {
          "value": "passive"
        },
        "actions": {
          "value": null
        },
        "category": "defensive",
        "description": {
          "value": "<p>鬼火免疫所有法术，但@UUID[Compendium.pf2e.spells-srd.Item.gKKqvLohtrSJj3BM]{力场飞弹}、@UUID[Compendium.pf2e.spells-srd.Item.Oj1PJBMQD9vuwCv7]{迷障术}和@UUID[Compendium.pf2e.spells-srd.Item.0qaqksrGGDj74HXE]{显光尘}除外。</p>",
          "gm": ""
        },
        "publication": {
          "license": "ORC",
          "remaster": true,
          "title": "Pathfinder怪物核心",
          "authors": ""
        },
        "rules": [
          {
            "exceptions": [
              {
                "definition": [
                  "item:type:spell",
                  {
                    "or": [
                      "item:slug:force-barrage",
                      "item:slug:quandary",
                      "item:slug:revealing-light"
                    ]
                  }
                ],
                "label": "PF2E.IWR.Custom.WispVulnerabilities"
              }
            ],
            "key": "Immunity",
            "type": "magic"
          }
        ],
        "slug": null,
        "traits": {
          "value": [],
          "otherTags": []
        },
        "_migration": {
          "version": 0.959,
          "previous": null
        }
      },
      "type": "action",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": null,
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "flags": {},
      "ownership": {
        "default": 0
      }
    },
    "rules": [
      {
        "index": 0,
        "key": "Immunity",
        "source": {
          "exceptions": [
            {
              "definition": [
                "item:type:spell",
                {
                  "or": [
                    "item:slug:force-barrage",
                    "item:slug:quandary",
                    "item:slug:revealing-light"
                  ]
                }
              ],
              "label": "PF2E.IWR.Custom.WispVulnerabilities"
            }
          ],
          "key": "Immunity",
          "type": "magic"
        },
        "sourceFingerprint": "bd850d77ee6a2fad4234aca9784f9b4fbed1687cd1664d61e058b44adf243671",
        "fields": [
          {
            "path": "actors[154].items[2].system.rules[0].exceptions[0].label",
            "before": "PF2E.IWR.Custom.WispVulnerabilities",
            "after": "鬼火的魔法免疫例外",
            "recordSha256": "546d1927c5bfa8fe54c4de4b18cf52bfcda71626174254b1bd10dd79fb78e297"
          }
        ]
      }
    ],
    "approvalFingerprint": "6fe47a74a01548d24d35ed8a3c80fd792f8de81246ecfd1e4f5f89d6c5ae8e1d"
  },
  {
    "key": "Gva6GAH3WjjRi8Wd/shEp3scXXBxti42q",
    "sourcePath": "actors[15].items[9]",
    "actorId": "Gva6GAH3WjjRi8Wd",
    "actorName": "伦布尔斯·沃西 Rembles Worthy",
    "actorType": "npc",
    "actorFolderId": "cGe8iQTsYWPjF3s7",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.Gva6GAH3WjjRi8Wd",
    "itemId": "shEp3scXXBxti42q",
    "itemName": "变形 Change Shape",
    "itemType": "action",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.bestiary-ability-glossary-srd.Item.eQM5hQ1W3d1uen97",
    "itemSlug": "change-shape",
    "itemRulesJSON": "[{\"alwaysActive\":true,\"key\":\"RollOption\",\"label\":\"PF2E.NPCAbility.ChangeShape.Label\",\"option\":\"change-shape\",\"selection\":\"barghest\",\"suboptions\":[{\"label\":\"PF2E.NPCAbility.ChangeShape.Form.Barghest\",\"value\":\"barghest\"},{\"label\":\"PF2E.NPCAbility.ChangeShape.Form.Animal.Specific.Dog\",\"value\":\"dog\"},{\"label\":\"PF2E.NPCAbility.ChangeShape.Form.Humanoid.Humanoid\",\"value\":\"humanoid\"}],\"toggleable\":true,\"value\":true},{\"attackModifier\":13,\"damage\":{\"base\":{\"damageType\":\"piercing\",\"dice\":2,\"die\":\"d8\",\"modifier\":5}},\"key\":\"Strike\",\"label\":\"PF2E.BattleForm.Attack.Jaws\",\"predicate\":[{\"not\":\"change-shape:humanoid\"}],\"traits\":\"unholy\"},{\"key\":\"Note\",\"selector\":\"jaws-damage\",\"text\":\"@Localize[PF2E.NPC.Abilities.Glossary.Knockdown]\",\"title\":\"Knockdown\",\"visibility\":\"owner\"},{\"key\":\"BaseSpeed\",\"predicate\":[\"change-shape:dog\"],\"selector\":\"land\",\"value\":35},{\"key\":\"DamageDice\",\"override\":{\"damageType\":\"bludgeoning\"},\"predicate\":[\"change-shape:humanoid\"],\"selector\":\"claw-damage\"}]",
    "itemBody": "<p>犬魔可以变成类人生物、犬或自身的真实形态。其体型变为与新形态相符。处于类人生物形态时，其爪击打击造成钝击伤害，且失去颚咬打击。处于犬形态时，其速度变为35尺。每只犬魔都只有一种类人生物形态与一种犬形态。</p>\n<hr>\n<p>@Localize[PF2E.NPC.Abilities.Glossary.ChangeShape]</p>",
    "itemImage": "systems/pf2e/icons/actions/OneAction.webp",
    "sourceFingerprint": "e60caa9c6a8512e546085ad570e69dbcc7d842b8679b3ac5043df1edc958fec0",
    "expectedSource": {
      "_id": "shEp3scXXBxti42q",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": "Compendium.pf2e.bestiary-ability-glossary-srd.Item.eQM5hQ1W3d1uen97",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "flags": {
        "pf2e": {
          "itemGrants": {
            "knockdown": {
              "id": "B1BW0i8XZOSPvXCj",
              "onDelete": "detach"
            },
            "knockdown2": {
              "id": "T91rADZmuE5fJ8VA",
              "onDelete": "detach"
            },
            "knockdown3": {
              "id": "pDhfqZxCN1JT8gHg",
              "onDelete": "detach"
            }
          }
        }
      },
      "img": "systems/pf2e/icons/actions/OneAction.webp",
      "name": "变形 Change Shape",
      "sort": 1000000,
      "system": {
        "actionType": {
          "value": "action"
        },
        "actions": {
          "value": 1
        },
        "category": "offensive",
        "description": {
          "value": "<p>犬魔可以变成类人生物、犬或自身的真实形态。其体型变为与新形态相符。处于类人生物形态时，其爪击打击造成钝击伤害，且失去颚咬打击。处于犬形态时，其速度变为35尺。每只犬魔都只有一种类人生物形态与一种犬形态。</p>\n<hr>\n<p>@Localize[PF2E.NPC.Abilities.Glossary.ChangeShape]</p>",
          "gm": ""
        },
        "publication": {
          "license": "ORC",
          "remaster": true,
          "title": "Pathfinder怪物核心",
          "authors": ""
        },
        "rules": [
          {
            "alwaysActive": true,
            "key": "RollOption",
            "label": "PF2E.NPCAbility.ChangeShape.Label",
            "option": "change-shape",
            "selection": "barghest",
            "suboptions": [
              {
                "label": "PF2E.NPCAbility.ChangeShape.Form.Barghest",
                "value": "barghest"
              },
              {
                "label": "PF2E.NPCAbility.ChangeShape.Form.Animal.Specific.Dog",
                "value": "dog"
              },
              {
                "label": "PF2E.NPCAbility.ChangeShape.Form.Humanoid.Humanoid",
                "value": "humanoid"
              }
            ],
            "toggleable": true,
            "value": true
          },
          {
            "attackModifier": 13,
            "damage": {
              "base": {
                "damageType": "piercing",
                "dice": 2,
                "die": "d8",
                "modifier": 5
              }
            },
            "key": "Strike",
            "label": "PF2E.BattleForm.Attack.Jaws",
            "predicate": [
              {
                "not": "change-shape:humanoid"
              }
            ],
            "traits": "unholy"
          },
          {
            "key": "Note",
            "selector": "jaws-damage",
            "text": "@Localize[PF2E.NPC.Abilities.Glossary.Knockdown]",
            "title": "Knockdown",
            "visibility": "owner"
          },
          {
            "key": "BaseSpeed",
            "predicate": [
              "change-shape:dog"
            ],
            "selector": "land",
            "value": 35
          },
          {
            "key": "DamageDice",
            "override": {
              "damageType": "bludgeoning"
            },
            "predicate": [
              "change-shape:humanoid"
            ],
            "selector": "claw-damage"
          }
        ],
        "slug": "change-shape",
        "traits": {
          "value": [
            "concentrate",
            "polymorph",
            "primal"
          ],
          "otherTags": []
        },
        "_migration": {
          "version": 0.959,
          "previous": null
        }
      },
      "type": "action",
      "effects": [],
      "folder": null,
      "ownership": {
        "default": 0
      }
    },
    "rules": [
      {
        "index": 1,
        "key": "Strike",
        "source": {
          "attackModifier": 13,
          "damage": {
            "base": {
              "damageType": "piercing",
              "dice": 2,
              "die": "d8",
              "modifier": 5
            }
          },
          "key": "Strike",
          "label": "PF2E.BattleForm.Attack.Jaws",
          "predicate": [
            {
              "not": "change-shape:humanoid"
            }
          ],
          "traits": "unholy"
        },
        "sourceFingerprint": "af6b7fc6059eecd8d6ee9df3d40df4c8ea13e5938791456d771d407ec6707813",
        "fields": [
          {
            "path": "actors[15].items[9].system.rules[1].label",
            "before": "PF2E.BattleForm.Attack.Jaws",
            "after": "颚咬",
            "recordSha256": "cd88be6999fc717ff4b85ca32682b8691970be9a06dad7899683077087917a28"
          }
        ]
      }
    ],
    "approvalFingerprint": "ae2ca41cf87239b6cfbca7a79867654c1a2106eaaaa88b1b9f8525020b6c14a3"
  },
  {
    "key": "l5relJ9F1Ko1dpOB/oX5mS0nonoT9j23k",
    "sourcePath": "actors[143].items[10]",
    "actorId": "l5relJ9F1Ko1dpOB",
    "actorName": "伊尔维斯·蒙丹 Ilves Mondain",
    "actorType": "npc",
    "actorFolderId": "g4Sd0AmMN3is4nXo",
    "actorSourceUuid": "Compendium.pf2e.pathfinder-monster-core-2.Actor.vLgNUa2zB9FPwfhB",
    "itemId": "oX5mS0nonoT9j23k",
    "itemName": "绘画 Paint",
    "itemType": "action",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"SpecialStatistic\",\"label\":\"Blood Painter Paint Spell\",\"slug\":\"blood-painter-paint\",\"type\":\"attack-roll\"},{\"key\":\"FlatModifier\",\"selector\":\"blood-painter-paint\",\"value\":20}]",
    "itemBody": "<p><strong>需求</strong> 血画师已使用涂血，使一只爪子上沾有新鲜血液</p><hr><p><strong>效果</strong> 血画师消耗一只爪子上的血液，绘制出具有下列一种法术效果的幻术：@UUID[Compendium.pf2e.spells-srd.Item.f8SBoXiXQjlCKqly]{幻象生物}、@UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}或@UUID[Compendium.pf2e.spells-srd.Item.2oH5IufzdESuYxat]{幻象造物}。绘画动作获得所再现法术的特征，血画师可以维持这些效果。这些效果使用@Check[blood-painter-paint|against:ac]{+20}法术攻击调整值和DC 28，并升阶至5环。</p>\n<p>若两只或更多爪子上沾有新鲜血液，血画师可以消耗这些爪子上的全部血液，改为产生@UUID[Compendium.pf2e.spells-srd.Item.TCk2MDwf5L5OYjFC]{炫彩披风}或@UUID[Compendium.pf2e.spells-srd.Item.RQjSQVZRG497cJhX]{震荡图纹}的效果。</p>\n<p>此能力产生的任何效果，在对抗血液被用于绘画的生物时，攻击骰、伤害骰、豁免骰、技能检定和AC获得+2状态加值。该生物对抗这些效果的察觉检定与豁免还承受–2状态减值。</p>",
    "itemImage": "systems/pf2e/icons/actions/OneAction.webp",
    "sourceFingerprint": "473a6b9c77e2433d4ff7467d8284a7087cdec197a70fce8b0da36971eb10a6b9",
    "expectedSource": {
      "_id": "oX5mS0nonoT9j23k",
      "img": "systems/pf2e/icons/actions/OneAction.webp",
      "name": "绘画 Paint",
      "sort": 1100000,
      "system": {
        "actionType": {
          "value": "action"
        },
        "actions": {
          "value": 1
        },
        "category": "offensive",
        "description": {
          "value": "<p><strong>需求</strong> 血画师已使用涂血，使一只爪子上沾有新鲜血液</p><hr><p><strong>效果</strong> 血画师消耗一只爪子上的血液，绘制出具有下列一种法术效果的幻术：@UUID[Compendium.pf2e.spells-srd.Item.f8SBoXiXQjlCKqly]{幻象生物}、@UUID[Compendium.pf2e.spells-srd.Item.i35dpZFI7jZcRoBo]{幻象伪装}或@UUID[Compendium.pf2e.spells-srd.Item.2oH5IufzdESuYxat]{幻象造物}。绘画动作获得所再现法术的特征，血画师可以维持这些效果。这些效果使用@Check[blood-painter-paint|against:ac]{+20}法术攻击调整值和DC 28，并升阶至5环。</p>\n<p>若两只或更多爪子上沾有新鲜血液，血画师可以消耗这些爪子上的全部血液，改为产生@UUID[Compendium.pf2e.spells-srd.Item.TCk2MDwf5L5OYjFC]{炫彩披风}或@UUID[Compendium.pf2e.spells-srd.Item.RQjSQVZRG497cJhX]{震荡图纹}的效果。</p>\n<p>此能力产生的任何效果，在对抗血液被用于绘画的生物时，攻击骰、伤害骰、豁免骰、技能检定和AC获得+2状态加值。该生物对抗这些效果的察觉检定与豁免还承受–2状态减值。</p>",
          "gm": ""
        },
        "publication": {
          "license": "OGL",
          "remaster": false,
          "title": "",
          "authors": ""
        },
        "rules": [
          {
            "key": "SpecialStatistic",
            "label": "Blood Painter Paint Spell",
            "slug": "blood-painter-paint",
            "type": "attack-roll"
          },
          {
            "key": "FlatModifier",
            "selector": "blood-painter-paint",
            "value": 20
          }
        ],
        "slug": null,
        "traits": {
          "value": [
            "concentrate",
            "illusion",
            "manipulate",
            "occult"
          ],
          "otherTags": []
        },
        "_migration": {
          "version": 0.959,
          "previous": null
        }
      },
      "type": "action",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": null,
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "flags": {},
      "ownership": {
        "default": 0
      }
    },
    "rules": [
      {
        "index": 0,
        "key": "SpecialStatistic",
        "source": {
          "key": "SpecialStatistic",
          "label": "Blood Painter Paint Spell",
          "slug": "blood-painter-paint",
          "type": "attack-roll"
        },
        "sourceFingerprint": "372f4cc67fd7f6be26c9d07d34d63f34526ce4ec6c60dcd7eff5ddb1a335ddd4",
        "fields": [
          {
            "path": "actors[143].items[10].system.rules[0].label",
            "before": "Blood Painter Paint Spell",
            "after": "血画师绘画法术",
            "recordSha256": "d1cb6ec46c1b4b929e88bb9053b8e8702bcd080ff4bf37243df7d411aec1b275"
          }
        ]
      }
    ],
    "approvalFingerprint": "56a40d43152d04aa2c8aa39e544ce1b8d97b204900b739176addec5e14495107"
  },
  {
    "key": "IdB9oY5iELBfBs64/A7x0UIylEeHf7Bd6",
    "sourcePath": "actors[157].items[0]",
    "actorId": "IdB9oY5iELBfBs64",
    "actorName": "绘画用品 Art Supplies",
    "actorType": "loot",
    "actorFolderId": "jDhEGfku5UX52SkM",
    "actorSourceUuid": null,
    "itemId": "A7x0UIylEeHf7Bd6",
    "itemName": "专家级画师工具包 Painter's Toolkit (Sterling)",
    "itemType": "equipment",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.0QgniSjpzksm5riV",
    "itemSlug": "artisans-toolkit-sterling",
    "itemRulesJSON": "[{\"key\":\"FlatModifier\",\"label\":\"Artisan's Tools, Sterling (craft items)\",\"predicate\":[\"action:craft\"],\"selector\":\"crafting\",\"type\":\"item\",\"value\":1}]",
    "itemBody": "<p>使用手艺技能以原材料制作物品时，你需要这些工具。专家级工匠工具为该检定提供+1物品加值。</p><p>不同工作需要不同的工具套装，由GM决定；例如，铁匠的工具包就与木匠的不同。如果你将工匠工具包佩戴在身上，就可以将取出和放回工具作为使用它的动作的一部分。</p>",
    "itemImage": "icons/tools/hand/paint-palette.webp",
    "sourceFingerprint": "56af1ecd7763dc28c9506ef0e843aeae0f44264823c728644ab640bc804d9a2f",
    "expectedSource": {
      "img": "icons/tools/hand/paint-palette.webp",
      "name": "专家级画师工具包 Painter's Toolkit (Sterling)",
      "system": {
        "description": {
          "gm": "",
          "value": "<p>使用手艺技能以原材料制作物品时，你需要这些工具。专家级工匠工具为该检定提供+1物品加值。</p><p>不同工作需要不同的工具套装，由GM决定；例如，铁匠的工具包就与木匠的不同。如果你将工匠工具包佩戴在身上，就可以将取出和放回工具作为使用它的动作的一部分。</p>"
        },
        "rules": [
          {
            "key": "FlatModifier",
            "label": "Artisan's Tools, Sterling (craft items)",
            "predicate": [
              "action:craft"
            ],
            "selector": "crafting",
            "type": "item",
            "value": 1
          }
        ],
        "slug": "artisans-toolkit-sterling",
        "_migration": {
          "version": 0.959,
          "lastMigration": null,
          "previous": null
        },
        "traits": {
          "otherTags": [],
          "value": [],
          "rarity": "common"
        },
        "publication": {
          "title": "Pathfinder玩家核心",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "level": {
          "value": 3
        },
        "quantity": 1,
        "baseItem": null,
        "bulk": {
          "value": 2
        },
        "hp": {
          "value": 0,
          "max": 0
        },
        "hardness": 0,
        "price": {
          "value": {
            "gp": 50
          }
        },
        "equipped": {
          "carryType": "worn",
          "invested": null
        },
        "containerId": null,
        "size": "med",
        "material": {
          "type": null,
          "grade": null
        },
        "identification": {
          "status": "identified",
          "unidentified": {
            "name": "不寻常物品 Unusual Object",
            "img": "systems/pf2e/icons/unidentified_item_icons/adventuring_gear.webp",
            "data": {
              "description": {
                "value": ""
              }
            }
          }
        },
        "usage": {
          "value": "other"
        },
        "subitems": []
      },
      "type": "equipment",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": "Compendium.pf2e.equipment-srd.Item.0QgniSjpzksm5riV",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "sort": 0,
      "ownership": {
        "default": 0,
        "skBs48Uooc2qAhDD": 3
      },
      "flags": {},
      "_id": "A7x0UIylEeHf7Bd6"
    },
    "rules": [
      {
        "index": 0,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "label": "Artisan's Tools, Sterling (craft items)",
          "predicate": [
            "action:craft"
          ],
          "selector": "crafting",
          "type": "item",
          "value": 1
        },
        "sourceFingerprint": "bcd53df4afcf0cd849e1058931ec2dce1d9385cdc66a88880fb880b2db0a0fc4",
        "fields": [
          {
            "path": "actors[157].items[0].system.rules[0].label",
            "before": "Artisan's Tools, Sterling (craft items)",
            "after": "专家级工匠工具包（制作物品）",
            "recordSha256": "ee12c2e703c079ce9023f3e52b387f683466d4e07edf8ca29a61e8bc585a616e"
          }
        ]
      }
    ],
    "approvalFingerprint": "cc384560141896cd17537d8f904500423ef683c8d9631262813b24b5471b5ad8"
  },
  {
    "key": "uCzJs2T9UPwi13zq/btJ1BqiNKl6tN4KS",
    "sourcePath": "actors[211].items[0]",
    "actorId": "uCzJs2T9UPwi13zq",
    "actorName": "领主的工作台 Lord's Workbench",
    "actorType": "loot",
    "actorFolderId": "mtfsjK3KJn31aLgl",
    "actorSourceUuid": null,
    "itemId": "btJ1BqiNKl6tN4KS",
    "itemName": "专家级工匠工具包 Artisan's Toolkit (Sterling)",
    "itemType": "equipment",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.0QgniSjpzksm5riV",
    "itemSlug": "artisans-toolkit-sterling",
    "itemRulesJSON": "[{\"key\":\"FlatModifier\",\"label\":\"Artisan's Tools, Sterling (craft items)\",\"predicate\":[\"action:craft\"],\"selector\":\"crafting\",\"type\":\"item\",\"value\":1}]",
    "itemBody": "<p>使用手艺技能以原材料制作物品时，你需要这些工具。专家级工匠工具为该检定提供+1物品加值。</p>\n<p>不同工作需要不同的工具套装，由GM决定；例如，铁匠的工具包就与木匠的不同。如果你将工匠工具包佩戴在身上，就可以将取出和放回工具作为使用它的动作的一部分。</p>",
    "itemImage": "systems/pf2e/icons/equipment/adventuring-gear/artisan-tools.webp",
    "sourceFingerprint": "ce9a800111c2636219ac55af99c29980d3194a5eb42697aa331d25ba07fe4314",
    "expectedSource": {
      "img": "systems/pf2e/icons/equipment/adventuring-gear/artisan-tools.webp",
      "name": "专家级工匠工具包 Artisan's Toolkit (Sterling)",
      "system": {
        "description": {
          "gm": "",
          "value": "<p>使用手艺技能以原材料制作物品时，你需要这些工具。专家级工匠工具为该检定提供+1物品加值。</p>\n<p>不同工作需要不同的工具套装，由GM决定；例如，铁匠的工具包就与木匠的不同。如果你将工匠工具包佩戴在身上，就可以将取出和放回工具作为使用它的动作的一部分。</p>"
        },
        "rules": [
          {
            "key": "FlatModifier",
            "label": "Artisan's Tools, Sterling (craft items)",
            "predicate": [
              "action:craft"
            ],
            "selector": "crafting",
            "type": "item",
            "value": 1
          }
        ],
        "slug": "artisans-toolkit-sterling",
        "_migration": {
          "version": 0.959,
          "lastMigration": null,
          "previous": null
        },
        "traits": {
          "otherTags": [],
          "value": [],
          "rarity": "common"
        },
        "publication": {
          "title": "Pathfinder玩家核心",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "level": {
          "value": 3
        },
        "quantity": 1,
        "baseItem": null,
        "bulk": {
          "value": 2
        },
        "hp": {
          "value": 0,
          "max": 0
        },
        "hardness": 0,
        "price": {
          "value": {
            "gp": 50
          }
        },
        "equipped": {
          "carryType": "worn",
          "invested": null
        },
        "containerId": null,
        "size": "med",
        "material": {
          "type": null,
          "grade": null
        },
        "identification": {
          "status": "identified",
          "unidentified": {
            "name": "",
            "img": "",
            "data": {
              "description": {
                "value": ""
              }
            }
          }
        },
        "usage": {
          "value": "other"
        },
        "subitems": []
      },
      "type": "equipment",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": "Compendium.pf2e.equipment-srd.Item.0QgniSjpzksm5riV",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "sort": 0,
      "ownership": {
        "default": 0,
        "skBs48Uooc2qAhDD": 3
      },
      "flags": {},
      "_id": "btJ1BqiNKl6tN4KS"
    },
    "rules": [
      {
        "index": 0,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "label": "Artisan's Tools, Sterling (craft items)",
          "predicate": [
            "action:craft"
          ],
          "selector": "crafting",
          "type": "item",
          "value": 1
        },
        "sourceFingerprint": "bcd53df4afcf0cd849e1058931ec2dce1d9385cdc66a88880fb880b2db0a0fc4",
        "fields": [
          {
            "path": "actors[211].items[0].system.rules[0].label",
            "before": "Artisan's Tools, Sterling (craft items)",
            "after": "专家级工匠工具包（制作物品）",
            "recordSha256": "dcdc89dd9c690703ca9c57e8100419709a0f50dbad242d89a1af0bbd49196a2b"
          }
        ]
      }
    ],
    "approvalFingerprint": "647e40d1f915a23d468f0f679d46defcc768b2cef53110982cc6db0dbb7b2764"
  },
  {
    "key": "ApESlak4rt6NresM/SAqujBgHuTXrRiTd",
    "sourcePath": "actors[166].items[0]",
    "actorId": "ApESlak4rt6NresM",
    "actorName": "壁炉陈列品 Fireplace Display",
    "actorType": "loot",
    "actorFolderId": "jDhEGfku5UX52SkM",
    "actorSourceUuid": null,
    "itemId": "SAqujBgHuTXrRiTd",
    "itemName": "高等野兽法杖 Animal Staff (Greater)",
    "itemType": "weapon",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.bT9azgpc96DNbitA",
    "itemSlug": "animal-staff-greater",
    "itemRulesJSON": "[{\"key\":\"FlatModifier\",\"label\":\"Animal Staff (identify animals)\",\"predicate\":[\"target:trait:animal\",{\"or\":[\"action:recall-knowledge\",\"action:identify\"]}],\"selector\":\"nature\",\"type\":\"circumstance\",\"value\":2}]",
    "itemBody": "<p>这根法杖顶端雕刻着动物和怪兽的头颅。持用法杖时，你辨识动物的自然检定获得+2环境加值。</p>\n<p><strong>启动</strong> 施放法术</p>\n<p><strong>效果</strong> 你消耗法杖的一定充能，从其法术列表中施放一个法术。</p>\n<hr>\n<ul>\n<li><strong>戏法</strong> @UUID[Compendium.pf2e.spells-srd.Item.tXa5vOu5giBNCjdR]{指路术}</li>\n<li><strong>1环</strong> @UUID[Compendium.pf2e.spells-srd.Item.EE7Q5BHIrfWNCPtT]{魔躯术} @UUID[Compendium.pf2e.spells-srd.Item.4YnON9JHYqtLzccu]{召唤动物}</li>\n<li><strong>2环</strong> @UUID[Compendium.pf2e.spells-srd.Item.yhz9fF69uwRhnHix]{动物信使} @UUID[Compendium.pf2e.spells-srd.Item.BBvV7qoXGdw09q1C]{动物交谈} @UUID[Compendium.pf2e.spells-srd.Item.4YnON9JHYqtLzccu]{召唤动物}</li>\n<li><strong>3环</strong> @UUID[Compendium.pf2e.spells-srd.Item.wp09USMB3GIW1qbp]{动物形态} @UUID[Compendium.pf2e.spells-srd.Item.4YnON9JHYqtLzccu]{召唤动物}</li>\n</ul>\n<hr>\n<p><strong>制作需求</strong> 为所有列出的法术，提供其所有列出环级的各一次施法。</p>",
    "itemImage": "icons/weapons/staves/staff-ornate-bird.webp",
    "sourceFingerprint": "ba603a0ccf6d2755ca4fc62144ec96751a0dd51646a8f6e1c84da2ab58ac0c29",
    "expectedSource": {
      "img": "icons/weapons/staves/staff-ornate-bird.webp",
      "name": "高等野兽法杖 Animal Staff (Greater)",
      "system": {
        "description": {
          "gm": "",
          "value": "<p>这根法杖顶端雕刻着动物和怪兽的头颅。持用法杖时，你辨识动物的自然检定获得+2环境加值。</p>\n<p><strong>启动</strong> 施放法术</p>\n<p><strong>效果</strong> 你消耗法杖的一定充能，从其法术列表中施放一个法术。</p>\n<hr>\n<ul>\n<li><strong>戏法</strong> @UUID[Compendium.pf2e.spells-srd.Item.tXa5vOu5giBNCjdR]{指路术}</li>\n<li><strong>1环</strong> @UUID[Compendium.pf2e.spells-srd.Item.EE7Q5BHIrfWNCPtT]{魔躯术} @UUID[Compendium.pf2e.spells-srd.Item.4YnON9JHYqtLzccu]{召唤动物}</li>\n<li><strong>2环</strong> @UUID[Compendium.pf2e.spells-srd.Item.yhz9fF69uwRhnHix]{动物信使} @UUID[Compendium.pf2e.spells-srd.Item.BBvV7qoXGdw09q1C]{动物交谈} @UUID[Compendium.pf2e.spells-srd.Item.4YnON9JHYqtLzccu]{召唤动物}</li>\n<li><strong>3环</strong> @UUID[Compendium.pf2e.spells-srd.Item.wp09USMB3GIW1qbp]{动物形态} @UUID[Compendium.pf2e.spells-srd.Item.4YnON9JHYqtLzccu]{召唤动物}</li>\n</ul>\n<hr>\n<p><strong>制作需求</strong> 为所有列出的法术，提供其所有列出环级的各一次施法。</p>"
        },
        "rules": [
          {
            "key": "FlatModifier",
            "label": "Animal Staff (identify animals)",
            "predicate": [
              "target:trait:animal",
              {
                "or": [
                  "action:recall-knowledge",
                  "action:identify"
                ]
              }
            ],
            "selector": "nature",
            "type": "circumstance",
            "value": 2
          }
        ],
        "slug": "animal-staff-greater",
        "_migration": {
          "version": 0.959,
          "lastMigration": null,
          "previous": null
        },
        "traits": {
          "otherTags": [],
          "value": [
            "magical",
            "staff",
            "two-hand-d8"
          ],
          "rarity": "common"
        },
        "publication": {
          "title": "Pathfinder主持人核心",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "level": {
          "value": 8
        },
        "quantity": 1,
        "baseItem": "staff",
        "bulk": {
          "value": 1
        },
        "hp": {
          "value": 0,
          "max": 0
        },
        "hardness": 0,
        "price": {
          "value": {
            "gp": 460
          }
        },
        "equipped": {
          "carryType": "worn",
          "invested": null,
          "handsHeld": 0
        },
        "containerId": null,
        "size": "med",
        "material": {
          "type": null,
          "grade": null
        },
        "identification": {
          "status": "identified",
          "unidentified": {
            "name": "",
            "img": "",
            "data": {
              "description": {
                "value": ""
              }
            }
          }
        },
        "usage": {
          "value": "held-in-one-hand"
        },
        "category": "simple",
        "group": "club",
        "bonus": {
          "value": 0
        },
        "damage": {
          "dice": 1,
          "die": "d4",
          "damageType": "bludgeoning",
          "persistent": null
        },
        "splashDamage": {
          "value": 0
        },
        "range": null,
        "expend": null,
        "ammo": null,
        "reload": {
          "value": null
        },
        "grade": null,
        "runes": {
          "potency": 0,
          "striking": 0,
          "property": []
        },
        "specific": null,
        "subitems": [],
        "bonusDamage": {
          "value": 0
        }
      },
      "type": "weapon",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": "Compendium.pf2e.equipment-srd.Item.bT9azgpc96DNbitA",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "sort": 0,
      "ownership": {
        "default": 0,
        "skBs48Uooc2qAhDD": 3
      },
      "flags": {},
      "_id": "SAqujBgHuTXrRiTd"
    },
    "rules": [
      {
        "index": 0,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "label": "Animal Staff (identify animals)",
          "predicate": [
            "target:trait:animal",
            {
              "or": [
                "action:recall-knowledge",
                "action:identify"
              ]
            }
          ],
          "selector": "nature",
          "type": "circumstance",
          "value": 2
        },
        "sourceFingerprint": "2e3841d1b9d75559bbd3bd7df13daa622e7dee02003f452ce20c8c78d259fd0d",
        "fields": [
          {
            "path": "actors[166].items[0].system.rules[0].label",
            "before": "Animal Staff (identify animals)",
            "after": "野兽法杖（辨识动物）",
            "recordSha256": "0ae71b8cc7aef64a7490f7c5616b4c0d519a76762d0c3fbd168d6a5902aff23f"
          }
        ]
      }
    ],
    "approvalFingerprint": "4aee6229eea2d959a07dbfc3e871b9713d80b85f3a0b7d0afa385f20196d702b"
  },
  {
    "key": "UlUHf4haT6iiJ6HG/wqfjXBqz70bh9SZT",
    "sourcePath": "actors[220].items[7]",
    "actorId": "UlUHf4haT6iiJ6HG",
    "actorName": "工坊置物架 Workshop Shelves",
    "actorType": "loot",
    "actorFolderId": "mtfsjK3KJn31aLgl",
    "actorSourceUuid": null,
    "itemId": "wqfjXBqz70bh9SZT",
    "itemName": "专家级炼金实验室 Alchemist's Lab (Expanded)",
    "itemType": "equipment",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.uhka9LHEP3wDKytG",
    "itemSlug": "alchemists-lab-expanded",
    "itemRulesJSON": "[{\"key\":\"FlatModifier\",\"label\":\"Alchemist's Lab, Expanded (craft alchemical items)\",\"predicate\":[\"alchemical\",\"action:craft\"],\"selector\":\"crafting\",\"type\":\"item\",\"value\":1}]",
    "itemBody": "<p>在休整期制作炼金物品时，你需要一间炼金实验室。</p>\n<p>专家级炼金实验室为你制作炼金物品的手艺检定提供+1物品加值。</p>",
    "itemImage": "icons/containers/chest/chest-simple-box-steel-brown.webp",
    "sourceFingerprint": "bd19d97cb27bffddbee5d4b3c96a360d07fc0507cd86dd751ce25a98bdca7535",
    "expectedSource": {
      "img": "icons/containers/chest/chest-simple-box-steel-brown.webp",
      "name": "专家级炼金实验室 Alchemist's Lab (Expanded)",
      "system": {
        "description": {
          "gm": "",
          "value": "<p>在休整期制作炼金物品时，你需要一间炼金实验室。</p>\n<p>专家级炼金实验室为你制作炼金物品的手艺检定提供+1物品加值。</p>"
        },
        "rules": [
          {
            "key": "FlatModifier",
            "label": "Alchemist's Lab, Expanded (craft alchemical items)",
            "predicate": [
              "alchemical",
              "action:craft"
            ],
            "selector": "crafting",
            "type": "item",
            "value": 1
          }
        ],
        "slug": "alchemists-lab-expanded",
        "_migration": {
          "version": 0.959,
          "lastMigration": null,
          "previous": null
        },
        "traits": {
          "otherTags": [],
          "value": [],
          "rarity": "common"
        },
        "publication": {
          "title": "Pathfinder玩家核心",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "level": {
          "value": 3
        },
        "quantity": 2,
        "baseItem": null,
        "bulk": {
          "value": 6
        },
        "hp": {
          "value": 0,
          "max": 0
        },
        "hardness": 0,
        "price": {
          "value": {
            "gp": 55
          }
        },
        "equipped": {
          "carryType": "worn",
          "invested": null
        },
        "containerId": null,
        "size": "med",
        "material": {
          "type": null,
          "grade": null
        },
        "identification": {
          "status": "identified",
          "unidentified": {
            "name": "",
            "img": "",
            "data": {
              "description": {
                "value": ""
              }
            }
          }
        },
        "usage": {
          "value": "held-in-two-hands"
        },
        "subitems": []
      },
      "type": "equipment",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": "Compendium.pf2e.equipment-srd.Item.uhka9LHEP3wDKytG",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "sort": 0,
      "ownership": {
        "default": 0,
        "skBs48Uooc2qAhDD": 3
      },
      "flags": {},
      "_id": "wqfjXBqz70bh9SZT"
    },
    "rules": [
      {
        "index": 0,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "label": "Alchemist's Lab, Expanded (craft alchemical items)",
          "predicate": [
            "alchemical",
            "action:craft"
          ],
          "selector": "crafting",
          "type": "item",
          "value": 1
        },
        "sourceFingerprint": "69421355842e444d248607316e2d0362a2862b5abf9fa5cb5a85ccaa840200c8",
        "fields": [
          {
            "path": "actors[220].items[7].system.rules[0].label",
            "before": "Alchemist's Lab, Expanded (craft alchemical items)",
            "after": "专家级炼金实验室（制作炼金物品）",
            "recordSha256": "6d668dfeaac1f25065e76411b66cbcbaa2caf6cacb2381155bd93cb37e39d3a8"
          }
        ]
      }
    ],
    "approvalFingerprint": "7d5c2fa06bc008e02789e29034dd594097d99e75518fb227277c3f96637331a5"
  },
  {
    "key": "li1lVdGt2WmSL7kg/9sAss5cc1FmTPDKe",
    "sourcePath": "actors[250].items[0]",
    "actorId": "li1lVdGt2WmSL7kg",
    "actorName": "壁炉旁 Near Fireplace",
    "actorType": "loot",
    "actorFolderId": "MdWHTsTm41MZ716B",
    "actorSourceUuid": null,
    "itemId": "9sAss5cc1FmTPDKe",
    "itemName": "高等万能钥匙 Skeleton Key (Greater)",
    "itemType": "equipment",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.AFE073UYI0mkWuUs",
    "itemSlug": "skeleton-key-greater",
    "itemRulesJSON": "[{\"key\":\"FlatModifier\",\"label\":\"Skeleton Key, Greater (Pick a Lock)\",\"predicate\":[\"action:pick-a-lock\"],\"selector\":\"thievery\",\"type\":\"item\",\"value\":2}]",
    "itemBody": "<p>这把阴森钥匙的匙柄顶端饰有一颗咧嘴而笑的头骨。尝试开锁时，它可以代替盗贼工具，并使该贼活检定获得+2物品加值。</p>\n<p>若<em>万能钥匙</em>因检定大失败而破损，在修复前，它只能如同普通盗贼工具般使用，并失去其特殊益处。</p>\n<p><strong>启动——松开锁头</strong> <span class=\"action-glyph\">F</span>（操作）</p>\n<p><strong>频率</strong> 每小时一次</p>\n<p><strong>触发</strong> 你尝试开锁，但尚未掷骰</p>\n<hr>\n<p><strong>效果</strong> 钥匙对你正试图撬开的锁施放@UUID[Compendium.pf2e.spells-srd.Item.6Ot4N22t5tPD51BO]{敲击术}。</p>",
    "itemImage": "systems/pf2e/icons/equipment/held-items/skeleton-key.webp",
    "sourceFingerprint": "b2c2850745d657fbdb621692854a7ffa65aac2d23380dfe47b2429d0f435c7db",
    "expectedSource": {
      "img": "systems/pf2e/icons/equipment/held-items/skeleton-key.webp",
      "name": "高等万能钥匙 Skeleton Key (Greater)",
      "system": {
        "description": {
          "gm": "",
          "value": "<p>这把阴森钥匙的匙柄顶端饰有一颗咧嘴而笑的头骨。尝试开锁时，它可以代替盗贼工具，并使该贼活检定获得+2物品加值。</p>\n<p>若<em>万能钥匙</em>因检定大失败而破损，在修复前，它只能如同普通盗贼工具般使用，并失去其特殊益处。</p>\n<p><strong>启动——松开锁头</strong> <span class=\"action-glyph\">F</span>（操作）</p>\n<p><strong>频率</strong> 每小时一次</p>\n<p><strong>触发</strong> 你尝试开锁，但尚未掷骰</p>\n<hr>\n<p><strong>效果</strong> 钥匙对你正试图撬开的锁施放@UUID[Compendium.pf2e.spells-srd.Item.6Ot4N22t5tPD51BO]{敲击术}。</p>"
        },
        "rules": [
          {
            "key": "FlatModifier",
            "label": "Skeleton Key, Greater (Pick a Lock)",
            "predicate": [
              "action:pick-a-lock"
            ],
            "selector": "thievery",
            "type": "item",
            "value": 2
          }
        ],
        "slug": "skeleton-key-greater",
        "_migration": {
          "version": 0.959,
          "lastMigration": null,
          "previous": null
        },
        "traits": {
          "otherTags": [],
          "value": [
            "magical"
          ],
          "rarity": "common"
        },
        "publication": {
          "title": "Pathfinder主持人核心",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "level": {
          "value": 11
        },
        "quantity": 1,
        "baseItem": null,
        "bulk": {
          "value": 0
        },
        "hp": {
          "value": 0,
          "max": 0
        },
        "hardness": 0,
        "price": {
          "value": {
            "gp": 1250
          }
        },
        "equipped": {
          "carryType": "worn",
          "invested": null
        },
        "containerId": null,
        "size": "med",
        "material": {
          "type": null,
          "grade": null
        },
        "identification": {
          "status": "identified",
          "unidentified": {
            "name": "",
            "img": "",
            "data": {
              "description": {
                "value": ""
              }
            }
          }
        },
        "usage": {
          "value": "held-in-one-hand"
        },
        "subitems": []
      },
      "type": "equipment",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": "Compendium.pf2e.equipment-srd.Item.AFE073UYI0mkWuUs",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "sort": 0,
      "ownership": {
        "default": 0,
        "skBs48Uooc2qAhDD": 3
      },
      "flags": {},
      "_id": "9sAss5cc1FmTPDKe"
    },
    "rules": [
      {
        "index": 0,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "label": "Skeleton Key, Greater (Pick a Lock)",
          "predicate": [
            "action:pick-a-lock"
          ],
          "selector": "thievery",
          "type": "item",
          "value": 2
        },
        "sourceFingerprint": "4b48a67a4f6b8b5beedc6c6abb2b0004010ade2e112cb5eebe48c8705fe9d0b8",
        "fields": [
          {
            "path": "actors[250].items[0].system.rules[0].label",
            "before": "Skeleton Key, Greater (Pick a Lock)",
            "after": "高等万能钥匙（开锁）",
            "recordSha256": "13b2fdc8abb8d168a77b38783fcd22ab9fb2b88f226ef147dcdcac46290f48c2"
          }
        ]
      }
    ],
    "approvalFingerprint": "d1651c55b8b306d8fb05d191939c0a808786ab18bee453940874b0819d52197c"
  },
  {
    "key": "aEuFu2OCViPxG08f/xD3VAfvamgQTMsIJ",
    "sourcePath": "actors[305].items[49]",
    "actorId": "aEuFu2OCViPxG08f",
    "actorName": "凯德瑟里斯·阿鲁多拉 Caydserris Arudora",
    "actorType": "npc",
    "actorFolderId": "VC73YtnkRreiuDUy",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.aEuFu2OCViPxG08f",
    "itemId": "xD3VAfvamgQTMsIJ",
    "itemName": "查尔格的最终恩赐 Charg's Final Gift",
    "itemType": "action",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"RollOption\",\"option\":\"chargs-final-gift\",\"toggleable\":true,\"value\":false},{\"animation\":{\"transition\":\"morph\"},\"key\":\"TokenImage\",\"value\":\"modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/FleshwarpCaydserrisArudoraChargGift.webp\",\"ring\":{\"subject\":{\"texture\":\"modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/FleshwarpCaydserrisArudoraChargGift.webp\",\"scale\":2},\"colors\":{}},\"predicate\":[\"chargs-final-gift\"],\"scale\":2},{\"key\":\"BaseSpeed\",\"value\":25,\"selector\":\"land-speed\",\"predicate\":[{\"not\":\"chargs-final-gift\"}]},{\"attackModifier\":28,\"baseType\":\"claw\",\"damage\":{\"base\":{\"damageType\":\"slashing\",\"dice\":3,\"die\":\"d12\",\"modifier\":11}},\"key\":\"Strike\",\"label\":\"Fearful Claw\",\"predicate\":[\"chargs-final-gift\"],\"slug\":\"fearful-claw\",\"traits\":[\"agile\",\"magical\",\"reach-10\",\"unarmed\"]},{\"attackModifier\":28,\"baseType\":\"mace\",\"category\":\"simple\",\"damage\":{\"base\":{\"damageType\":\"bludgeoning\",\"dice\":3,\"die\":\"d6\",\"modifier\":11}},\"group\":\"club\",\"key\":\"Strike\",\"label\":\"PF2E.Weapon.Base.mace\",\"predicate\":[{\"not\":\"chargs-final-gift\"}],\"slug\":\"mace\",\"traits\":[\"magical\",\"shove\"]},{\"definition\":[\"item:id:{item|id}\",\"item:slug:mace\"],\"key\":\"AdjustStrike\",\"mode\":\"add\",\"property\":\"property-runes\",\"value\":\"shockwave\"},{\"definition\":[\"item:id:{item|id}\",\"item:slug:mace\"],\"key\":\"AdjustStrike\",\"mode\":\"add\",\"property\":\"property-runes\",\"value\":\"unholy\"}]",
    "itemBody": "<p>凯德瑟里斯的HP一降至0，便会狂喜地尖叫。他的头颅从身体上撕脱，身体倒地，血肉与骨骼组成的结构则从头颅周围向外延伸，将他变成一只可怖而独特的恐亡魔。他的头脸仍在，但不再位于类人生物躯体顶端，而是悬在一只由骨头与软骨组成的巨轮中央，由粗厚的内脏、肠道、血管与椎骨束带固定。巨轮边缘覆满血肉与硬毛，其上睁开眼睛与嘴巴，不断流泪，还伸出五条扭曲无皮的长臂，每条都以七指利爪作结。凯德瑟里斯的轮状身体悬在空中缓慢旋转，头颅却始终保持直立；连接头与轮的恐怖辐条不断撕开、重新附着，将头固定原位。60尺内所有PC都必须成功通过@Check[will|dc:33|options:area-effect,inflicts:frightened]豁免，否则陷入@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 1}（大失败时为@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 3}）；凯德瑟里斯恢复@Damage[100[healing]|immutable]{100 HP}。与此同时，弗洛琳的灵魂从凯德瑟里斯掉落的硬头锤中彻底挣脱，怒吼着升起，在他的新身体中来回穿梭。</p><p>在新形态中，凯德瑟里斯的@UUID[Compendium.pf2e.conditionitems.Item.zXZjC8HLaRoLR17U]{咒缚}状态提高至2（或使当前咒缚状态数值提高1）。他失去硬头锤打击，获得恐怖利爪打击。在此形态下，他不能施法，并失去基础速度（但不失去飞行速度）。如果他活下来，查尔格最终是否允许他恢复人类形态，由你决定。</p>",
    "itemImage": "systems/pf2e/icons/default-icons/action.svg",
    "sourceFingerprint": "79067d87f6e593468b04e354c049694c57f061196646c54ce4084cb7682f9c2b",
    "expectedSource": {
      "_id": "xD3VAfvamgQTMsIJ",
      "img": "systems/pf2e/icons/default-icons/action.svg",
      "name": "查尔格的最终恩赐 Charg's Final Gift",
      "sort": 5200000,
      "system": {
        "actionType": {
          "value": "passive"
        },
        "actions": {
          "value": null
        },
        "category": "defensive",
        "deathNote": true,
        "description": {
          "value": "<p>凯德瑟里斯的HP一降至0，便会狂喜地尖叫。他的头颅从身体上撕脱，身体倒地，血肉与骨骼组成的结构则从头颅周围向外延伸，将他变成一只可怖而独特的恐亡魔。他的头脸仍在，但不再位于类人生物躯体顶端，而是悬在一只由骨头与软骨组成的巨轮中央，由粗厚的内脏、肠道、血管与椎骨束带固定。巨轮边缘覆满血肉与硬毛，其上睁开眼睛与嘴巴，不断流泪，还伸出五条扭曲无皮的长臂，每条都以七指利爪作结。凯德瑟里斯的轮状身体悬在空中缓慢旋转，头颅却始终保持直立；连接头与轮的恐怖辐条不断撕开、重新附着，将头固定原位。60尺内所有PC都必须成功通过@Check[will|dc:33|options:area-effect,inflicts:frightened]豁免，否则陷入@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 1}（大失败时为@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 3}）；凯德瑟里斯恢复@Damage[100[healing]|immutable]{100 HP}。与此同时，弗洛琳的灵魂从凯德瑟里斯掉落的硬头锤中彻底挣脱，怒吼着升起，在他的新身体中来回穿梭。</p><p>在新形态中，凯德瑟里斯的@UUID[Compendium.pf2e.conditionitems.Item.zXZjC8HLaRoLR17U]{咒缚}状态提高至2（或使当前咒缚状态数值提高1）。他失去硬头锤打击，获得恐怖利爪打击。在此形态下，他不能施法，并失去基础速度（但不失去飞行速度）。如果他活下来，查尔格最终是否允许他恢复人类形态，由你决定。</p>",
          "gm": ""
        },
        "publication": {
          "license": "OGL",
          "remaster": false,
          "title": "",
          "authors": ""
        },
        "rules": [
          {
            "key": "RollOption",
            "option": "chargs-final-gift",
            "toggleable": true,
            "value": false
          },
          {
            "animation": {
              "transition": "morph"
            },
            "key": "TokenImage",
            "value": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/FleshwarpCaydserrisArudoraChargGift.webp",
            "ring": {
              "subject": {
                "texture": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/FleshwarpCaydserrisArudoraChargGift.webp",
                "scale": 2
              },
              "colors": {}
            },
            "predicate": [
              "chargs-final-gift"
            ],
            "scale": 2
          },
          {
            "key": "BaseSpeed",
            "value": 25,
            "selector": "land-speed",
            "predicate": [
              {
                "not": "chargs-final-gift"
              }
            ]
          },
          {
            "attackModifier": 28,
            "baseType": "claw",
            "damage": {
              "base": {
                "damageType": "slashing",
                "dice": 3,
                "die": "d12",
                "modifier": 11
              }
            },
            "key": "Strike",
            "label": "Fearful Claw",
            "predicate": [
              "chargs-final-gift"
            ],
            "slug": "fearful-claw",
            "traits": [
              "agile",
              "magical",
              "reach-10",
              "unarmed"
            ]
          },
          {
            "attackModifier": 28,
            "baseType": "mace",
            "category": "simple",
            "damage": {
              "base": {
                "damageType": "bludgeoning",
                "dice": 3,
                "die": "d6",
                "modifier": 11
              }
            },
            "group": "club",
            "key": "Strike",
            "label": "PF2E.Weapon.Base.mace",
            "predicate": [
              {
                "not": "chargs-final-gift"
              }
            ],
            "slug": "mace",
            "traits": [
              "magical",
              "shove"
            ]
          },
          {
            "definition": [
              "item:id:{item|id}",
              "item:slug:mace"
            ],
            "key": "AdjustStrike",
            "mode": "add",
            "property": "property-runes",
            "value": "shockwave"
          },
          {
            "definition": [
              "item:id:{item|id}",
              "item:slug:mace"
            ],
            "key": "AdjustStrike",
            "mode": "add",
            "property": "property-runes",
            "value": "unholy"
          }
        ],
        "slug": null,
        "traits": {
          "value": [],
          "otherTags": []
        },
        "_migration": {
          "version": 0.959,
          "previous": null
        }
      },
      "type": "action",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": null,
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "flags": {},
      "ownership": {
        "default": 0
      }
    },
    "rules": [
      {
        "index": 3,
        "key": "Strike",
        "source": {
          "attackModifier": 28,
          "baseType": "claw",
          "damage": {
            "base": {
              "damageType": "slashing",
              "dice": 3,
              "die": "d12",
              "modifier": 11
            }
          },
          "key": "Strike",
          "label": "Fearful Claw",
          "predicate": [
            "chargs-final-gift"
          ],
          "slug": "fearful-claw",
          "traits": [
            "agile",
            "magical",
            "reach-10",
            "unarmed"
          ]
        },
        "sourceFingerprint": "720d7bcc426db4936ba33beafb24cefd94d72ad65c3519e86e10d23b57666557",
        "fields": [
          {
            "path": "actors[305].items[49].system.rules[3].label",
            "before": "Fearful Claw",
            "after": "恐怖利爪",
            "recordSha256": "cc782a7e150807e69b798d0b0bb62eb1a6369d828e1350884e21e7cc3cadd0c4"
          }
        ]
      }
    ],
    "approvalFingerprint": "70b95902b2f1d2a0df4db3e08a165bf4359b5b6ea16e76de793d0c24064d4084"
  },
  {
    "key": "ZixxJrXEmD4voY9g/P4bAeteoTmGGiI3W",
    "sourcePath": "actors[321].items[5]",
    "actorId": "ZixxJrXEmD4voY9g",
    "actorName": "阿隆·莫迪穆斯 Aron Mordimus",
    "actorType": "npc",
    "actorFolderId": "h8uOhq5XwRdjsNhg",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.ZixxJrXEmD4voY9g",
    "itemId": "P4bAeteoTmGGiI3W",
    "itemName": "实体显现 Physical Manifestation",
    "itemType": "action",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"RollOption\",\"label\":\"PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label\",\"option\":\"support-rank\",\"selection\":\"1\",\"suboptions\":[{\"label\":\"PF2E.SpecificRule.Numbers.One\",\"value\":\"1\"},{\"label\":\"PF2E.SpecificRule.Numbers.Two\",\"value\":\"2\"},{\"label\":\"PF2E.SpecificRule.Numbers.Three\",\"value\":\"3\"}],\"toggleable\":true,\"value\":false},{\"key\":\"ActorTraits\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"remove\":[\"incorporeal\"]},{\"key\":\"Immunity\",\"mode\":\"remove\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"type\":[\"bleed\",\"disease\",\"paralyzed\",\"poison\",\"precision\"]},{\"doubleVs\":[\"non-magical\"],\"exceptions\":[\"force\",\"ghost-touch\",\"spirit\"],\"key\":\"Resistance\",\"predicate\":[{\"not\":\"support-rank\"}],\"type\":[\"all-damage\"],\"value\":5},{\"key\":\"BaseSpeed\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"selector\":\"land-speed\",\"value\":25},{\"key\":\"BaseSpeed\",\"predicate\":[{\"not\":\"support-rank\"}],\"selector\":\"fly-speed\",\"value\":25},{\"key\":\"ActiveEffectLike\",\"mode\":\"override\",\"path\":\"system.abilities.str.mod\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"value\":5},{\"key\":\"AdjustModifier\",\"mode\":\"upgrade\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"selector\":\"athletics\",\"slug\":\"base\",\"value\":8},{\"key\":\"AdjustModifier\",\"mode\":\"upgrade\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"selector\":\"ac\",\"slug\":\"base\",\"value\":11},{\"key\":\"FlatModifier\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"selector\":[\"hp\"],\"value\":20},{\"itemType\":\"action\",\"key\":\"ItemAlteration\",\"label\":\"PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label\",\"mode\":\"add\",\"predicate\":[\"item:slug:pour-elixir\",{\"not\":\"support-rank\"}],\"property\":\"description\",\"value\":[{\"text\":\"PF2E.NPCAbility.BastardhallPhantom.SupportRank.RequirementAddendum.RankOne\"}]}]",
    "itemBody": "<p>达到1阶时，阿隆显现出一具半实体身躯。他失去虚体特征、免疫、抗力和飞行速度，并获得25尺陆地速度。他的力量调整值为+0，运动调整值为+7，AC为21，HP为80，并获得倾倒灵药能力。其他数据不变。</p>",
    "itemImage": "systems/pf2e/icons/default-icons/action.svg",
    "sourceFingerprint": "92e779929902678a4a27ac6f3e41cf9b0d20b4c01b3c4c4b073d2c504dbb1b5b",
    "expectedSource": {
      "_id": "P4bAeteoTmGGiI3W",
      "img": "systems/pf2e/icons/default-icons/action.svg",
      "name": "实体显现 Physical Manifestation",
      "sort": 600000,
      "system": {
        "actionType": {
          "value": "passive"
        },
        "actions": {
          "value": null
        },
        "category": "defensive",
        "description": {
          "value": "<p>达到1阶时，阿隆显现出一具半实体身躯。他失去虚体特征、免疫、抗力和飞行速度，并获得25尺陆地速度。他的力量调整值为+0，运动调整值为+7，AC为21，HP为80，并获得倾倒灵药能力。其他数据不变。</p>",
          "gm": ""
        },
        "publication": {
          "license": "OGL",
          "remaster": false,
          "title": "",
          "authors": ""
        },
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
        "slug": null,
        "traits": {
          "value": [],
          "otherTags": []
        },
        "_migration": {
          "version": 0.959,
          "previous": null
        }
      },
      "type": "action",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": null,
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "flags": {},
      "ownership": {
        "default": 0
      }
    },
    "rules": [
      {
        "index": 10,
        "key": "ItemAlteration",
        "source": {
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
        },
        "sourceFingerprint": "4f834252e46214ebf22c710ff83a07f109999a13244821ed5c8a603fe8b8c2e1",
        "fields": [
          {
            "path": "actors[321].items[5].system.rules[10].label",
            "before": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
            "after": "援助等级",
            "recordSha256": "a6b409cdeff38d44806bd395e882df089698d58be5794452c03b3056d447a99d"
          },
          {
            "path": "actors[321].items[5].system.rules[10].value[0].text",
            "before": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.RequirementAddendum.RankOne",
            "after": "此能力需要援助等级1。",
            "recordSha256": "559b78fc7a23eb4f72602316a8d10d75878b12b47e97fb305ec520d14989d69e"
          }
        ]
      }
    ],
    "approvalFingerprint": "241a3763df56318b28e57f8a3b457bebe1d3e02362777319cb816c97f324bc5a"
  },
  {
    "key": "amsxeDlpOVfUTxbx/I0ZvKacL2AOWXtLO",
    "sourcePath": "actors[322].items[5]",
    "actorId": "amsxeDlpOVfUTxbx",
    "actorName": "奥斯肯·达斯特 Ausken Dast",
    "actorType": "npc",
    "actorFolderId": "h8uOhq5XwRdjsNhg",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.amsxeDlpOVfUTxbx",
    "itemId": "I0ZvKacL2AOWXtLO",
    "itemName": "实体显现 Physical Manifestation",
    "itemType": "action",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"RollOption\",\"label\":\"PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label\",\"option\":\"support-rank\",\"selection\":\"1\",\"suboptions\":[{\"label\":\"PF2E.SpecificRule.Numbers.One\",\"value\":\"1\"},{\"label\":\"PF2E.SpecificRule.Numbers.Two\",\"value\":\"2\"},{\"label\":\"PF2E.SpecificRule.Numbers.Three\",\"value\":\"3\"}],\"toggleable\":true},{\"key\":\"ActorTraits\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"remove\":[\"incorporeal\"]},{\"key\":\"Immunity\",\"mode\":\"remove\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"type\":[\"bleed\",\"disease\",\"paralyzed\",\"poison\",\"precision\"]},{\"doubleVs\":[\"non-magical\"],\"exceptions\":[\"force\",\"ghost-touch\",\"spirit\"],\"key\":\"Resistance\",\"predicate\":[{\"not\":\"support-rank\"}],\"type\":[\"all-damage\"],\"value\":5},{\"key\":\"BaseSpeed\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"selector\":\"land-speed\",\"value\":25},{\"key\":\"BaseSpeed\",\"predicate\":[{\"not\":\"support-rank\"}],\"selector\":\"fly-speed\",\"value\":25},{\"key\":\"ActiveEffectLike\",\"mode\":\"override\",\"path\":\"system.abilities.str.mod\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"value\":5},{\"key\":\"AdjustModifier\",\"mode\":\"upgrade\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"selector\":\"athletics\",\"slug\":\"base\",\"value\":12},{\"key\":\"AdjustModifier\",\"mode\":\"upgrade\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"selector\":\"ac\",\"slug\":\"base\",\"value\":12},{\"key\":\"FlatModifier\",\"predicate\":[{\"gte\":[\"support-rank\",1]}],\"selector\":[\"hp\"],\"value\":18},{\"itemType\":\"action\",\"key\":\"ItemAlteration\",\"label\":\"PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label\",\"mode\":\"add\",\"predicate\":[\"item:slug:sheriffs-blessing\",{\"not\":\"support-rank\"}],\"property\":\"description\",\"value\":[{\"text\":\"PF2E.NPCAbility.BastardhallPhantom.SupportRank.RequirementAddendum.RankOne\"}]}]",
    "itemBody": "<p>达到1阶时，奥斯肯显现出一具半实体身躯。他失去虚体特征、免疫、抗力和飞行速度，并获得25尺陆地速度。他的力量调整值为+5，运动调整值为+12，AC为22，HP为78，并能使用治安官的祝福。其他数据不变。</p>",
    "itemImage": "systems/pf2e/icons/default-icons/action.svg",
    "sourceFingerprint": "9b25402d9c166d92bfd579ae7a82ffd9665938a15624a1db821915cf522f6135",
    "expectedSource": {
      "_id": "I0ZvKacL2AOWXtLO",
      "img": "systems/pf2e/icons/default-icons/action.svg",
      "name": "实体显现 Physical Manifestation",
      "sort": 600000,
      "system": {
        "actionType": {
          "value": "passive"
        },
        "actions": {
          "value": null
        },
        "category": "defensive",
        "description": {
          "value": "<p>达到1阶时，奥斯肯显现出一具半实体身躯。他失去虚体特征、免疫、抗力和飞行速度，并获得25尺陆地速度。他的力量调整值为+5，运动调整值为+12，AC为22，HP为78，并能使用治安官的祝福。其他数据不变。</p>",
          "gm": ""
        },
        "publication": {
          "license": "OGL",
          "remaster": false,
          "title": "",
          "authors": ""
        },
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
        "slug": null,
        "traits": {
          "value": [],
          "otherTags": []
        },
        "_migration": {
          "version": 0.959,
          "previous": null
        }
      },
      "type": "action",
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "compendiumSource": null,
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "effects": [],
      "folder": null,
      "flags": {},
      "ownership": {
        "default": 0
      }
    },
    "rules": [
      {
        "index": 10,
        "key": "ItemAlteration",
        "source": {
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
        },
        "sourceFingerprint": "3f113e6e263f06e6b1d0bf5e66a67cf538754e0b55b00b68298b0568429db2ff",
        "fields": [
          {
            "path": "actors[322].items[5].system.rules[10].label",
            "before": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.Label",
            "after": "援助等级",
            "recordSha256": "ec5d05fdb7274a8105b5426d7801dc5949566544e0e92fefaf2b3c082395e16f"
          },
          {
            "path": "actors[322].items[5].system.rules[10].value[0].text",
            "before": "PF2E.NPCAbility.BastardhallPhantom.SupportRank.RequirementAddendum.RankOne",
            "after": "此能力需要援助等级1。",
            "recordSha256": "3056971b9dfef7171d852691942b8e3f41dbccd24a8f1eae8ebfdf8af7a2adb3"
          }
        ]
      }
    ],
    "approvalFingerprint": "4de91234043d0ebb540099355ef29f91fba23b5f441d5a0810f5d1c41a173aba"
  },
  {
    "key": "world/KAI0Cx2ys0P56hZw",
    "sourcePath": "items[27]",
    "actorId": null,
    "actorName": null,
    "actorType": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "KAI0Cx2ys0P56hZw",
    "itemName": "效果：头顶的天空（第4章） Effect: The Skies Above (Chapter 4)",
    "itemType": "effect",
    "itemFolderId": "n06cuNoUCKALKOw5",
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"ItemAlteration\",\"mode\":\"override\",\"property\":\"name\",\"value\":\"BASTION.RULES.TheSkiesAbove.EffectLabel\",\"itemId\":\"{item|id}\"},{\"key\":\"FlatModifier\",\"selector\":[\"perception\"],\"value\":-2,\"type\":\"circumstance\",\"predicate\":[\"item:trait:visual\"],\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"},{\"key\":\"Note\",\"predicate\":[{\"gte\":[\"target:distance\",50]}],\"title\":\"BASTION.RULES.TheSkiesAbove.Label\",\"selector\":[\"attack-roll\"],\"text\":\"BASTION.RULES.TheSkiesAbove.ChapterFour.Note\"}]",
    "itemBody": "<p>你基于视觉的察觉检定承受–2环境减值，雾气使50尺外的生物获得@UUID[Compendium.pf2e.conditionitems.Item.DmAIPqOBomZ7H95W]{隐蔽}。</p>",
    "itemImage": "icons/magic/air/weather-clouds.webp",
    "sourceFingerprint": "89da6ed0dbe402ca22187bec29dc548db422405d1515a0b1c4f360ac2af73976",
    "expectedSource": {
      "folder": "n06cuNoUCKALKOw5",
      "name": "效果：头顶的天空（第4章） Effect: The Skies Above (Chapter 4)",
      "type": "effect",
      "effects": [],
      "system": {
        "_migration": {
          "version": 0.959,
          "previous": null
        },
        "description": {
          "value": "<p>你基于视觉的察觉检定承受–2环境减值，雾气使50尺外的生物获得@UUID[Compendium.pf2e.conditionitems.Item.DmAIPqOBomZ7H95W]{隐蔽}。</p>",
          "gm": ""
        },
        "publication": {
          "title": "Pathfinder冒险之路：亵渎堡垒",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "rules": [
          {
            "key": "ItemAlteration",
            "mode": "override",
            "property": "name",
            "value": "BASTION.RULES.TheSkiesAbove.EffectLabel",
            "itemId": "{item|id}"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "perception"
            ],
            "value": -2,
            "type": "circumstance",
            "predicate": [
              "item:trait:visual"
            ],
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          },
          {
            "key": "Note",
            "predicate": [
              {
                "gte": [
                  "target:distance",
                  50
                ]
              }
            ],
            "title": "BASTION.RULES.TheSkiesAbove.Label",
            "selector": [
              "attack-roll"
            ],
            "text": "BASTION.RULES.TheSkiesAbove.ChapterFour.Note"
          }
        ],
        "slug": null,
        "traits": {
          "otherTags": [],
          "value": []
        },
        "level": {
          "value": 1
        },
        "duration": {
          "value": -1,
          "unit": "unlimited",
          "expiry": null,
          "sustained": false
        },
        "tokenIcon": {
          "show": false
        },
        "unidentified": true,
        "start": {
          "value": 0,
          "initiative": null
        },
        "badge": null,
        "fromSpell": false,
        "context": null
      },
      "img": "icons/magic/air/weather-clouds.webp",
      "sort": 100000,
      "ownership": {
        "default": 0
      },
      "flags": {},
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "compendiumSource": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "_id": "KAI0Cx2ys0P56hZw"
    },
    "rules": [
      {
        "index": 1,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "perception"
          ],
          "value": -2,
          "type": "circumstance",
          "predicate": [
            "item:trait:visual"
          ],
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "fbff3470b5150698941c59fa6cdd6b964453bc71f513ae403aec8f7753e9a9f2",
        "fields": [
          {
            "path": "items[27].system.rules[1].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "040375ecdb055848937dffd9169ee250f27b30fc98a8bf811f86293c17669b7f"
          }
        ]
      }
    ],
    "approvalFingerprint": "fecbd54ea083de719efd998d43c0de6196e54da5a20d3bd09ba099ed1ba3dd75"
  },
  {
    "key": "world/4azrweHGcJ1XoBqo",
    "sourcePath": "items[28]",
    "actorId": null,
    "actorName": null,
    "actorType": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "4azrweHGcJ1XoBqo",
    "itemName": "效果：头顶的天空（第5章） Effect: The Skies Above (Chapter 5)",
    "itemType": "effect",
    "itemFolderId": "n06cuNoUCKALKOw5",
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"ItemAlteration\",\"mode\":\"override\",\"property\":\"name\",\"value\":\"BASTION.RULES.TheSkiesAbove.EffectLabel\",\"itemId\":\"{item|id}\"},{\"key\":\"FlatModifier\",\"selector\":[\"perception\"],\"value\":-1,\"type\":\"circumstance\",\"predicate\":[\"item:trait:visual\"],\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"}]",
    "itemBody": "<p>你基于视觉的察觉检定承受–1环境减值。</p>",
    "itemImage": "icons/magic/air/weather-clouds.webp",
    "sourceFingerprint": "0796d614f7faf20c557d90ba45194e3c22733fc49e3b5e41a79572d2579808e8",
    "expectedSource": {
      "folder": "n06cuNoUCKALKOw5",
      "name": "效果：头顶的天空（第5章） Effect: The Skies Above (Chapter 5)",
      "type": "effect",
      "effects": [],
      "system": {
        "_migration": {
          "version": 0.959,
          "previous": null
        },
        "description": {
          "value": "<p>你基于视觉的察觉检定承受–1环境减值。</p>",
          "gm": ""
        },
        "publication": {
          "title": "Pathfinder冒险之路：亵渎堡垒",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "rules": [
          {
            "key": "ItemAlteration",
            "mode": "override",
            "property": "name",
            "value": "BASTION.RULES.TheSkiesAbove.EffectLabel",
            "itemId": "{item|id}"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "perception"
            ],
            "value": -1,
            "type": "circumstance",
            "predicate": [
              "item:trait:visual"
            ],
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          }
        ],
        "slug": null,
        "traits": {
          "otherTags": [],
          "value": []
        },
        "level": {
          "value": 1
        },
        "duration": {
          "value": -1,
          "unit": "unlimited",
          "expiry": null,
          "sustained": false
        },
        "tokenIcon": {
          "show": false
        },
        "unidentified": true,
        "start": {
          "value": 0,
          "initiative": null
        },
        "badge": null,
        "fromSpell": false,
        "context": null
      },
      "img": "icons/magic/air/weather-clouds.webp",
      "sort": 100000,
      "ownership": {
        "default": 0
      },
      "flags": {},
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "compendiumSource": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "_id": "4azrweHGcJ1XoBqo"
    },
    "rules": [
      {
        "index": 1,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "perception"
          ],
          "value": -1,
          "type": "circumstance",
          "predicate": [
            "item:trait:visual"
          ],
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "c9de0ce100e8d25eb717a5d902e4805b4b38f7da99b2cc18f851ef98c52810af",
        "fields": [
          {
            "path": "items[28].system.rules[1].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "30e7f41bb5517edec0c8c3bdc799b9ce7895149e4dfe94effe16c5032b70ec27"
          }
        ]
      }
    ],
    "approvalFingerprint": "869784876de30ab234991725ae7448295aaeab274d544237debccd80998192e9"
  },
  {
    "key": "world/9oiPR5aNEpQTzgfD",
    "sourcePath": "items[29]",
    "actorId": null,
    "actorName": null,
    "actorType": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "9oiPR5aNEpQTzgfD",
    "itemName": "效果：头顶的天空（第6章） Effect: The Skies Above (Chapter 6)",
    "itemType": "effect",
    "itemFolderId": "n06cuNoUCKALKOw5",
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"ItemAlteration\",\"mode\":\"override\",\"property\":\"name\",\"value\":\"BASTION.RULES.TheSkiesAbove.EffectLabel\",\"itemId\":\"{item|id}\"},{\"key\":\"FlatModifier\",\"selector\":[\"perception\"],\"value\":-2,\"type\":\"circumstance\",\"predicate\":[\"item:trait:visual\"],\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"},{\"key\":\"FlatModifier\",\"selector\":[\"ranged-strike-attack-roll\"],\"value\":-1,\"type\":\"circumstance\",\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"}]",
    "itemBody": "<p>你基于视觉的察觉检定承受–2环境减值，远程打击承受–1环境减值。</p>",
    "itemImage": "icons/magic/air/weather-clouds-rain.webp",
    "sourceFingerprint": "f8bbf0eae06c11eb44b25a90ad688cecba2af8c538f3e798a12f7745967012b6",
    "expectedSource": {
      "folder": "n06cuNoUCKALKOw5",
      "name": "效果：头顶的天空（第6章） Effect: The Skies Above (Chapter 6)",
      "type": "effect",
      "effects": [],
      "system": {
        "_migration": {
          "version": 0.959,
          "previous": null
        },
        "description": {
          "value": "<p>你基于视觉的察觉检定承受–2环境减值，远程打击承受–1环境减值。</p>",
          "gm": ""
        },
        "publication": {
          "title": "Pathfinder冒险之路：亵渎堡垒",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "rules": [
          {
            "key": "ItemAlteration",
            "mode": "override",
            "property": "name",
            "value": "BASTION.RULES.TheSkiesAbove.EffectLabel",
            "itemId": "{item|id}"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "perception"
            ],
            "value": -2,
            "type": "circumstance",
            "predicate": [
              "item:trait:visual"
            ],
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "ranged-strike-attack-roll"
            ],
            "value": -1,
            "type": "circumstance",
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          }
        ],
        "slug": null,
        "traits": {
          "otherTags": [],
          "value": []
        },
        "level": {
          "value": 1
        },
        "duration": {
          "value": -1,
          "unit": "unlimited",
          "expiry": null,
          "sustained": false
        },
        "tokenIcon": {
          "show": false
        },
        "unidentified": true,
        "start": {
          "value": 0,
          "initiative": null
        },
        "badge": null,
        "fromSpell": false,
        "context": null
      },
      "img": "icons/magic/air/weather-clouds-rain.webp",
      "sort": 200000,
      "ownership": {
        "default": 0
      },
      "flags": {},
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "compendiumSource": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "_id": "9oiPR5aNEpQTzgfD"
    },
    "rules": [
      {
        "index": 1,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "perception"
          ],
          "value": -2,
          "type": "circumstance",
          "predicate": [
            "item:trait:visual"
          ],
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "fbff3470b5150698941c59fa6cdd6b964453bc71f513ae403aec8f7753e9a9f2",
        "fields": [
          {
            "path": "items[29].system.rules[1].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "16d53a320aa9febf26578c719e4745ceaa34670bc0ea0b0e91a9222547be212d"
          }
        ]
      },
      {
        "index": 2,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "ranged-strike-attack-roll"
          ],
          "value": -1,
          "type": "circumstance",
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "44590ab3243573a8b72763031f6fd6898e277bad5475377a86febe0ca9703716",
        "fields": [
          {
            "path": "items[29].system.rules[2].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "3a535e5f1fe59f8e135d5987c4f4a412719a2e6f228974186f350f47bbdd81cd"
          }
        ]
      }
    ],
    "approvalFingerprint": "74bec8553af1578117d4b360aa55e6600fc76982e6e777eb2f61a15f51c67536"
  },
  {
    "key": "world/XVFJTwaE9P3H5IRk",
    "sourcePath": "items[30]",
    "actorId": null,
    "actorName": null,
    "actorType": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "XVFJTwaE9P3H5IRk",
    "itemName": "效果：上方天空（第7章） Effect: The Skies Above (Chapter 7)",
    "itemType": "effect",
    "itemFolderId": "n06cuNoUCKALKOw5",
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"ItemAlteration\",\"mode\":\"override\",\"property\":\"name\",\"value\":\"BASTION.RULES.TheSkiesAbove.EffectLabel\",\"itemId\":\"{item|id}\"},{\"key\":\"FlatModifier\",\"selector\":[\"perception\"],\"value\":-3,\"type\":\"circumstance\",\"predicate\":[\"item:trait:visual\"],\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"},{\"key\":\"FlatModifier\",\"selector\":[\"ranged-strike-attack-roll\"],\"value\":-2,\"type\":\"circumstance\",\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"}]",
    "itemBody": "<p>你基于视觉的察觉检定承受–3环境减值，远程打击承受–2环境减值。</p>",
    "itemImage": "icons/magic/air/weather-clouds-rain.webp",
    "sourceFingerprint": "0e8dfbb4a0925d2c4d4b64e078966f1917838a2e032f5df12547728b3fb46025",
    "expectedSource": {
      "folder": "n06cuNoUCKALKOw5",
      "name": "效果：上方天空（第7章） Effect: The Skies Above (Chapter 7)",
      "type": "effect",
      "effects": [],
      "system": {
        "_migration": {
          "version": 0.959,
          "previous": null
        },
        "description": {
          "value": "<p>你基于视觉的察觉检定承受–3环境减值，远程打击承受–2环境减值。</p>",
          "gm": ""
        },
        "publication": {
          "title": "Pathfinder冒险之路：亵渎堡垒",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "rules": [
          {
            "key": "ItemAlteration",
            "mode": "override",
            "property": "name",
            "value": "BASTION.RULES.TheSkiesAbove.EffectLabel",
            "itemId": "{item|id}"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "perception"
            ],
            "value": -3,
            "type": "circumstance",
            "predicate": [
              "item:trait:visual"
            ],
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "ranged-strike-attack-roll"
            ],
            "value": -2,
            "type": "circumstance",
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          }
        ],
        "slug": null,
        "traits": {
          "otherTags": [],
          "value": []
        },
        "level": {
          "value": 1
        },
        "duration": {
          "value": -1,
          "unit": "unlimited",
          "expiry": null,
          "sustained": false
        },
        "tokenIcon": {
          "show": false
        },
        "unidentified": true,
        "start": {
          "value": 0,
          "initiative": null
        },
        "badge": null,
        "fromSpell": false,
        "context": null
      },
      "_id": "XVFJTwaE9P3H5IRk",
      "img": "icons/magic/air/weather-clouds-rain.webp",
      "sort": 400000,
      "ownership": {
        "default": 0
      },
      "flags": {},
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "compendiumSource": null,
        "duplicateSource": null,
        "exportSource": null
      }
    },
    "rules": [
      {
        "index": 1,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "perception"
          ],
          "value": -3,
          "type": "circumstance",
          "predicate": [
            "item:trait:visual"
          ],
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "231ffcc9dfcd6c046beed46436dc8585f19bcc596d8377accfc8cc36299a9a2a",
        "fields": [
          {
            "path": "items[30].system.rules[1].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "eddf4cb28ce0d4c4e91d108c4669dd495fe67a54e1f033190f6b54eca377307e"
          }
        ]
      },
      {
        "index": 2,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "ranged-strike-attack-roll"
          ],
          "value": -2,
          "type": "circumstance",
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "f01e20001e801dc3cb53500abdb95fd92acbceda114e539fd73e1e86e3122bd8",
        "fields": [
          {
            "path": "items[30].system.rules[2].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "94c051729e30aaebf7d417bfc1479b42a3543613f31c30a11c5516fb309bdd20"
          }
        ]
      }
    ],
    "approvalFingerprint": "cc440652fc13357081781323b4993f1fa45a83d12de3a17e9d0ec07cadc63628"
  },
  {
    "key": "world/DGrF0tPpGZcNNQUN",
    "sourcePath": "items[31]",
    "actorId": null,
    "actorName": null,
    "actorType": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "DGrF0tPpGZcNNQUN",
    "itemName": "效果：头顶的天空（第8章） Effect: The Skies Above (Chapter 8)",
    "itemType": "effect",
    "itemFolderId": "n06cuNoUCKALKOw5",
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"ItemAlteration\",\"mode\":\"override\",\"property\":\"name\",\"value\":\"BASTION.RULES.TheSkiesAbove.EffectLabel\",\"itemId\":\"{item|id}\"},{\"key\":\"FlatModifier\",\"selector\":[\"perception\"],\"value\":-3,\"type\":\"circumstance\",\"predicate\":[\"item:trait:visual\"],\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"},{\"key\":\"FlatModifier\",\"selector\":[\"ranged-strike-attack-roll\"],\"value\":-3,\"type\":\"circumstance\",\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"}]",
    "itemBody": "<p>你基于视觉的察觉检定与远程打击承受–3环境减值。</p>",
    "itemImage": "icons/magic/lightning/bolt-cloud-sky-green.webp",
    "sourceFingerprint": "d9ef1649b07db407e2a8cc4a66c544be52796f97df6a3d0951e610068d3cbc52",
    "expectedSource": {
      "folder": "n06cuNoUCKALKOw5",
      "name": "效果：头顶的天空（第8章） Effect: The Skies Above (Chapter 8)",
      "type": "effect",
      "effects": [],
      "system": {
        "_migration": {
          "version": 0.959,
          "previous": null
        },
        "description": {
          "value": "<p>你基于视觉的察觉检定与远程打击承受–3环境减值。</p>",
          "gm": ""
        },
        "publication": {
          "title": "Pathfinder冒险之路：亵渎堡垒",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "rules": [
          {
            "key": "ItemAlteration",
            "mode": "override",
            "property": "name",
            "value": "BASTION.RULES.TheSkiesAbove.EffectLabel",
            "itemId": "{item|id}"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "perception"
            ],
            "value": -3,
            "type": "circumstance",
            "predicate": [
              "item:trait:visual"
            ],
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "ranged-strike-attack-roll"
            ],
            "value": -3,
            "type": "circumstance",
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          }
        ],
        "slug": null,
        "traits": {
          "otherTags": [],
          "value": []
        },
        "level": {
          "value": 1
        },
        "duration": {
          "value": -1,
          "unit": "unlimited",
          "expiry": null,
          "sustained": false
        },
        "tokenIcon": {
          "show": false
        },
        "unidentified": true,
        "start": {
          "value": 0,
          "initiative": null
        },
        "badge": null,
        "fromSpell": false,
        "context": null
      },
      "img": "icons/magic/lightning/bolt-cloud-sky-green.webp",
      "sort": 300000,
      "ownership": {
        "default": 0
      },
      "flags": {},
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "compendiumSource": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "_id": "DGrF0tPpGZcNNQUN"
    },
    "rules": [
      {
        "index": 1,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "perception"
          ],
          "value": -3,
          "type": "circumstance",
          "predicate": [
            "item:trait:visual"
          ],
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "231ffcc9dfcd6c046beed46436dc8585f19bcc596d8377accfc8cc36299a9a2a",
        "fields": [
          {
            "path": "items[31].system.rules[1].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "c9df3e534a2a3c153638aa1019bf1e56d55447b076c235338903acdd2526ba70"
          }
        ]
      },
      {
        "index": 2,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "ranged-strike-attack-roll"
          ],
          "value": -3,
          "type": "circumstance",
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "5603cb56416dfd9737c1a770a28cf149857f9822091259377e6e7aeab078a85a",
        "fields": [
          {
            "path": "items[31].system.rules[2].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "f1fc98fdd6cc3e79837a145d9acc2b9b65e5330675dcab2329e7eb7d8d85e34a"
          }
        ]
      }
    ],
    "approvalFingerprint": "82cb90289a7f23f602522deb4f24f680377798323cefe029e09802ec80834664"
  },
  {
    "key": "world/lff614VwbcqbXxtO",
    "sourcePath": "items[32]",
    "actorId": null,
    "actorName": null,
    "actorType": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "lff614VwbcqbXxtO",
    "itemName": "效果：头顶的天空（第9章） Effect: The Skies Above (Chapter 9)",
    "itemType": "effect",
    "itemFolderId": "n06cuNoUCKALKOw5",
    "itemSourceUuid": null,
    "itemSlug": null,
    "itemRulesJSON": "[{\"key\":\"ItemAlteration\",\"mode\":\"override\",\"property\":\"name\",\"value\":\"BASTION.RULES.TheSkiesAbove.EffectLabel\",\"itemId\":\"{item|id}\"},{\"key\":\"FlatModifier\",\"selector\":[\"perception\"],\"value\":-4,\"type\":\"circumstance\",\"predicate\":[\"item:trait:visual\"],\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"},{\"key\":\"FlatModifier\",\"selector\":[\"ranged-strike-attack-roll\"],\"value\":-4,\"type\":\"circumstance\",\"label\":\"BASTION.RULES.TheSkiesAbove.Label\"}]",
    "itemBody": "<p>你基于视觉的察觉检定与远程打击承受–3环境减值。</p>",
    "itemImage": "icons/magic/lightning/bolt-cloud-sky-green.webp",
    "sourceFingerprint": "68ae6fd1d304eaa5426d6307197176046e0a5c106b8911dc27ef86f2fd67c4f2",
    "expectedSource": {
      "folder": "n06cuNoUCKALKOw5",
      "name": "效果：头顶的天空（第9章） Effect: The Skies Above (Chapter 9)",
      "type": "effect",
      "effects": [],
      "system": {
        "_migration": {
          "version": 0.959,
          "previous": null
        },
        "description": {
          "value": "<p>你基于视觉的察觉检定与远程打击承受–3环境减值。</p>",
          "gm": ""
        },
        "publication": {
          "title": "Pathfinder冒险之路：亵渎堡垒",
          "authors": "",
          "license": "ORC",
          "remaster": true
        },
        "rules": [
          {
            "key": "ItemAlteration",
            "mode": "override",
            "property": "name",
            "value": "BASTION.RULES.TheSkiesAbove.EffectLabel",
            "itemId": "{item|id}"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "perception"
            ],
            "value": -4,
            "type": "circumstance",
            "predicate": [
              "item:trait:visual"
            ],
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          },
          {
            "key": "FlatModifier",
            "selector": [
              "ranged-strike-attack-roll"
            ],
            "value": -4,
            "type": "circumstance",
            "label": "BASTION.RULES.TheSkiesAbove.Label"
          }
        ],
        "slug": null,
        "traits": {
          "otherTags": [],
          "value": []
        },
        "level": {
          "value": 1
        },
        "duration": {
          "value": -1,
          "unit": "unlimited",
          "expiry": null,
          "sustained": false
        },
        "tokenIcon": {
          "show": false
        },
        "unidentified": true,
        "start": {
          "value": 0,
          "initiative": null
        },
        "badge": null,
        "fromSpell": false,
        "context": null
      },
      "img": "icons/magic/lightning/bolt-cloud-sky-green.webp",
      "sort": 500000,
      "ownership": {
        "default": 0
      },
      "flags": {},
      "_stats": {
        "coreVersion": "14.368",
        "systemId": "pf2e",
        "systemVersion": "8.5.1",
        "createdTime": null,
        "modifiedTime": null,
        "lastModifiedBy": null,
        "compendiumSource": null,
        "duplicateSource": null,
        "exportSource": null
      },
      "_id": "lff614VwbcqbXxtO"
    },
    "rules": [
      {
        "index": 1,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "perception"
          ],
          "value": -4,
          "type": "circumstance",
          "predicate": [
            "item:trait:visual"
          ],
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "1cfdd38b81da27e24fcd79f883cdbd6136183926ee930d5a61aa2264a5ba2584",
        "fields": [
          {
            "path": "items[32].system.rules[1].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "861afa7556d097876dc696626b10818063389aa09345dfd7af4377537fdee0ee"
          }
        ]
      },
      {
        "index": 2,
        "key": "FlatModifier",
        "source": {
          "key": "FlatModifier",
          "selector": [
            "ranged-strike-attack-roll"
          ],
          "value": -4,
          "type": "circumstance",
          "label": "BASTION.RULES.TheSkiesAbove.Label"
        },
        "sourceFingerprint": "4851e657c971caec04153cb2b930936bc24db91b4597a35a3e15d59c572727ff",
        "fields": [
          {
            "path": "items[32].system.rules[2].label",
            "before": "BASTION.RULES.TheSkiesAbove.Label",
            "after": "头顶的天空",
            "recordSha256": "bef943c1d240b33512f048487ee9821706382894d5e1f0f464548be30bc2762a"
          }
        ]
      }
    ],
    "approvalFingerprint": "2970bc367051cda1a4ef8d98fd314736e17499d1e017e9b793821007472666ce"
  }
];
export const RULE_DISPLAY_SYNTHETIC_BINDINGS = [
  {
    "sceneId": "z8wkbcziQufR7jWG",
    "tokenId": "39eAW1oFEFJBezok",
    "actorId": "l5relJ9F1Ko1dpOB",
    "sceneName": "阿鲁多拉岛 Arudora Isle",
    "tokenName": "伊尔维斯·蒙丹 Ilves Mondain",
    "sceneProjection": {
      "_id": "z8wkbcziQufR7jWG",
      "folder": "zW1wwVPuezvJOakv",
      "backgroundSrc": null,
      "width": 36000,
      "height": 48000
    },
    "tokenProjection": {
      "_id": "39eAW1oFEFJBezok",
      "actorId": "l5relJ9F1Ko1dpOB",
      "actorLink": false,
      "textureSrc": "modules/pf2e-bastion-of-blasphemies/assets/actors/tokens/BloodPainter.webp"
    },
    "deltaSource": {
      "_id": "39eAW1oFEFJBezok",
      "name": null,
      "type": null,
      "img": null,
      "system": {},
      "items": [],
      "effects": [],
      "ownership": null,
      "flags": {}
    },
    "rawToken": {
      "name": "Ilves Mondain",
      "displayName": 20,
      "actorLink": false,
      "width": 2,
      "height": 2,
      "depth": 2,
      "texture": {
        "src": "modules/pf2e-bastion-of-blasphemies/assets/actors/tokens/BloodPainter.webp",
        "anchorX": 0.5,
        "anchorY": 0.5,
        "fit": "contain",
        "scaleX": 1,
        "scaleY": 1,
        "tint": "#ffffff",
        "alphaThreshold": 0.75
      },
      "lockRotation": false,
      "rotation": 0,
      "alpha": 1,
      "disposition": -1,
      "displayBars": 20,
      "bar1": {
        "attribute": "attributes.hp"
      },
      "bar2": {
        "attribute": null
      },
      "light": {
        "negative": false,
        "priority": 0,
        "alpha": 0.5,
        "angle": 360,
        "bright": 0,
        "color": null,
        "coloration": 1,
        "dim": 0,
        "attenuation": 0.5,
        "luminosity": 0.5,
        "saturation": 0,
        "contrast": 0,
        "shadows": 0,
        "animation": {
          "type": null,
          "speed": 5,
          "intensity": 5,
          "reverse": false
        },
        "darkness": {
          "min": 0,
          "max": 1
        }
      },
      "sight": {
        "enabled": false,
        "range": 0,
        "angle": 360,
        "visionMode": "basic",
        "color": null,
        "attenuation": 0.1,
        "brightness": 0,
        "saturation": 0,
        "contrast": 0
      },
      "detectionModes": {},
      "occludable": {
        "radius": 0
      },
      "ring": {
        "enabled": true,
        "colors": {
          "ring": null,
          "background": null
        },
        "effects": 1,
        "subject": {
          "scale": 1,
          "texture": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/BloodPainter.webp"
        }
      },
      "turnMarker": {
        "mode": 1,
        "animation": null,
        "src": null,
        "disposition": false
      },
      "movementAction": null,
      "flags": {
        "pf2e": {
          "linkToActorSize": true,
          "autoscale": true
        }
      },
      "actorId": "l5relJ9F1Ko1dpOB",
      "hidden": true,
      "sort": 116,
      "shape": 4,
      "level": "CXRZgXjmprI1vHVo",
      "_id": "39eAW1oFEFJBezok",
      "delta": null,
      "x": 18400,
      "y": 33800,
      "elevation": 130,
      "locked": false,
      "_movementHistory": [],
      "_regions": [
        "X4F2ZQEuPZ6qj2ve",
        "ujB2iCU3mT47pbu6"
      ]
    },
    "boundItemIds": [
      "oX5mS0nonoT9j23k"
    ]
  },
  {
    "sceneId": "z8wkbcziQufR7jWG",
    "tokenId": "lyC5GybvlSlmAUMM",
    "actorId": "KgJq51AeYrENo3Db",
    "sceneName": "阿鲁多拉岛 Arudora Isle",
    "tokenName": "鬼火 Will-o'-Wisp",
    "sceneProjection": {
      "_id": "z8wkbcziQufR7jWG",
      "folder": "zW1wwVPuezvJOakv",
      "backgroundSrc": null,
      "width": 36000,
      "height": 48000
    },
    "tokenProjection": {
      "_id": "lyC5GybvlSlmAUMM",
      "actorId": "KgJq51AeYrENo3Db",
      "actorLink": false,
      "textureSrc": "modules/pf2e-bastion-of-blasphemies/assets/actors/tokens/WillOWisp.webp"
    },
    "deltaSource": {
      "_id": "lyC5GybvlSlmAUMM",
      "name": null,
      "type": null,
      "img": null,
      "system": {},
      "items": [
        {
          "_id": "USCoVo5LJNs12zB4",
          "img": "systems/pf2e/icons/actions/OneAction.webp",
          "name": "变暗 Go Dark",
          "sort": 500000,
          "system": {
            "actionType": {
              "value": "action"
            },
            "actions": {
              "value": 1
            },
            "category": "offensive",
            "description": {
              "value": "<p>鬼火熄灭自身的光芒，变得@UUID[Compendium.pf2e.conditionitems.Item.zJxUflt9np0q4yML]{隐形}。它可以再次使用此动作来结束效果。如果它在隐形时使用放电攻击，电弧会让任何观察者确定它的位置，使鬼火对所有观察者而言仅处于@UUID[Compendium.pf2e.conditionitems.Item.iU0fEDdBp3rXpTMC]{藏匿}状态，直到它移动。</p>",
              "gm": ""
            },
            "publication": {
              "license": "ORC",
              "remaster": true,
              "title": "Pathfinder怪物核心",
              "authors": ""
            },
            "rules": [
              {
                "key": "RollOption",
                "option": "go-dark",
                "suboptions": [
                  {
                    "label": "PF2E.ConditionTypeInvisible",
                    "value": "Compendium.pf2e.conditionitems.Item.zJxUflt9np0q4yML"
                  },
                  {
                    "label": "PF2E.ConditionTypeHidden",
                    "value": "Compendium.pf2e.conditionitems.Item.iU0fEDdBp3rXpTMC"
                  }
                ],
                "toggleable": true,
                "value": true,
                "selection": "Compendium.pf2e.conditionitems.Item.zJxUflt9np0q4yML"
              },
              {
                "inMemoryOnly": true,
                "key": "GrantItem",
                "predicate": [
                  "go-dark"
                ],
                "uuid": "{item|flags.system.rulesSelections.goDark}"
              }
            ],
            "slug": null,
            "traits": {
              "value": [
                "concentrate"
              ],
              "otherTags": []
            },
            "_migration": {
              "version": 0.959,
              "previous": null
            }
          },
          "type": "action",
          "_stats": {
            "coreVersion": "14.368",
            "systemId": "pf2e",
            "systemVersion": "8.5.1",
            "compendiumSource": null,
            "createdTime": null,
            "modifiedTime": null,
            "lastModifiedBy": null,
            "duplicateSource": null,
            "exportSource": null
          },
          "effects": [],
          "folder": null,
          "flags": {},
          "ownership": {
            "default": 0
          }
        }
      ],
      "effects": [],
      "ownership": null,
      "flags": {}
    },
    "rawToken": {
      "name": "Will-o'-Wisp",
      "displayName": 20,
      "actorLink": false,
      "width": 1,
      "height": 1,
      "depth": 1,
      "texture": {
        "src": "modules/pf2e-bastion-of-blasphemies/assets/actors/tokens/WillOWisp.webp",
        "anchorX": 0.5,
        "anchorY": 0.5,
        "fit": "contain",
        "scaleX": 0.8,
        "scaleY": 0.8,
        "tint": "#ffffff",
        "alphaThreshold": 0.75
      },
      "lockRotation": false,
      "rotation": 0,
      "alpha": 1,
      "disposition": -1,
      "displayBars": 20,
      "bar1": {
        "attribute": "attributes.hp"
      },
      "bar2": {
        "attribute": null
      },
      "light": {
        "negative": false,
        "priority": 0,
        "alpha": 0.5,
        "angle": 360,
        "bright": 0,
        "color": null,
        "coloration": 1,
        "dim": 0,
        "attenuation": 0.5,
        "luminosity": 0.5,
        "saturation": 0,
        "contrast": 0,
        "shadows": 0,
        "animation": {
          "type": null,
          "speed": 5,
          "intensity": 5,
          "reverse": false
        },
        "darkness": {
          "min": 0,
          "max": 1
        }
      },
      "sight": {
        "enabled": false,
        "range": 0,
        "angle": 360,
        "visionMode": "basic",
        "color": null,
        "attenuation": 0.1,
        "brightness": 0,
        "saturation": 0,
        "contrast": 0
      },
      "detectionModes": {},
      "occludable": {
        "radius": 0
      },
      "ring": {
        "enabled": true,
        "colors": {
          "ring": null,
          "background": null
        },
        "effects": 1,
        "subject": {
          "scale": 1,
          "texture": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/WillOWisp.webp"
        }
      },
      "turnMarker": {
        "mode": 1,
        "animation": null,
        "src": null,
        "disposition": false
      },
      "movementAction": null,
      "flags": {
        "pf2e": {
          "linkToActorSize": true,
          "autoscale": true
        }
      },
      "actorId": "KgJq51AeYrENo3Db",
      "hidden": true,
      "sort": 422,
      "shape": 4,
      "level": "q8nusCYibR3bkwuq",
      "_id": "lyC5GybvlSlmAUMM",
      "delta": {
        "_id": "lyC5GybvlSlmAUMM",
        "name": null,
        "type": null,
        "img": null,
        "system": {},
        "items": [
          {
            "_id": "USCoVo5LJNs12zB4",
            "img": "systems/pf2e/icons/actions/OneAction.webp",
            "name": "Go Dark",
            "sort": 500000,
            "system": {
              "actionType": {
                "value": "action"
              },
              "actions": {
                "value": 1
              },
              "category": "offensive",
              "description": {
                "value": "<p>The will-o'-wisp extinguishes its glow, becoming @UUID[Compendium.pf2e.conditionitems.Item.zJxUflt9np0q4yML]{Invisible}. It can end this effect with another use of this action. If it uses its shock attack while invisible, the arc of electricity lets any observer determine its location, making the will-o'-wisp only @UUID[Compendium.pf2e.conditionitems.Item.iU0fEDdBp3rXpTMC]{Hidden} to all observers until it moves.</p>",
                "gm": ""
              },
              "publication": {
                "license": "ORC",
                "remaster": true,
                "title": "Pathfinder Monster Core",
                "authors": ""
              },
              "rules": [
                {
                  "key": "RollOption",
                  "option": "go-dark",
                  "suboptions": [
                    {
                      "label": "PF2E.ConditionTypeInvisible",
                      "value": "Compendium.pf2e.conditionitems.Item.zJxUflt9np0q4yML"
                    },
                    {
                      "label": "PF2E.ConditionTypeHidden",
                      "value": "Compendium.pf2e.conditionitems.Item.iU0fEDdBp3rXpTMC"
                    }
                  ],
                  "toggleable": true,
                  "value": true,
                  "selection": "Compendium.pf2e.conditionitems.Item.zJxUflt9np0q4yML"
                },
                {
                  "inMemoryOnly": true,
                  "key": "GrantItem",
                  "predicate": [
                    "go-dark"
                  ],
                  "uuid": "{item|flags.system.rulesSelections.goDark}"
                }
              ],
              "slug": null,
              "traits": {
                "value": [
                  "concentrate"
                ],
                "otherTags": []
              },
              "_migration": {
                "version": 0.959,
                "previous": null
              }
            },
            "type": "action",
            "_stats": {
              "coreVersion": "14.368",
              "systemId": "pf2e",
              "systemVersion": "8.5.1",
              "compendiumSource": null,
              "createdTime": null,
              "modifiedTime": null,
              "lastModifiedBy": null,
              "duplicateSource": null,
              "exportSource": null
            },
            "effects": [],
            "folder": null,
            "flags": {},
            "ownership": {
              "default": 0
            }
          }
        ],
        "effects": [],
        "ownership": null,
        "flags": {}
      },
      "x": 21400,
      "y": 22200,
      "elevation": 150,
      "locked": false,
      "_movementHistory": [],
      "_regions": [
        "3yKrdXJNE2CxKs9E",
        "gKXZUI0L67RfgWKV"
      ]
    },
    "boundItemIds": [
      "3Eksrmh390T4SrP7"
    ]
  },
  {
    "sceneId": "z8wkbcziQufR7jWG",
    "tokenId": "nsMVZs4GHxwwQ0kn",
    "actorId": "KgJq51AeYrENo3Db",
    "sceneName": "阿鲁多拉岛 Arudora Isle",
    "tokenName": "鬼火 Will-o'-Wisp",
    "sceneProjection": {
      "_id": "z8wkbcziQufR7jWG",
      "folder": "zW1wwVPuezvJOakv",
      "backgroundSrc": null,
      "width": 36000,
      "height": 48000
    },
    "tokenProjection": {
      "_id": "nsMVZs4GHxwwQ0kn",
      "actorId": "KgJq51AeYrENo3Db",
      "actorLink": false,
      "textureSrc": "modules/pf2e-bastion-of-blasphemies/assets/actors/tokens/WillOWisp.webp"
    },
    "deltaSource": {
      "_id": "nsMVZs4GHxwwQ0kn",
      "name": null,
      "type": null,
      "img": null,
      "system": {},
      "items": [],
      "effects": [],
      "ownership": null,
      "flags": {}
    },
    "rawToken": {
      "name": "Will-o'-Wisp",
      "displayName": 20,
      "actorLink": false,
      "width": 1,
      "height": 1,
      "depth": 1,
      "texture": {
        "src": "modules/pf2e-bastion-of-blasphemies/assets/actors/tokens/WillOWisp.webp",
        "anchorX": 0.5,
        "anchorY": 0.5,
        "fit": "contain",
        "scaleX": 0.8,
        "scaleY": 0.8,
        "tint": "#ffffff",
        "alphaThreshold": 0.75
      },
      "lockRotation": false,
      "rotation": 0,
      "alpha": 1,
      "disposition": -1,
      "displayBars": 20,
      "bar1": {
        "attribute": "attributes.hp"
      },
      "bar2": {
        "attribute": null
      },
      "light": {
        "negative": false,
        "priority": 0,
        "alpha": 0.5,
        "angle": 360,
        "bright": 0,
        "color": null,
        "coloration": 1,
        "dim": 0,
        "attenuation": 0.5,
        "luminosity": 0.5,
        "saturation": 0,
        "contrast": 0,
        "shadows": 0,
        "animation": {
          "type": null,
          "speed": 5,
          "intensity": 5,
          "reverse": false
        },
        "darkness": {
          "min": 0,
          "max": 1
        }
      },
      "sight": {
        "enabled": false,
        "range": 0,
        "angle": 360,
        "visionMode": "basic",
        "color": null,
        "attenuation": 0.1,
        "brightness": 0,
        "saturation": 0,
        "contrast": 0
      },
      "detectionModes": {},
      "occludable": {
        "radius": 0
      },
      "ring": {
        "enabled": true,
        "colors": {
          "ring": null,
          "background": null
        },
        "effects": 1,
        "subject": {
          "scale": 1,
          "texture": "modules/pf2e-bastion-of-blasphemies/assets/actors/subjects/WillOWisp.webp"
        }
      },
      "turnMarker": {
        "mode": 1,
        "animation": null,
        "src": null,
        "disposition": false
      },
      "movementAction": null,
      "flags": {
        "pf2e": {
          "linkToActorSize": true,
          "autoscale": true
        }
      },
      "actorId": "KgJq51AeYrENo3Db",
      "hidden": true,
      "sort": 422,
      "shape": 4,
      "level": "q8nusCYibR3bkwuq",
      "delta": null,
      "x": 22000,
      "y": 23000,
      "elevation": 150,
      "locked": false,
      "_movementHistory": [],
      "_regions": [
        "3yKrdXJNE2CxKs9E",
        "gKXZUI0L67RfgWKV"
      ],
      "_id": "nsMVZs4GHxwwQ0kn"
    },
    "boundItemIds": [
      "3Eksrmh390T4SrP7"
    ]
  }
];
