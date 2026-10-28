export const ELDAMON_RULE_DISPLAY_BINDINGS = [
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.4XtQGzhO56d5eAxV",
    "itemType": "effect",
    "itemSlug": "water-barrier-helper",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "attack-roll",
      "value": -2,
      "type": "circumstance",
      "predicate": [
        {
          "or": [
            "item:damage:type:bludgeoning",
            "item:damage:type:slashing"
          ]
        }
      ],
      "label": "Water Barrier",
      "hideIfDisabled": true
    },
    "translation": "水之屏障"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.4jBsevZHp1D3WFFu",
    "itemType": "effect",
    "itemSlug": "effect-bubble-burst-high-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "ac",
      "value": -2,
      "label": "Bubble Burst"
    },
    "translation": "气泡爆裂"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.4oX7oo58xL8eDDvk",
    "itemType": "effect",
    "itemSlug": "effect-leviathan-low-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": [
        "attack-roll",
        "perception",
        "saving-throw",
        "skill-check",
        "eldamon"
      ],
      "value": 2,
      "type": "status",
      "label": "Leviathan"
    },
    "translation": "利维坦"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.BPlem9tBkw6ztaBd",
    "itemType": "effect",
    "itemSlug": "effect-storm-surge-low-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "reflex",
      "value": 2,
      "type": "circumstance",
      "label": "Storm Surge"
    },
    "translation": "风暴潮"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.Be68woo4zufVqnxc",
    "itemType": "effect",
    "itemSlug": "effect-unrelenting-jet-low-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "attack-roll",
      "value": -2,
      "predicate": [
        "target:feature:water-element"
      ],
      "label": "Unrelenting Tide"
    },
    "translation": "不息潮汐"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.LOZSTFUALZeY9PBH",
    "itemType": "effect",
    "itemSlug": "effect-charybdis-low-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "ac",
      "value": 2,
      "type": "status",
      "label": "Charybdis"
    },
    "translation": "卡律布狄斯"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.Qo8ccw1GcVpmOOxd",
    "itemType": "effect",
    "itemSlug": "effect-ocean-torrent-high-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "fortitude",
      "value": -2,
      "type": "circumstance",
      "label": "Ocean Torrent"
    },
    "translation": "海洋洪流"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.bIefoFLc8f59bJl6",
    "itemType": "effect",
    "itemSlug": "effect-rushing-current-high-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "reflex",
      "value": -2,
      "label": "Rushing Current"
    },
    "translation": "奔涌激流"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.bfYTSksrTpFrN764",
    "itemType": "effect",
    "itemSlug": "effect-ocean-torrent-low-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "fortitude",
      "value": 2,
      "type": "circumstance",
      "label": "Ocean Torrent"
    },
    "translation": "海洋洪流"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.eodo23kQ8nTVj5np",
    "itemType": "effect",
    "itemSlug": "effect-bubble-burst-low-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "attack-roll",
      "value": -2,
      "type": "circumstance",
      "predicate": [
        "target:feature:water-element"
      ],
      "label": "Bubble Burst"
    },
    "translation": "气泡爆裂"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.fdgqSSrOsrq1yoRO",
    "itemType": "effect",
    "itemSlug": "effect-storm-surge-high-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "reflex",
      "value": -2,
      "type": "circumstance",
      "label": "Storm Surge"
    },
    "translation": "风暴潮"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.jAKO8B23405V0St9",
    "itemType": "effect",
    "itemSlug": "effect-rushing-current-low-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "reflex",
      "value": 2,
      "type": "circumstance",
      "label": "Rushing Current"
    },
    "translation": "奔涌激流"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.ozmTj0Bri31NqMEo",
    "itemType": "effect",
    "itemSlug": "effect-leviathan-high-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "will",
      "value": -2,
      "label": "Leviathan"
    },
    "translation": "利维坦"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-effects.Item.s7OtrwAXwaGWVT10",
    "itemType": "effect",
    "itemSlug": "effect-unrelenting-jet-high-tide",
    "ruleIndex": 0,
    "rule": {
      "key": "FlatModifier",
      "selector": "ac",
      "value": -2,
      "label": "Unrelenting Tide"
    },
    "translation": "不息潮汐"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.Kr0e2WlBjWycOJFw",
    "itemType": "ancestry",
    "itemSlug": "loamby",
    "ruleIndex": 15,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "piercing",
          "dice": 1,
          "die": "d4"
        }
      },
      "group": "brawling",
      "img": "icons/commodities/gems/gem-cluster-purple.webp",
      "key": "Strike",
      "label": "Crystal Spikes",
      "traits": [
        "agile",
        "finesse"
      ]
    },
    "translation": "水晶尖刺"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.M60UbMIdCYNv39zY",
    "itemType": "ancestry",
    "itemSlug": "ondi",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "bludgeoning",
          "dice": 1,
          "die": "d4"
        }
      },
      "group": "brawling",
      "img": "icons/magic/water/pseudopod-teal.webp",
      "key": "Strike",
      "label": "Tail",
      "traits": [
        "agile",
        "finesse"
      ],
      "slug": "tail"
    },
    "translation": "尾巴"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.M60UbMIdCYNv39zY",
    "itemType": "ancestry",
    "itemSlug": "ondi",
    "ruleIndex": 15,
    "rule": {
      "damage": {
        "base": {
          "damageType": "piercing",
          "dice": 1,
          "die": "d6"
        }
      },
      "group": "brawling",
      "img": "icons/weapons/polearms/trident-ice-blue.webp",
      "key": "Strike",
      "label": "Water Trident",
      "traits": [
        "thrown-20"
      ]
    },
    "translation": "水三叉戟"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.hhbCPox0bsMTGB4L",
    "itemType": "ancestry",
    "itemSlug": "blazey",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "bludgeoning",
          "dice": 1,
          "die": "d4"
        }
      },
      "group": "brawling",
      "img": "icons/sundries/lights/candle-lit-yellow.webp",
      "key": "Strike",
      "label": "Sconce",
      "traits": [
        "agile",
        "finesse"
      ]
    },
    "translation": "炬座"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.jncp24Q3gK9wWzKa",
    "itemType": "ancestry",
    "itemSlug": "cansear",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "slashing",
          "dice": 1,
          "die": "d4"
        }
      },
      "group": "brawling",
      "img": "icons/creatures/claws/pincer-crab-red.webp",
      "key": "Strike",
      "label": "Claw",
      "traits": [
        "agile",
        "finesse"
      ]
    },
    "translation": "螯"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.jtaHC7YbwylGkms2",
    "itemType": "ancestry",
    "itemSlug": "steg",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "piercing",
          "dice": 1,
          "die": "d6"
        }
      },
      "group": "brawling",
      "img": "icons/commodities/leather/scales-blue.webp",
      "key": "Strike",
      "label": "Thagomizer"
    },
    "translation": "尾刺"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.knIjl2cix2l3FfA7",
    "itemType": "ancestry",
    "itemSlug": "eddy",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "bludgeoning",
          "dice": 1,
          "die": "d6"
        }
      },
      "group": "brawling",
      "img": "icons/magic/water/pseudopod-swirl-blue.webp",
      "key": "Strike",
      "label": "Body"
    },
    "translation": "身体"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.knIjl2cix2l3FfA7",
    "itemType": "ancestry",
    "itemSlug": "eddy",
    "ruleIndex": 15,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "bludgeoning",
          "dice": 1,
          "die": "d4"
        }
      },
      "group": "brawling",
      "img": "icons/magic/water/pseudopod-teal.webp",
      "key": "Strike",
      "label": "Arm",
      "predicate": [
        {
          "or": [
            "encounter",
            "force-encounter",
            "evolution-condition"
          ]
        }
      ],
      "traits": [
        "agile",
        "finesse"
      ]
    },
    "translation": "手臂"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.mnDzzE00qWtpoQ65",
    "itemType": "ancestry",
    "itemSlug": "asteripple",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "bludgeoning",
          "dice": 1,
          "die": "d4"
        }
      },
      "group": "brawling",
      "img": "icons/magic/water/pseudopod-teal.webp",
      "key": "Strike",
      "label": "Arm",
      "traits": [
        "agile",
        "finesse"
      ]
    },
    "translation": "手臂"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.x6x7YLrM6egMatuv",
    "itemType": "ancestry",
    "itemSlug": "rocky",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "bludgeoning",
          "dice": 1,
          "die": "d6"
        }
      },
      "group": "brawling",
      "img": "icons/magic/earth/projectile-moonrock-asteroid.webp",
      "key": "Strike",
      "label": "Body"
    },
    "translation": "躯体"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.yAno41WD1nousJ6h",
    "itemType": "ancestry",
    "itemSlug": "seatoma",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "piercing",
          "dice": 1,
          "die": "d4"
        }
      },
      "group": "brawling",
      "img": "icons/creatures/abilities/mouth-teeth-rows-white.webp",
      "key": "Strike",
      "label": "Jaws",
      "traits": [
        "agile"
      ]
    },
    "translation": "噬咬"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.yAno41WD1nousJ6h",
    "itemType": "ancestry",
    "itemSlug": "seatoma",
    "ruleIndex": 15,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "bludgeoning",
          "dice": 1,
          "die": "d6"
        }
      },
      "group": "brawling",
      "img": "icons/creatures/claws/claw-curved-poison-purple.webp",
      "key": "Strike",
      "label": "Dactyl Club"
    },
    "translation": "指节棍"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-eldamon.Item.zhphkQ9JWu0aGDYK",
    "itemType": "ancestry",
    "itemSlug": "sparky",
    "ruleIndex": 14,
    "rule": {
      "category": "unarmed",
      "damage": {
        "base": {
          "damageType": "fire",
          "dice": 1,
          "die": "d4"
        }
      },
      "group": "brawling",
      "img": "icons/magic/fire/projectile-fireball-embers-yellow.webp",
      "key": "Strike",
      "label": "Ember",
      "traits": [
        "agile",
        "finesse"
      ]
    },
    "translation": "余烬"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-features.Item.P4cccKTmynPrbmEV",
    "itemType": "feat",
    "itemSlug": "air-element",
    "ruleIndex": 11,
    "rule": {
      "key": "FlatModifier",
      "selector": "reflex",
      "value": 1,
      "type": "circumstance",
      "label": "Effect: Elemental Shield",
      "predicate": [
        "self:effect:elemental-shield"
      ],
      "hideIfDisabled": true
    },
    "translation": "效果：元素护盾"
  },
  {
    "sourceId": "Compendium.battlezoo-eldamon-legends-pf2e.pf2e-features.Item.qi4He2kDGpXgICg1",
    "itemType": "feat",
    "itemSlug": "mortal-friend",
    "ruleIndex": 11,
    "rule": {
      "key": "FlatModifier",
      "selector": "skill-check",
      "type": "proficiency",
      "value": "match(when(lte(@actor.level, 4), 0), when(gte(@actor.level, 5), @actor.level))",
      "label": "Advanced Training"
    },
    "translation": "进阶训练"
  }
];
