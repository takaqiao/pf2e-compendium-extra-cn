// Generated from exact reviewed Note fields. Rules and serialized notes remain native.
export const BOB_APPROVED_NOTE_DISPLAYS = [
  {
    "path": "actors[15].items[9].system.rules[2]",
    "scope": "actorItem",
    "actorId": "Gva6GAH3WjjRi8Wd",
    "actorType": "npc",
    "actorName": "伦布尔斯·沃西 Rembles Worthy",
    "actorFolderId": "cGe8iQTsYWPjF3s7",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.Gva6GAH3WjjRi8Wd",
    "itemId": "shEp3scXXBxti42q",
    "itemType": "action",
    "itemName": "变形 Change Shape",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.bestiary-ability-glossary-srd.Item.eQM5hQ1W3d1uen97",
    "itemSlug": "change-shape",
    "description": "<p>犬魔可以变成类人生物、犬或自身的真实形态。其体型变为与新形态相符。处于类人生物形态时，其爪击打击造成钝击伤害，且失去颚咬打击。处于犬形态时，其速度变为35尺。每只犬魔都只有一种类人生物形态与一种犬形态。</p>\n<hr>\n<p>@Localize[PF2E.NPC.Abilities.Glossary.ChangeShape]</p>",
    "descriptionGM": "",
    "ruleIndex": 2,
    "sourceRule": {
      "key": "Note",
      "selector": "jaws-damage",
      "text": "@Localize[PF2E.NPC.Abilities.Glossary.Knockdown]",
      "title": "Knockdown",
      "visibility": "owner"
    },
    "sourceRuleSha256": "424f00664bff88c6a699a507ad7a7aa09d501f243eb1d39b896759c6a2cacfac",
    "approved": true,
    "display": {
      "text": "<p><strong>需求</strong>怪物的最后的动作是一次命中的打击，在其伤害条目中列有“击倒”。</p><hr /><p><strong>效果</strong> 怪物尝试[[/act trip]]生物。该尝试不适用也不累计怪物的多重攻击减值。</p>",
      "title": "击倒"
    },
    "approvalHashes": {
      "text": "d2ffc90c3bcb67c497ee229766129efd9efabb4754807b3989b3316a51759c54",
      "title": "d8f3db24d8377d6923bbd3bebc36480501c143a1c8122c324142ca87cf1694de"
    },
    "markerIdentity": null,
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "06fc18694e61b4f3ba6d25acfbbe96da353f25ece7a09f1d5dce9b9d29302982",
      "actorName": "88033a5eaa9b99042ce277255e83b0332e683f6f145b6a92b2ec48c564081c36",
      "description": "26c30e0e4c0463b41b6b2a2db59820206dbe7f6ab70aedfc77ec100ae04352f6"
    }
  },
  {
    "path": "actors[27].items[1].system.rules[0]",
    "scope": "actorItem",
    "actorId": "yFYGXylGKUFThcco",
    "actorType": "loot",
    "actorName": "壁炉 Fireplace",
    "actorFolderId": "v9Bx0WGZTDTkJI4h",
    "actorSourceUuid": null,
    "itemId": "wWtKhUK50qPDuAvH",
    "itemType": "ammo",
    "itemName": "闪光弹药 Shining Ammunition",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.NI7twU2G6UCDmvCO",
    "itemSlug": "shining-ammunition",
    "description": "<p><em>闪光弹药</em>散发微弱的光芒。射出后，它在20尺半径内提供明亮光照（再往外20尺为昏暗光照），持续10分钟。若命中目标，它会附着在目标上，使目标在相同半径内发光。生物可以用一个交互动作取下弹药，但弹药本身会继续发光，直到持续时间结束或被摧毁。</p>\n<p>@UUID[Compendium.pf2e.equipment-effects.Item.Sf6UO6vgCeicggOK]{效果：闪光弹药}</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "selector": "{item|_id}-attack",
      "text": "PF2E.AmmunitionNotes.ShiningAmmunition.Text",
      "title": "PF2E.AmmunitionNotes.ShiningAmmunition.Title"
    },
    "sourceRuleSha256": "e253ed339abcd3bdcc10ead0b435360fd6968f68911c6107d76b917921378559",
    "approved": true,
    "display": {
      "text": "该弹药使半径20尺范围内成为明亮光照（并使更远的20尺范围内成为昏暗光照），持续10分钟。如果它命中了一个目标，它会固定在目标身上，使目标发出同样的光芒。@UUID[Compendium.pf2e.equipment-effects.Item.Sf6UO6vgCeicggOK]{效果：闪光弹药}"
    },
    "approvalHashes": {
      "text": "b55a8e50e9dc238314b767123e837c9e1feded57354dcde2a57a49bd7d805885"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.AmmunitionNotes.ShiningAmmunition.Title": "Shining Ammunition",
      "PF2E.AmmunitionNotes.ShiningAmmunition.Text": "The ammunition sheds bright light in a 20-foot radius (and dim light to the next 20 feet) for 10 minutes. If it hits a target, it sticks, causing the target to shed light in the same radius. @UUID[Compendium.pf2e.equipment-effects.Item.Sf6UO6vgCeicggOK]{Effect: Shining Ammunition}"
    },
    "carrierApprovalHashes": {
      "itemName": "06fba7973d230d93c066936326ad0a4ac45e9ca5b5db7ce808b5ad835a904f82",
      "actorName": "17e3366af5bcb307c47a2763642f7d3ee82b19a0f27f4950111a85fbd6450dd4",
      "description": "c1067895235a0e4a96fa499403efd2ed3ca0d8a443d2cbb4410b872d5e98fbcb"
    }
  },
  {
    "path": "actors[27].items[3].system.rules[0]",
    "scope": "actorItem",
    "actorId": "yFYGXylGKUFThcco",
    "actorType": "loot",
    "actorName": "壁炉 Fireplace",
    "actorFolderId": "v9Bx0WGZTDTkJI4h",
    "actorSourceUuid": null,
    "itemId": "A4NdPWXRIa4j65Qd",
    "itemType": "weapon",
    "itemName": "毒蛇匕首 Serpent Dagger",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.ZvIEJCY60fHqzl6r",
    "itemSlug": "serpent-dagger",
    "description": "<p>这把<em>+1强击匕首</em>的锯齿刃泛着绿光，刀柄雕成一颗蓄势欲袭的蛇头。</p>\n<p>使用<em>毒蛇匕首</em>进行攻击骰并大成功时，目标陷入@UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{恶心 1}，除非它成功通过@Check[fortitude|dc:19]豁免。这是毒素效果。</p>\n<p>此外，你可以启动匕首，用更强效的毒素使生物中毒。</p>\n<hr>\n<p><strong>启动——充注毒液</strong> <span class=\"action-glyph\">F</span>（操作）</p>\n<p><strong>频率</strong> 每日一次</p>\n<p><strong>触发</strong> 你用<em>毒蛇匕首</em>对一个生物造成伤害</p>\n<p><strong>效果</strong> 你使命中的生物受到匕首剧毒侵害。</p>\n<hr>\n<p><strong>匕首剧毒</strong>（毒素）</p>\n<p><strong>豁免</strong> @Check[fortitude|dc:21]</p>\n<p><strong>最大持续时间</strong> 4轮</p>\n<p><strong>阶段1</strong> @Damage[1d8[poison]]伤害及@UUID[Compendium.pf2e.conditionitems.Item.MIRkyAjyBeXivMa7]{力竭 1}</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "criticalSuccess"
      ],
      "selector": "{item|id}-attack",
      "text": "PF2E.SpecificRule.Equipment.SerpentDagger.Note",
      "title": "{item|name}"
    },
    "sourceRuleSha256": "317d8d79f6bab31191c38698ab8adf5ca6428d9ba728db8fa26c2f66d6632d7d",
    "approved": true,
    "display": {
      "text": "当你用<em>毒蛇匕首</em>的攻击检定大成功时，目标陷入@UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{恶心1}，除非它成功通过@Check[fortitude|dc:19]豁免。",
      "title": "毒蛇匕首"
    },
    "approvalHashes": {
      "text": "54985fad12773728dc2d574ac8244428f280b3e18f2463d5921bfd6a6b83c90c",
      "title": "904346b605590ac46e0dac259c386a32287acbe63530ff06d8580faf34090b51"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.SpecificRule.Equipment.SerpentDagger.Note": "When you critically succeed at an attack roll with the <em>serpent dagger</em>, the target becomes @UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{Sickened 1} unless it succeeds at a @Check[fortitude|dc:19] save."
    },
    "carrierApprovalHashes": {
      "itemName": "584abeb315d81f3590e725eaa046a4b11976999ce639ab0d3b21d0febcbbb743",
      "actorName": "17e3366af5bcb307c47a2763642f7d3ee82b19a0f27f4950111a85fbd6450dd4",
      "description": "7c6496315b46f3eb1555dcf9c631ce50c6865bc4b5c93833b28efa618f49c9eb"
    }
  },
  {
    "path": "actors[220].items[4].system.rules[0]",
    "scope": "actorItem",
    "actorId": "UlUHf4haT6iiJ6HG",
    "actorType": "loot",
    "actorName": "工坊置物架 Workshop Shelves",
    "actorFolderId": "mtfsjK3KJn31aLgl",
    "actorSourceUuid": null,
    "itemId": "6anBuEECQ2aX4F3W",
    "itemType": "weapon",
    "itemName": "高等黏胶炸弹 Glue Bomb (Greater)",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.5Qkz4RVJr2Kx3RL6",
    "itemSlug": "glue-bomb-greater",
    "description": "<p><strong>启动</strong> <span class=\"action-glyph\">1</span> 打击</p><hr><p>黏胶炸弹是一种装满黏性物质的无害爆破装置。用黏胶炸弹命中一个生物时，该生物的各项速度承受–15尺状态减值，持续1分钟。你的攻击骰获得+2物品加值，@UUID[Compendium.pf2e.actionspf2e.Item.SkZAQRkLLkmBQNB9]{逃脱}DC为[[/act escape dc=28]]{28}。</p>\n<p>重击时，与固体表面接触的生物会被黏在表面上，陷入@UUID[Compendium.pf2e.conditionitems.Item.eIcWbB5o3pP6OIMe]{禁足}，持续1轮；用翅膀飞行的生物则会被缠住翅膀，安全落地，且1轮内无法再次飞行。黏胶炸弹对水中的生物无效。</p>\n<p>目标可以通过逃脱，或花费总共3个交互动作小心除去黏性物质，来结束这些效果。交互动作无需连续进行，也可以由其他生物提供。</p>\n<p>@UUID[Compendium.pf2e.equipment-effects.Item.sgQknR94qDt5ILBx]{效果：黏胶炸弹}</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "success"
      ],
      "selector": "{item|_id}-attack",
      "text": "PF2E.BombNotes.TanglefootBag.Greater.success",
      "title": "{item|name}"
    },
    "sourceRuleSha256": "11597f1bab6bd4786b9c767760a7ff5aeb47f159cbc98d2aef7e766c59ea5596",
    "approved": true,
    "display": {
      "title": "高等黏胶炸弹"
    },
    "approvalHashes": {
      "title": "ce1bdc78fbe2913efc285e880d6e5f94fa548ddfb8adf410eedc01e136b20d22"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.BombNotes.TanglefootBag.Greater.success": "On a hit, @UUID[Compendium.pf2e.equipment-effects.Item.sgQknR94qDt5ILBx]{-15-foot Speed penalty} for 1 minute."
    },
    "carrierApprovalHashes": {
      "itemName": "d0c5e70159f131a33bbb0e4e0571b3e7f353c804c5881d7147692961fedae280",
      "actorName": "5b40198aba52bb6f2bcb3feb4b66e5214febc282ac2eb41aad314a7a0d5fc54f",
      "description": "5dfb4c46e353a45555f28b50eb9fbf7d4c1ce9eb7de92bf3d476b158882fdd0a"
    }
  },
  {
    "path": "actors[220].items[4].system.rules[1]",
    "scope": "actorItem",
    "actorId": "UlUHf4haT6iiJ6HG",
    "actorType": "loot",
    "actorName": "工坊置物架 Workshop Shelves",
    "actorFolderId": "mtfsjK3KJn31aLgl",
    "actorSourceUuid": null,
    "itemId": "6anBuEECQ2aX4F3W",
    "itemType": "weapon",
    "itemName": "高等黏胶炸弹 Glue Bomb (Greater)",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.5Qkz4RVJr2Kx3RL6",
    "itemSlug": "glue-bomb-greater",
    "description": "<p><strong>启动</strong> <span class=\"action-glyph\">1</span> 打击</p><hr><p>黏胶炸弹是一种装满黏性物质的无害爆破装置。用黏胶炸弹命中一个生物时，该生物的各项速度承受–15尺状态减值，持续1分钟。你的攻击骰获得+2物品加值，@UUID[Compendium.pf2e.actionspf2e.Item.SkZAQRkLLkmBQNB9]{逃脱}DC为[[/act escape dc=28]]{28}。</p>\n<p>重击时，与固体表面接触的生物会被黏在表面上，陷入@UUID[Compendium.pf2e.conditionitems.Item.eIcWbB5o3pP6OIMe]{禁足}，持续1轮；用翅膀飞行的生物则会被缠住翅膀，安全落地，且1轮内无法再次飞行。黏胶炸弹对水中的生物无效。</p>\n<p>目标可以通过逃脱，或花费总共3个交互动作小心除去黏性物质，来结束这些效果。交互动作无需连续进行，也可以由其他生物提供。</p>\n<p>@UUID[Compendium.pf2e.equipment-effects.Item.sgQknR94qDt5ILBx]{效果：黏胶炸弹}</p>",
    "descriptionGM": "",
    "ruleIndex": 1,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "criticalSuccess"
      ],
      "selector": "{item|_id}-attack",
      "text": "PF2E.BombNotes.TanglefootBag.Greater.criticalSuccess",
      "title": "{item|name}"
    },
    "sourceRuleSha256": "b24d79007f5e71e01ee839d76451657c0f2567ca75edbc3d527ec7bc60225d8f",
    "approved": true,
    "display": {
      "title": "高等黏胶炸弹",
      "text": "重击时，生物承受持续一分钟的@UUID[Compendium.pf2e.equipment-effects.Item.sgQknR94qDt5ILBx]{-15尺速度减值}，并且目标还陷入持续1轮的@UUID[Compendium.pf2e.conditionitems.Item.eIcWbB5o3pP6OIMe]。"
    },
    "approvalHashes": {
      "title": "3bb8f18f10324bae388faee893b1871df3323b3f5b3faeb11996bbabf9165b2b",
      "text": "36756eea21d5ac5feceda6ce8c6dbe6569ca1db72da3b106afe113d5a07899ad"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.BombNotes.TanglefootBag.Greater.criticalSuccess": "On a critical hit, @UUID[Compendium.pf2e.equipment-effects.Item.sgQknR94qDt5ILBx]{-15-foot Speed penalty} for 1 minute and @UUID[Compendium.pf2e.conditionitems.Item.eIcWbB5o3pP6OIMe]{Immobilized} for 1 round."
    },
    "carrierApprovalHashes": {
      "itemName": "d0c5e70159f131a33bbb0e4e0571b3e7f353c804c5881d7147692961fedae280",
      "actorName": "5b40198aba52bb6f2bcb3feb4b66e5214febc282ac2eb41aad314a7a0d5fc54f",
      "description": "5dfb4c46e353a45555f28b50eb9fbf7d4c1ce9eb7de92bf3d476b158882fdd0a"
    }
  },
  {
    "path": "actors[233].items[27].system.rules[2]",
    "scope": "actorItem",
    "actorId": "s9deoXkbvvkvX9xZ",
    "actorType": "npc",
    "actorName": "劳德尔茨·阿鲁多拉 Raudltz Arudora",
    "actorFolderId": "IDeegHUXlrynZ2Jw",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.s9deoXkbvvkvX9xZ",
    "itemId": "vnF2YnplRgH8R83x",
    "itemType": "equipment",
    "itemName": "影玺 Shadow Signet",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.1T1TJB929nC7wBtC",
    "itemSlug": "shadow-signet",
    "description": "<p>这枚黑曜石玺戒允许你将自己法术的一部分卷入影界，使其直击敌人的躯体。</p>\n<p><strong>启动</strong> <span class=\"action-glyph\">f</span>（专注，塑法）</p><hr><p><strong>效果</strong> 如果你的下一个动作是施放需要对抗AC掷法术攻击骰的法术，选择强韧DC或反射DC。你改为使用你的法术攻击骰来对抗该防御属性，而非AC。若该法术具有多个目标，你选择的DC种类会应用到全体目标上。</p>",
    "descriptionGM": "",
    "ruleIndex": 2,
    "sourceRule": {
      "key": "Note",
      "predicate": [
        "shadow-signet",
        "item:trait:attack",
        {
          "or": [
            "item:defense:fortitude-dc",
            "item:defense:reflex-dc"
          ]
        }
      ],
      "selector": "spell-attack-roll",
      "text": "PF2E.SpecificRule.ShadowSignet.Note",
      "title": "{item|name}"
    },
    "sourceRuleSha256": "01ae53e7405af5c14a5de3da607799472ddf8eaa6b9f3b52b279b24466de9e98",
    "approved": true,
    "display": {
      "title": "影玺"
    },
    "approvalHashes": {
      "title": "29adc5ff48ee201b192c75a16aa9063d97010da42cdfdd07b48f10e485383b02"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.SpecificRule.ShadowSignet.Note": "If your next action is to Cast a Spell that requires a spell attack roll against Armor Class, choose Fortitude DC or Reflex DC. You make your spell attack roll against that defense instead of AC."
    },
    "carrierApprovalHashes": {
      "itemName": "967e7b36c8b1e5039c0618f3e2bf7ceec62ef25c7a8aabdd71ba466b74f770c8",
      "actorName": "acb45124981d0fc9b94d7e3efc9ca00c36e01e5d2757591d02060071efa17387",
      "description": "122f7c3be5bac0821704f48587015e743384a30869e11db641af84e85808b96a"
    }
  },
  {
    "path": "actors[281].items[0].system.rules[1]",
    "scope": "actorItem",
    "actorId": "t7pt2BlRjyDMdeZ1",
    "actorType": "loot",
    "actorName": "塔西菲妮的石棺 Tasifinie Sarcophagus",
    "actorFolderId": "Yf0x7Md69iwGKEDs",
    "actorSourceUuid": null,
    "itemId": "McoCJt4eIGjjSAZx",
    "itemType": "weapon",
    "itemName": "斩惧剑 Fearcutter",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.w7usWIc20eklVVXT",
    "itemSlug": "fearcutter",
    "description": "<p>在冒险生涯中，埃拉盖尔·阿鲁多拉以莎琳神卫的身份声名远扬。他奉行辉煌事业，放弃了莎琳神卫常用的大砍刀，转而磨炼长剑与盾牌的技巧。虽然得到莎琳祝福的是他的盾牌，但当他退隐、开始建造阿鲁多拉城堡时，佩剑<em>斩惧剑</em>或许已是他最负盛名的宝物。他凭此剑斩杀无数不死生物与魔族，其中包括恐怖的恐亡魔沃明贡杜尔；这怪物曾多年折磨瓦尔诺西南边境的十二个小聚落，最终亡于此剑锋下。</p>\n<p><em>斩惧剑</em>是一把<em>+2强击星魂命源长剑</em>。你持有未入鞘的斩惧剑时，对抗恐惧效应的豁免获得+2物品加值。当你用<em>斩惧剑</em>重击具有邪秽特征的生物时，目标陷入@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧 1}。</p><hr><p><strong>激活——斩断恐惧</strong> <span class=\"action-glyph\">1</span>（神术、操作）</p>\n<p><strong>频率</strong> 每轮一次</p><hr><p><strong>效果</strong> 你在一名惊惧生物附近挥动<em>斩惧剑</em>，将该生物的惊惧值降低1。</p><hr><p><strong>激活——斩断残酷</strong> <span class=\"action-glyph\">2</span>（神术、操作）</p>\n<p><strong>频率</strong> 每日一次</p><hr><p><strong>效果</strong> 你奋力挥舞<em>斩惧剑</em>，剑刃对射程内一个邪秽目标施展5环@UUID[Compendium.pf2e.spells-srd.Item.3x6eUCm17n6ROzUa]{信念崩塌}（@Check[will|dc:29]豁免）。</p>",
    "descriptionGM": "",
    "ruleIndex": 1,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "criticalSuccess"
      ],
      "predicate": [
        "target:trait:unholy"
      ],
      "selector": [
        "{item|id}-attack"
      ],
      "text": "PF2E.SpecificRule.Equipment.Fearcutter.Note",
      "title": "{item|name}"
    },
    "sourceRuleSha256": "2dedaacdd3bc4f1fe9f27562c32ae887ca86fc7c3d91f241ba15ce832a11521f",
    "approved": true,
    "display": {
      "title": "斩惧剑",
      "text": "当你用<em>斩惧剑</em>重击具有邪秽特征的生物时，目标陷入@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧1}。"
    },
    "approvalHashes": {
      "title": "fce147f3da1778ff5615e63b85e68d21afbc5354a35ff5b4cd6b68fc7f4e97be",
      "text": "05a087016b7c4547485176ee22c4ea33550327dc7c847c88ee8a5046418cb6f6"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.SpecificRule.Equipment.Fearcutter.Note": "When you critically hit a creature with the unholy trait with <em>Fearcutter</em>, the target becomes @UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{Frightened 1}."
    },
    "carrierApprovalHashes": {
      "itemName": "72e610fe2594c111bc9939b0827304e0518fb97b06debebf7f381f92233a3bce",
      "actorName": "0b242c1ad23754afecab0a0f22df2926943ce830e91d911622020d47616adcc7",
      "description": "ddd5bf0b7df2d04b75e4508e671b4555f9ed98ee69a07bde5a5cabeecb018ab3"
    }
  },
  {
    "path": "actors[294].items[4].system.rules[3]",
    "scope": "actorItem",
    "actorId": "iiNuVMrWmIblcCZ3",
    "actorType": "npc",
    "actorName": "扎莎 Zasha",
    "actorFolderId": "nCHw2Vcj0Eth0Evy",
    "actorSourceUuid": "Compendium.pf2e.pathfinder-monster-core.Actor.GUjtk2h6Yj0NKifF",
    "itemId": "hvTnI184eIoLfwPq",
    "itemType": "action",
    "itemName": "狂暴猛击 Berserk Slam",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p><strong>需求</strong> 尸骸造物处于狂暴状态</p>\n<hr>\n<p><strong>效果</strong> 尸骸造物以–1环境减值进行一次拳打击。如果命中，额外造成1d6伤害，并将目标击至@UUID[Compendium.pf2e.conditionitems.Item.j91X7x0XSomq8d60]{倒地}。</p>",
    "descriptionGM": "",
    "ruleIndex": 3,
    "sourceRule": {
      "key": "Note",
      "predicate": [
        "berserk-slam"
      ],
      "selector": "fist-attack",
      "text": "PF2E.AttackEffects.KnockProne",
      "title": "{item|name}",
      "visibility": "gm"
    },
    "sourceRuleSha256": "eaa84d8e86a5f934ea0f74b542e9a90d65885b7faa38547ac58cb65f9f6074b8",
    "approved": true,
    "display": {
      "title": "狂暴猛击"
    },
    "approvalHashes": {
      "title": "05c95be79e0867354cc48880ead5288090aa89f19a441e3c05b7f2fce7aae46b"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.AttackEffects.KnockProne": "On a hit, the target is knocked @UUID[Compendium.pf2e.conditionitems.Item.j91X7x0XSomq8d60]{Prone}."
    },
    "carrierApprovalHashes": {
      "itemName": "0d1205b90f6e6c0664fffa69f471b5e1f86f6e6a0f517b054a6c70aa9a4db89d",
      "actorName": "5d72304c13ba711bfec78c6d51490cf9ac05bdb59c5231ae0ea1e8144f25b1d0",
      "description": "2e6f27956af72523b50ece04ac2ebd991790d0a14257781ce111e1830a010550"
    }
  },
  {
    "path": "actors[309].items[13].system.rules[0]",
    "scope": "actorItem",
    "actorId": "e22OfdurIIrOUdx3",
    "actorType": "npc",
    "actorName": "佐尔高鲁斯 Zaurgaulus",
    "actorFolderId": "VC73YtnkRreiuDUy",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.e22OfdurIIrOUdx3",
    "itemId": "JzeDzMLmHSZ7TFVn",
    "itemType": "action",
    "itemName": "龙之威势 Draconic Momentum",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>龙每次以打击造成重击时，都会使尖叫吐息充能完毕。</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "criticalSuccess"
      ],
      "selector": "strike-attack-roll",
      "text": "{item|description}",
      "title": "{item|name}",
      "visibility": "owner"
    },
    "sourceRuleSha256": "4d6cac99d86ac13e4f8bc3476e7c930af28655b5bbc778d3d91f0880c8dbeda2",
    "approved": true,
    "display": {
      "title": "龙之威势",
      "text": "<p>龙每次以打击造成重击时，都会使尖叫吐息充能完毕。</p>"
    },
    "approvalHashes": {
      "title": "c201710e44091935e15a0e653a2cbf3c67c01ea22bae0c49698a9920b40c617c",
      "text": "fb865f53dfd8b1ea7738574cc9be9c6ff4c4b0f34b312e2b924e690634d34816"
    },
    "markerIdentity": null,
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "c03f4f493dd86f4371bcbe235c81784f7dc814a14dfc81970b63d5aee031931f",
      "actorName": "1c7a5df957f606abd77cf34a7f90dbd1c684647ee4fb3275673b742980280582",
      "description": "1a0066ed2f27981542c605d9f1ffc9c330763ca50a78265023f4cf7463e85cd7"
    }
  },
  {
    "path": "items[1].system.rules[1]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "tilqIbJZLqeknTYo",
    "itemType": "feat",
    "itemName": "莎琳次等恩赐 Shelyn - Minor Boon",
    "itemFolderId": "5XgAdJrFmpgZaTzk",
    "itemSourceUuid": "Compendium.pf2e.boons-and-curses.Item.tilqIbJZLqeknTYo",
    "itemSlug": "shelyn-minor-boon",
    "description": "<p>你的交涉检定失败时，会改为大成功（此时恩赐消失）。</p>",
    "descriptionGM": "<p>每当PC归还一件@UUID[JournalEntry.l9OoOYdCKdM5VdWi.JournalEntryPage.PQNrZpJKI1yCx0UN#returning-the-artwork]{遗失艺术品}，便获得此恩赐。PC可以多次获得这一恩赐，但如果已经拥有它，恩赐就会改为给予队伍中另一位尚未拥有的PC。</p>",
    "ruleIndex": 1,
    "sourceRule": {
      "key": "Note",
      "title": "{item|name}",
      "text": "{item|description}"
    },
    "sourceRuleSha256": "2bbb26bbf185ec4265e2d3e73c81d5223b5e3a559848b5b58cd36846f46a5e49",
    "approved": true,
    "display": {
      "title": "莎琳次等恩赐",
      "text": "<p>你的交涉检定失败时，会改为大成功（此时恩赐消失）。</p>"
    },
    "approvalHashes": {
      "title": "8d00d7ed872691cab5d46b83b73fe522b4d28bea27776a8c394fc1bc575ba90a",
      "text": "4c29e3427df58be312a64117bf31d9454e5727010517fbe0d0f73c19b2749aab"
    },
    "markerIdentity": null,
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "adf1fd1f3ac6887b0a46d80eaeb3b6b70aab17efc1f413ade29f9146218cde19",
      "description": "2ee180351e3f74e99fb1a8fbbb2ef4481fcf1a202bea913c8cd666e1c01aa280",
      "descriptionGM": "bc2ae07bd52d6e1719aa667c7cc1845b54eae7cbfff26204a555baa0031c4954"
    }
  },
  {
    "path": "items[17].system.rules[0]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "f5H0uN5KDCvM2q20",
    "itemType": "effect",
    "itemName": "效果：蜘蛛恐惧症（提示） Effect: Aracnophobia (Note)",
    "itemFolderId": "gCERAoR8oZdD9SUP",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>如果蜘蛛形生物对你造成重击，不断加剧的恐慌会使你陷入@UUID[Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3]{缓慢1}。</p>",
    "descriptionGM": "<p><em>Foundry说明：</em>此效果由@UUID[Item.pXJNt2NxwKZHPFPj]{效果：蜘蛛恐惧症}中的临时效果规则元素自动施加。</p>",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "title": "{item|name}",
      "visibility": "gm",
      "outcome": [
        "criticalSuccess"
      ],
      "text": "{item|description}",
      "selector": [
        "strike-attack-roll"
      ]
    },
    "sourceRuleSha256": "03900e57de64e9e7a234e8249793d1e481e9053c6f007b1ff2b6ca2e09c890ac",
    "approved": true,
    "display": {
      "title": "效果：蜘蛛恐惧症（提示）",
      "text": "<p>如果蜘蛛形生物对你造成重击，不断加剧的恐慌会使你陷入@UUID[Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3]{缓慢1}。</p>"
    },
    "approvalHashes": {
      "title": "a95c7461386c7251f3b3186c11f1410bbbe4533518a1353b57c063d903037194",
      "text": "3bfe7dc6c6d45ccbbecc1f17f4b5fd2bdfbddc7c6331600d66cbce5ae8d41b53"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "f5H0uN5KDCvM2q20",
      "itemType": "effect",
      "itemFolderId": "gCERAoR8oZdD9SUP",
      "itemSourceUuid": null,
      "originalName": "Effect: Aracnophobia (Note)",
      "approvedName": "效果：蜘蛛恐惧症（提示） Effect: Aracnophobia (Note)",
      "itemSlug": null,
      "sourceFingerprint": "eab217ce5dad0a742c26b82271166f389258aff4bea18fdb502a4b489de2969a",
      "approvalFingerprint": "ca5a4da233cfaa6e7c297d3bf5253dc4a5f50f0ae52af267854b76d31cce9188"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "f34e8cb4c9fef81251333eacdd65734dc8a9361a7f95c44c1d7cae7f498ec5f5",
      "description": "51a0b153dc0864f114e386b02279b2ad84525d0d4cda9a4a761f4acc0f3e0332",
      "descriptionGM": "8b07a7e97e158d302a429a0a3eafdc96cf6b1a212587e518fba422df352af49c"
    }
  },
  {
    "path": "items[19].system.rules[0]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "EHMgAsmdOUqOGl3O",
    "itemType": "effect",
    "itemName": "效果：人群恐惧症（提示） Effect: Enochlophobia (Note)",
    "itemFolderId": "gCERAoR8oZdD9SUP",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>每当你被夹击时，你便陷入@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧1}。</p>",
    "descriptionGM": "<p><em>Foundry说明：</em>此效果由@UUID[Item.skaR0p8AEpv7FvBs]{效果：人群恐惧症}中的临时效果规则元素自动施加。</p>",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "selector": [
        "attack-roll"
      ],
      "text": "{item|description}",
      "title": "{item|name}",
      "predicate": [
        "self:flanking",
        {
          "not": "target:condition:frightened"
        }
      ]
    },
    "sourceRuleSha256": "8fa517d4315049f55d612ede6fe77e7bd00623dcd0faa628019a8ffc1c5a8bc9",
    "approved": true,
    "display": {
      "title": "效果：人群恐惧症（提示）",
      "text": "<p>每当你被夹击时，你便陷入@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧1}。</p>"
    },
    "approvalHashes": {
      "title": "41789fb33f03b9b8182933e221d9a84a7891ec2761030089bc52e4b70aca542a",
      "text": "854c292d3e71fc4dbf210d4e3076142ab41bf23a501b93a4bd146b80b756f0c0"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "EHMgAsmdOUqOGl3O",
      "itemType": "effect",
      "itemFolderId": "gCERAoR8oZdD9SUP",
      "itemSourceUuid": null,
      "originalName": "Effect: Enochlophobia (Note)",
      "approvedName": "效果：人群恐惧症（提示） Effect: Enochlophobia (Note)",
      "itemSlug": null,
      "sourceFingerprint": "f6fada98b16d3d55af9be60b305666bfd9400a61783f2109f7dfb43a2a19c651",
      "approvalFingerprint": "532e7a09f4805b8843d4179a49276cfcb91d1890e817385ebfd73958079c6b5e"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "e83702ba549c28463cf546f2b07ead019cbde11dcaa699677627003430d03d3b",
      "description": "cd9f179ca067c0651547dad43d636637d6ccf61974f2f1672daef619dbb9c55f",
      "descriptionGM": "0542715992d4fe18a51951fbddb1c42b03abba57645ab86759fdb29f164b012a"
    }
  },
  {
    "path": "items[20].system.rules[1]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "sYZI41JKGiMH8aO0",
    "itemType": "effect",
    "itemName": "效果：恐血症 Effect: Hemophobia",
    "itemFolderId": "gCERAoR8oZdD9SUP",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>每当你目睹30尺内的生物受到持续流血伤害或武器打击造成的重击时，你便陷入@UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{恶心1}。如果你自己是该流血伤害或重击的目标，则变为@UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{恶心2}。</p>",
    "descriptionGM": "",
    "ruleIndex": 1,
    "sourceRule": {
      "key": "Note",
      "predicate": [
        "item:origin:condition:persistent-damage:bleed"
      ],
      "selector": [
        "damage-received"
      ],
      "text": "Whenever you take persistent bleed damage you become @UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{Sickened 2}",
      "title": "{item|name}"
    },
    "sourceRuleSha256": "5d6c8b3850361aed56abc657e0400a93450c3aa71cb7809a20169341071f7a00",
    "approved": true,
    "display": {
      "title": "效果：恐血症",
      "text": "每当你受到持续流血伤害时，你便陷入@UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{恶心2}。"
    },
    "approvalHashes": {
      "title": "f9da9e3aca37cc1d61096a175746b079c8358444dc39d29e7e525e5625e9d496",
      "text": "4ffe9be490cbf12328ac6c23f1c37249065d17d1ecc4d50f98f82bb3866712ca"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "sYZI41JKGiMH8aO0",
      "itemType": "effect",
      "itemFolderId": "gCERAoR8oZdD9SUP",
      "itemSourceUuid": null,
      "originalName": "Effect: Hemophobia",
      "approvedName": "效果：恐血症 Effect: Hemophobia",
      "itemSlug": null,
      "sourceFingerprint": "d4b4f328d90f275835302393f042053891b1b928c03bd10a79253ed348481d77",
      "approvalFingerprint": "80925c0fc6a358d19fefced5a4c4853da5d1a1778c4b15ea6b1cf81dd238a28e"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "cb2a7b34df84da3a9f22a3d98cc914dc62794ce519ac63c9cdc07794002f163a",
      "description": "dd31f7d282a1241e6530cee928efbf1f1d4288050b854e317dbb13869391b1d7"
    }
  },
  {
    "path": "items[21].system.rules[0]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "2XdaFz49WGJtSoQG",
    "itemType": "effect",
    "itemName": "效果：恐血症（提示） Effect: Hemophobia (Note)",
    "itemFolderId": "gCERAoR8oZdD9SUP",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>每当武器打击对你造成重击时，你便陷入@UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{恶心2}。</p>",
    "descriptionGM": "<p><em>Foundry说明：</em>此效果由@UUID[Item.sYZI41JKGiMH8aO0]{效果：恐血症}中的临时效果规则元素自动施加。</p>",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "selector": [
        "strike-attack-roll"
      ],
      "predicate": [
        {
          "not": "item:trait:unarmed"
        }
      ],
      "text": "{item|description}",
      "title": "{item|name}",
      "outcome": [
        "criticalSuccess"
      ]
    },
    "sourceRuleSha256": "9b2d8bfba84070e21f35b65f8a50b2e9b9fa6879e7835833fb2c770d5fa887f6",
    "approved": true,
    "display": {
      "title": "效果：恐血症（提示）",
      "text": "<p>每当武器打击对你造成重击时，你便陷入@UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{恶心2}。</p>"
    },
    "approvalHashes": {
      "title": "71af26742ad90eba80b6fdd289dd050cbb236ae4d4445b7b39dbd7e25fa6761a",
      "text": "ce43f5dcff81d1c7c2cfd5be955068c59db6a93b309ddb18c2448f435280882b"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "2XdaFz49WGJtSoQG",
      "itemType": "effect",
      "itemFolderId": "gCERAoR8oZdD9SUP",
      "itemSourceUuid": null,
      "originalName": "Effect: Hemophobia (Note)",
      "approvedName": "效果：恐血症（提示） Effect: Hemophobia (Note)",
      "itemSlug": null,
      "sourceFingerprint": "b4bc48b8246000662a81f002fc19c311d9bfb813c0fec843d03c656f3954d962",
      "approvalFingerprint": "c0fce910b6f6ffe160d8a974d018ad24f251a91a9143b2e0bb9b6bd062348b37"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "1257262d0b07c36cb8d3db9ca733cc06dd856e5a26fcd89c0dbd60f090187e6d",
      "description": "cac906e6ba79f84f3d43a42a05d5c9d995516d4d31b4908fc70175660ef289b3",
      "descriptionGM": "68fd27fb01381e8d0001d60aacca8bf6c9f9a53d0fea22a7673ea0a5e39fb62a"
    }
  },
  {
    "path": "items[24].system.rules[0]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "htPpGj2N2431bfJf",
    "itemType": "effect",
    "itemName": "效果：恐火症 Effect: Pyrophobia",
    "itemFolderId": "gCERAoR8oZdD9SUP",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>每当你受到火焰伤害时，你便陷入@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧1}。</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "predicate": [
        "item:damage:type:fire"
      ],
      "selector": [
        "damage-received"
      ],
      "title": "{item|name}",
      "text": "{item|description}"
    },
    "sourceRuleSha256": "66b308acd5d0d1aea61dff5d541d2cdbe7be6cd18c6834ce2a17254872583723",
    "approved": true,
    "display": {
      "title": "效果：恐火症",
      "text": "<p>每当你受到火焰伤害时，你便陷入@UUID[Compendium.pf2e.conditionitems.Item.TBSHQspnbcqxsmjL]{惊惧1}。</p>"
    },
    "approvalHashes": {
      "title": "c6fa02bda60296aef82cd4d2e7c715f5fd7e58a1fb03a440e859fa5f99aba438",
      "text": "6c93dc142e9c60ffcd18ea2d6501a5c98de809168aadd9dd94fd79f4b2beb28f"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "htPpGj2N2431bfJf",
      "itemType": "effect",
      "itemFolderId": "gCERAoR8oZdD9SUP",
      "itemSourceUuid": null,
      "originalName": "Effect: Pyrophobia",
      "approvedName": "效果：恐火症 Effect: Pyrophobia",
      "itemSlug": null,
      "sourceFingerprint": "3b7b65b247d28b7d9102d3f2100629edd461bd9d44f0079c5f0d111ed2c3789a",
      "approvalFingerprint": "689ea9245aa9c07c947f1cdb761daa2b35e42079ce9bfe7e0ba4fea35702878c"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "0781a8bb395f21b9e81185f0d4ccfaf85ca5a6a1cf747331e0f1cbdc5d0aea2a",
      "description": "1dec9bf341e519ba07fd22b4d8575d6c7cd245e0f9da6ee1ad0ba2e466272971"
    }
  },
  {
    "path": "items[25].system.rules[0]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "YbupG2YOc3QmxJSZ",
    "itemType": "effect",
    "itemName": "效果：畏怪症 Effect: Teraphobia",
    "itemFolderId": "gCERAoR8oZdD9SUP",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>每次与怪物敌人开战时，你都必须成功通过@Check[will|dc:31|options:lucid-nightmare,food-for-the-typhoon-wheel,inflicts:slowed,inflicts:stunned]{DC 31意志}豁免，否则在整场战斗中陷入@UUID[Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3]{缓慢1}（大失败时先@UUID[Compendium.pf2e.conditionitems.Item.dfCMdR4wnpbYNTix]{震慑3}，再缓慢1）。</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "selector": [
        "initiative"
      ],
      "text": "{item|description}",
      "title": "{item|name}"
    },
    "sourceRuleSha256": "6f5e11c54f56f87642bb968dd006dfb0b01d66dcc18643b153e514d2bc3b6723",
    "approved": true,
    "display": {
      "title": "效果：畏怪症",
      "text": "<p>每次与怪物敌人开战时，你都必须成功通过@Check[will|dc:31|options:lucid-nightmare,food-for-the-typhoon-wheel,inflicts:slowed,inflicts:stunned]{DC 31意志}豁免，否则在整场战斗中陷入@UUID[Compendium.pf2e.conditionitems.Item.xYTAsEpcJE1Ccni3]{缓慢1}（大失败时先@UUID[Compendium.pf2e.conditionitems.Item.dfCMdR4wnpbYNTix]{震慑3}，再缓慢1）。</p>"
    },
    "approvalHashes": {
      "title": "3395b35a68cf2dbe8d12a0522dfce9e98091bdf6ac0f27cff6044e8446ee6d82",
      "text": "082d15b6ef09f1354fa2d4a93f649a5b7bc9cbc3dfda86d506e31e3f5fca9231"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "YbupG2YOc3QmxJSZ",
      "itemType": "effect",
      "itemFolderId": "gCERAoR8oZdD9SUP",
      "itemSourceUuid": null,
      "originalName": "Effect: Teraphobia",
      "approvedName": "效果：畏怪症 Effect: Teraphobia",
      "itemSlug": null,
      "sourceFingerprint": "dea26d93648ac979f87bd64440e0d78884e82f3a9919f56e98a9e30084467314",
      "approvalFingerprint": "ac86f9e48e1c66f985cd4a339e840539b763170cb5393adc272a167c62616b57"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "43454dc808d44246717dcc1f709c020650b3e94f2d9b37749e42ca7d4b9adb7c",
      "description": "ed659eb2e4b18bd9f8c67133d21b2580fcc53ff04f67d2a2e014bc6cd270dc0d"
    }
  },
  {
    "path": "items[44].system.rules[0]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "hFGe1C4FcZxTexoH",
    "itemType": "feat",
    "itemName": "已归还：阿莉森德拉的扇子 Returned Alisendra's Fan",
    "itemFolderId": "5XgAdJrFmpgZaTzk",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>在本冒险之路余下的时间里，所有@UUID[Compendium.pf2e.actionspf2e.Item.1OagaWtBpVXExToo]{回忆知识}检定的DC降低1。</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "predicate": [
        "action:recall-knowledge"
      ],
      "text": "{item|description}",
      "selector": [
        "skill-check"
      ],
      "title": "{item|name}"
    },
    "sourceRuleSha256": "771446f3618e5d604e47fc0b8266f133880de05c438b194638a3482c6b142bc9",
    "approved": true,
    "display": {
      "title": "已归还：阿莉森德拉的扇子",
      "text": "<p>在本冒险之路余下的时间里，所有@UUID[Compendium.pf2e.actionspf2e.Item.1OagaWtBpVXExToo]{回忆知识}检定的DC降低1。</p>"
    },
    "approvalHashes": {
      "title": "434f725c6c0c415f23d38c5a29a642194ed7fa7a3634b2b8d0fd9a5b552a69d6",
      "text": "a9c9e65888d224d6da0de1eaef9063fd82a44ccd77720b9b06a0303aad46ef62"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "hFGe1C4FcZxTexoH",
      "itemType": "feat",
      "itemFolderId": "5XgAdJrFmpgZaTzk",
      "itemSourceUuid": null,
      "originalName": "Returned Alisendra's Fan",
      "approvedName": "已归还：阿莉森德拉的扇子 Returned Alisendra's Fan",
      "itemSlug": null,
      "sourceFingerprint": "ef594d5c781164e4f029652b5c1b57099d1c02570cfdb4033c20fb6e8ed709fd",
      "approvalFingerprint": "a57222f51b4dee957e2884c8a2bb6c91912a85ac63c565a3906907a8039dd6ea"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "012803fd13f8d262f0267ef8c15783b6c699b4c552c00802ef1b5d541ba38a3d",
      "description": "a23b9ed5c904e8889e0fe149ce960a21d17b8aa265fdeecca424695c92cccf94"
    }
  },
  {
    "path": "items[49].system.rules[0]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "iRUnURoPuXhATcUP",
    "itemType": "feat",
    "itemName": "已归还：劳德尔茨的望远镜 Returned Raudltz's Telescope",
    "itemFolderId": "5XgAdJrFmpgZaTzk",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>在本冒险之路余下的时间里，进行搜寻或搜索时的所有察觉DC降低2。</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "selector": [
        "perception"
      ],
      "predicate": [
        {
          "or": [
            "action:seek",
            "action:search"
          ]
        }
      ],
      "title": "{item|name}",
      "text": "{item|description}"
    },
    "sourceRuleSha256": "813fcbe46fe0473b44d0f96c4e9f64d8aba20a7d14e8e0cc38773cdf38ffe8b6",
    "approved": true,
    "display": {
      "title": "已归还：劳德尔茨的望远镜",
      "text": "<p>在本冒险之路余下的时间里，进行搜寻或搜索时的所有察觉DC降低2。</p>"
    },
    "approvalHashes": {
      "title": "8a36eb149506cd3b0d540a8e344e3bd6f0323bcfe44867fef57400188f82618a",
      "text": "5c56a3b960dea4c7ab63a9dc0edb807129c9e87223bcab7c2bc325d1565b931b"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "iRUnURoPuXhATcUP",
      "itemType": "feat",
      "itemFolderId": "5XgAdJrFmpgZaTzk",
      "itemSourceUuid": null,
      "originalName": "Returned Raudltz's Telescope",
      "approvedName": "已归还：劳德尔茨的望远镜 Returned Raudltz's Telescope",
      "itemSlug": null,
      "sourceFingerprint": "405b995068fc456e769ee5377c061c6c5bd395694796f0d8a4328efb68f3437c",
      "approvalFingerprint": "8e1a77ff7521ccd8bccdc70a6a95b34479be201c4f301666621c60540f7250e0"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "0be43a8d5493f984c1bdeb820cc91c22ad0035df6c45a1a3afe82ca2947d5559",
      "description": "59300e97a0cd32fa56a725ab3c3f1941324e87eff93270a4ad7a078e839286a5"
    }
  },
  {
    "path": "actors[305].items[54].system.rules[0]",
    "scope": "actorItem",
    "actorId": "aEuFu2OCViPxG08f",
    "actorType": "npc",
    "actorName": "凯德瑟里斯·阿鲁多拉 Caydserris Arudora",
    "actorFolderId": "VC73YtnkRreiuDUy",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.aEuFu2OCViPxG08f",
    "itemId": "F13PrHoACgtGCV3p",
    "itemType": "action",
    "itemName": "邪秽血案 Unholy Bloodshed",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p><strong>频率</strong> 每日一次</p>\n<p><strong>触发</strong> 你使用这件武器对圣洁生物的攻击检定大成功</p><hr><p><strong>效果</strong> 目标受到@Damage[3d8[bleed]]。</p>",
    "descriptionGM": "",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "criticalSuccess"
      ],
      "predicate": [
        "item:slug:[]",
        "target:trait:holy"
      ],
      "selector": [
        "attack-roll"
      ],
      "text": "{item|description}",
      "title": "{item|name} <span class=\"action-glyph\">R</span>",
      "visibility": "gm"
    },
    "sourceRuleSha256": "8f2d0906111ff523e4052e21168a54e621ed3ae8af083acd24035f13654e6bfd",
    "approved": true,
    "display": {
      "text": "<p><strong>频率</strong> 每日一次</p>\n<p><strong>触发</strong> 你使用这件武器对圣洁生物的攻击检定大成功</p><hr><p><strong>效果</strong> 目标受到@Damage[3d8[bleed]]。</p>",
      "title": "邪秽血案 <span class=\"action-glyph\">R</span>"
    },
    "approvalHashes": {
      "text": "5cb9138fca7a8417e29dda8e09839921fb9eced08745a55ea5d5171477f5cbd6",
      "title": "5b12792dd88d3d29b25c81a66b617b69fc7b3f43b889f308be4c9170f5847300"
    },
    "markerIdentity": null,
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "dceece1f2034835167a0bdf9e558a4631425d4c84b4b63dab66750999f965d93",
      "actorName": "eca4ef68735230b7d5f94d50b4857b99277285531283b80ec24a0b6e34ab730c",
      "description": "2fab991080e7609b38d660e1dfc7a0a05e30cf0b94aefb3a08bdd303fd745e17"
    }
  },
  {
    "path": "actors[307].items[4].system.rules[1]",
    "scope": "actorItem",
    "actorId": "pRlJ0cepzWAyJeSJ",
    "actorType": "npc",
    "actorName": "维利卡恩（无头骑士） Velicarn (Dullahan)",
    "actorFolderId": "VC73YtnkRreiuDUy",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.pRlJ0cepzWAyJeSJ",
    "itemId": "RMbB0Cy1iBEXCD5A",
    "itemType": "melee",
    "itemName": "锐锋长剑 Keen Longsword",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "",
    "descriptionGM": "",
    "ruleIndex": 1,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "criticalSuccess"
      ],
      "predicate": [
        "check:total:natural:19"
      ],
      "selector": "{item|_id}-attack",
      "text": "PF2E.AttackEffects.IncreasedCriticalChance",
      "title": "PF2E.WeaponPropertyRune.keen.Name",
      "visibility": "gm"
    },
    "sourceRuleSha256": "ca4dd92f8dd260ea1538dfe1e3c9ff946b47f0eaf453eab018fa7f6dbe972c0f",
    "approved": true,
    "display": {
      "text": "如果攻击命中，且生物在d20上骰出19，该攻击便是重击。如果骰出19仍会失败，则此效果不起作用。"
    },
    "approvalHashes": {
      "text": "c08087b58f8e9cc15dd80101597ea7f78e990b6d59161f5bafdc71783fbfb92c"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.WeaponPropertyRune.keen.Name": "Keen",
      "PF2E.AttackEffects.IncreasedCriticalChance": "If the attack hits and the creature rolls a 19 on the d20 roll, the attack is a critical hit. This has no effect if the 19 would be a failure."
    },
    "carrierApprovalHashes": {
      "itemName": "2024841bbe45ebcb9415c8f90e1b2fbe40379130bff9cb93e6e4a1724830cee7",
      "actorName": "51e0befc5a9e542ac74702aa7904e71b5f8c467473f6dfdca2913576e9ab981a"
    }
  },
  {
    "path": "actors[307].items[5].system.rules[1]",
    "scope": "actorItem",
    "actorId": "pRlJ0cepzWAyJeSJ",
    "actorType": "npc",
    "actorName": "维利卡恩（无头骑士） Velicarn (Dullahan)",
    "actorFolderId": "VC73YtnkRreiuDUy",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.pRlJ0cepzWAyJeSJ",
    "itemId": "bo8qDCWaF4txPsi1",
    "itemType": "melee",
    "itemName": "锐锋回力短柄斧 Keen Returning Hatchet",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "",
    "descriptionGM": "",
    "ruleIndex": 1,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "criticalSuccess"
      ],
      "predicate": [
        "check:total:natural:19"
      ],
      "selector": "{item|_id}-attack",
      "text": "PF2E.AttackEffects.IncreasedCriticalChance",
      "title": "PF2E.WeaponPropertyRune.keen.Name",
      "visibility": "gm"
    },
    "sourceRuleSha256": "ca4dd92f8dd260ea1538dfe1e3c9ff946b47f0eaf453eab018fa7f6dbe972c0f",
    "approved": true,
    "display": {
      "text": "如果攻击命中，且生物在d20上骰出19，该攻击便是重击。如果骰出19仍会失败，则此效果不起作用。"
    },
    "approvalHashes": {
      "text": "06a5b804ee6f476556a9900b164a8c023a2d6d8c202408b10b9747e02059a93d"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.WeaponPropertyRune.keen.Name": "Keen",
      "PF2E.AttackEffects.IncreasedCriticalChance": "If the attack hits and the creature rolls a 19 on the d20 roll, the attack is a critical hit. This has no effect if the 19 would be a failure."
    },
    "carrierApprovalHashes": {
      "itemName": "37f1e932f3e9ace475d267f7f3f5aba074724cb693bd26e4be08395ef4986c3e",
      "actorName": "51e0befc5a9e542ac74702aa7904e71b5f8c467473f6dfdca2913576e9ab981a"
    }
  },
  {
    "path": "actors[307].items[7].system.rules[1]",
    "scope": "actorItem",
    "actorId": "pRlJ0cepzWAyJeSJ",
    "actorType": "npc",
    "actorName": "维利卡恩（无头骑士） Velicarn (Dullahan)",
    "actorFolderId": "VC73YtnkRreiuDUy",
    "actorSourceUuid": "Compendium.pf2e.bastion-of-blasphemies-bestiary.Actor.pRlJ0cepzWAyJeSJ",
    "itemId": "ORBRYCSr88txQyIM",
    "itemType": "melee",
    "itemName": "锐锋回力短柄斧 Keen Returning Hatchet",
    "itemFolderId": null,
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "",
    "descriptionGM": "",
    "ruleIndex": 1,
    "sourceRule": {
      "key": "Note",
      "outcome": [
        "criticalSuccess"
      ],
      "predicate": [
        "check:total:natural:19"
      ],
      "selector": "{item|_id}-attack",
      "text": "PF2E.AttackEffects.IncreasedCriticalChance",
      "title": "PF2E.WeaponPropertyRune.keen.Name",
      "visibility": "gm"
    },
    "sourceRuleSha256": "ca4dd92f8dd260ea1538dfe1e3c9ff946b47f0eaf453eab018fa7f6dbe972c0f",
    "approved": true,
    "display": {
      "text": "如果攻击命中，且生物在d20上骰出19，该攻击便是重击。如果骰出19仍会失败，则此效果不起作用。"
    },
    "approvalHashes": {
      "text": "ae807f7ae5ae7840fee3d1a028f9b62d5e7709c7f7b8dc51f6100feb6de79813"
    },
    "markerIdentity": null,
    "nativeEnglish": {
      "PF2E.WeaponPropertyRune.keen.Name": "Keen",
      "PF2E.AttackEffects.IncreasedCriticalChance": "If the attack hits and the creature rolls a 19 on the d20 roll, the attack is a critical hit. This has no effect if the 19 would be a failure."
    },
    "carrierApprovalHashes": {
      "itemName": "721d4e247702d9c2304804ad72c74d6880168c20d164977e0296d72ca290dff8",
      "actorName": "51e0befc5a9e542ac74702aa7904e71b5f8c467473f6dfdca2913576e9ab981a"
    }
  },
  {
    "path": "actors[316].items[0].system.rules[0]",
    "scope": "actorItem",
    "actorId": "jxcxlRfQRjTeJaWC",
    "actorType": "loot",
    "actorName": "塔内祭坛 Tower Altar",
    "actorFolderId": "MwFp8GBDsukZ0rM4",
    "actorSourceUuid": null,
    "itemId": "Ov2yYzYKRElVNpHa",
    "itemType": "weapon",
    "itemName": "匕首 Dagger",
    "itemFolderId": null,
    "itemSourceUuid": "Compendium.pf2e.equipment-srd.Item.rQWaJhI5Bko5x14Z",
    "itemSlug": "dagger",
    "description": "<p>这种小型有刃的武器可以单手持握并在近战中刺伤生物。也可以用来投掷。</p>",
    "descriptionGM": "<section class=\"pf2e-traits\"><p>被诅咒</p></section><p>这把匕首带有13级版本的渴血诅咒，但不影响厄加图娅的信徒。</p><p>渴血武器会被暴力唤醒，并以鲜血为食。你用该武器成功命中时，除了正常伤害，还会造成一道伤口，造成@Damage[1d6[persistent,bleed]]伤害；但它也会对你造成1d6持续流血伤害。诅咒在武器命中生物前保持休眠；命中时，黑色荆棘从武器上伸出并刺入你的身体。武器与你融为一体，你无法用持握它的手做其他事情。如果武器需要双手持握，它只会附着在一只手上（由GM决定）。</p>",
    "ruleIndex": 0,
    "sourceRule": {
      "key": "Note",
      "title": "Bloodbiter Curse",
      "text": "{item|system.description.gm}",
      "visibility": "gm",
      "selector": [
        "{item|id}-attack"
      ],
      "outcome": [
        "success",
        "criticalSuccess"
      ]
    },
    "sourceRuleSha256": "ebc946fb7205546652a150bfefb6e2f06a0d513733755d2106de4e2a997fe7f0",
    "approved": true,
    "display": {
      "title": "渴血诅咒",
      "text": "<section class=\"pf2e-traits\"><p>被诅咒</p></section><p>这把匕首带有13级版本的渴血诅咒，但不影响厄加图娅的信徒。</p><p>渴血武器会被暴力唤醒，并以鲜血为食。你用该武器成功命中时，除了正常伤害，还会造成一道伤口，造成@Damage[1d6[persistent,bleed]]伤害；但它也会对你造成1d6持续流血伤害。诅咒在武器命中生物前保持休眠；命中时，黑色荆棘从武器上伸出并刺入你的身体。武器与你融为一体，你无法用持握它的手做其他事情。如果武器需要双手持握，它只会附着在一只手上（由GM决定）。</p>"
    },
    "approvalHashes": {
      "title": "79a80b902e5d0695595fa32151ab5bdcbb141b005f936befc4183cd8df9cc1f3",
      "text": "67f7d9fbcf31dc05ed23dcf2ac4eb6d9ef919b24fb71ac1c6c34e43b000ef9f5"
    },
    "markerIdentity": null,
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "46ead7260fd814e43615be189dbd5ac4e37520512fccd4b6949299bcf55e7c8f",
      "actorName": "8b228216234c62b73361a212fac9b4a3eabd84fe1ebf9a4f29c7d711f5cb700b",
      "description": "0c480d770e894fa00fdbac483265b1e6c229734bdd2d15bfd420fea5024be4e1",
      "descriptionGM": "c6abe1ef2075e850465989ac9d2e5b1f8ddaa80bf31ad5f4424c1bc00954b71c"
    }
  },
  {
    "path": "items[27].system.rules[2]",
    "scope": "worldItem",
    "actorId": null,
    "actorType": null,
    "actorName": null,
    "actorFolderId": null,
    "actorSourceUuid": null,
    "itemId": "KAI0Cx2ys0P56hZw",
    "itemType": "effect",
    "itemName": "效果：头顶的天空（第4章） Effect: The Skies Above (Chapter 4)",
    "itemFolderId": "n06cuNoUCKALKOw5",
    "itemSourceUuid": null,
    "itemSlug": null,
    "description": "<p>你基于视觉的察觉检定承受–2环境减值，雾气使50尺外的生物获得@UUID[Compendium.pf2e.conditionitems.Item.DmAIPqOBomZ7H95W]{隐蔽}。</p>",
    "descriptionGM": "",
    "ruleIndex": 2,
    "sourceRule": {
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
    },
    "sourceRuleSha256": "e90e869f5b44f65d730969722b665fe8b5ecd16c932ef4e40b8de44d65c93509",
    "approved": true,
    "display": {
      "title": "头顶的天空",
      "text": "雾气使距离50尺或更远的生物具有隐蔽。"
    },
    "approvalHashes": {
      "title": "a8f28ef8c5ee0455194c226cf0962aa2b58bf301fa26bc35115db62a1511bae9",
      "text": "fba5a14281b68efdf6972578a5a34147cca3f9a243490a9854aac97dec2ff3bb"
    },
    "markerIdentity": {
      "scope": "worldItem",
      "itemId": "KAI0Cx2ys0P56hZw",
      "itemType": "effect",
      "itemFolderId": "n06cuNoUCKALKOw5",
      "itemSourceUuid": null,
      "originalName": "Effect: The Skies Above (Chapter 4)",
      "approvedName": "效果：头顶的天空（第4章） Effect: The Skies Above (Chapter 4)",
      "itemSlug": null,
      "sourceFingerprint": "89da6ed0dbe402ca22187bec29dc548db422405d1515a0b1c4f360ac2af73976",
      "approvalFingerprint": "e1c7fd6cd5f3b1f19e279f7e716250556f9c78816d1ca623381e7087f72467fc"
    },
    "nativeEnglish": {},
    "carrierApprovalHashes": {
      "itemName": "2ad52654238cc42f484e06ddb6b1ce0815c805d4dde55e9b911b0c3e56fbb16f",
      "description": "8335d0a311368e18911a0fcde4fab51f472f9a83328159242f8fc9ec03c5274f"
    }
  }
];
