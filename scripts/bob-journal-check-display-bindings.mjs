/** QA candidate, not a deployment approval. */
export const BINDINGS = [
  {
    "journalId": "GPl5VHF2ksW5wL8X",
    "pageId": "nk1c8QgLT7wGiRvG",
    "journalNames": [
      "8. The Vault",
      "第8章：地下密库 8. The Vault"
    ],
    "pageNames": [
      "The Onyx Ziggurat",
      "缟玛瑙塔庙 The Onyx Ziggurat"
    ],
    "journalFolder": "DHEv4fW8zYgduoWQ",
    "journalSourceUuid": null,
    "pageSourceUuid": null,
    "pageType": "text",
    "pageFormat": 1,
    "pageCategory": "VrsEhcOiMNSa3kiE",
    "pageFlags": {
      "pf2e-bastion-of-blasphemies": {
        "index": "H4"
      }
    },
    "journalFlags": {
      "core": {
        "sheetClass": "pf2e-bastion-of-blasphemies.BastionJournalSheet"
      }
    },
    "pageSystem": {},
    "forms": [
      {
        "kind": "raw",
        "source": "<section class=\"description\"><p>An immense, five-tiered ziggurat made of dark onyx rises from the cavern floor here, built up against the far wall. A central flight of stairs leads up to the ziggurat’s apex, where large stone double doors are set into the cavern wall.</p></section><section class=\"encounter\"><header class=\"split\"><h3 data-no-toc class=\"title\">Encounter</h3><p>Low 12</p><p class=\"creatures\">@UUID[Actor.YUJG5Ou3TJvt1eGI]{Aznithakantus}</p></header><figure class=\"portrait\"><img src=\"modules/pf2e-bastion-of-blasphemies/assets/actors/portraits/MummySphinxAznithakantus.webp\"><figcaption>Aznithakantus</figcaption></figure><div class=\"rules\"><p><strong>Creatures:</strong> One of Irrokcis’s oldest allies stands guard here, a sphinx named Aznithakantus who came here soon after his laboratory expansions uncovered the entrance to the soul vortex (area @UUID[.EPAmP1TdzmePRO9b]{I}). Irrokcis first made contact with Aznithakantus during an exploratory casting of @UUID[Compendium.pf2e.spells-srd.Item.yM3KTTSAIHhyuP14]{Dream Message} he’d developed to seek out and converse with like-minded worshippers of Charg. He’d done so in hopes of finding someone or something that could help him understand the incomplete soul anchor he’d discovered deep below Castle Arudora. Aznithakantus was intrigued by his research, made the long journey to Castle Arudora to join Irrokcis, and served as his assistant for many years.</p></div></section><p>When the curse struck, Aznithakantus died and then rose swiftly as an undead, desiccated version of herself. Now a mummy, she’s settled into a sort of guardian role for the entrance to Irrokcis’s domain, content to spend most of her time simply relaxing and soaking up the ambient fearsome energies that suffuse her new home.</p><p>Upon spotting the PCs, though, Aznithakantus perks up, as she doesn’t often have visitors. She calls out to them as they draw near, demanding to know their purpose in visiting “Lord Irrokcis’s laboratory.” She confirms that this location lies beyond the doors she guards but also notes that none can enter, for “the lord has been at toil on a great project these past few centuries and must not be disturbed.” As she speaks, she idly tosses a glowing crystal back and forth in her paws—something the PCs should immediately recognize as a @UUID[Compendium.pf2e.equipment-srd.Item.05h3LWflr74iJiVg]{major soulheart}.</p><p>Fortunately for the PCs, Aznithakantus is somewhat bored. If they ask her for a favor—be it information about Irrokcis, access to the laboratory beyond, or to bargain for the shiny gemstone she’s playing with—a thoughtful expression crosses her dry, leathery visage before she says, “Prove to me you are worthy of the Arudora secrets, and perhaps we can do business.”</p><p>Each favor the PCs ask of her must be paid for in a gift of their own knowledge about Bastardhall, the curse, or any of the Arudoras. They share this knowledge in the form of answering a strange riddle she composes on the spot about one of those topics. In order to earn her favor, the party must correctly answer one to three of these riddles while risking her ire should they answer poorly. Knowledge “prices” for three example favors are listed below; use these values to estimate the price she’d ask for other favors not listed.</p><ul><li><p><strong>Knowledge Trade:</strong> For the cost of one correct simple answer, Aznithakantus agrees to tell the PCs what she knows of one key subject matter associated with Bastardhall. For each of these, she can convey information equivalent to 1 Research point on any of the research topics presented in @UUID[JournalEntry.YwM6UU2fCnRTjzO2.JournalEntryPage.UUqGlDCzpRnwqovv]{The Bastardhall Curse}, with the exception of Florin Kindler. Her knowledge of these topics comes to her in “dreams and visions,” and since Florin is a very new addition to the castle’s victims, she hasn’t been present long enough for Aznithakantus to notice her.</p></li><li><p><strong>Spellcasting Services:</strong> For the cost of one correct difficult answer, Aznithakantus agrees to cast one of her innate spells for the PCs.</p></li><li><p><strong>Major Soulheart:</strong> Aznithakantus agrees to hand over the <em>major soulheart</em> to the PCs at the cost of two correct difficult answers.</p></li><li><p><strong>Access to Irrokcis’s Laboratory:</strong> For the cost of two simple and two difficult answers, Aznithakantus steps aside and won’t oppose the PCs’ entry into the laboratory, although she warns them there are guardians and wards within that might well lay them low and that it’s not her place to aid the PCs in navigating them.</p></li></ul><p>When she asks her riddle, you can pose the question to the PCs for them to answer based on player knowledge, but it might be easier to simulate the answer by simply having a PC answer her riddles by attempting a DC 28 skill check for a simple question or a DC 32 skill check for a difficult one. The skill in question can be any of the following, depending on the flavor of the question:</p><ul><li><p>@Check[architecture-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[architecture-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li><li><p>@Check[genealogy-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[genealogy-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li><li><p>@Check[heraldry-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[heraldry-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li><li><p>@Check[occultism|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[occultism|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li><li><p>@Check[society|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[society|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li></ul><p>If a PC fails their check, Aznithakantus sneers and gleefully notes that their intellect doesn’t brand them as worthy of that favor, forbidding that particular PC from answering questions again. A critical failure insults Aznithakantus (as does any display of overt rudeness or obvious attempts to steal the <em>soulheart</em> or to enter the laboratory) and compels her to attack. (If you’re asking the players to answer these riddles with their own knowledge, a player who answers two questions wrong is cut off from further answers, and if they insist on answering a third time—or once all the players are cut off—Aznithakantus attacks.)</p><p>If combat begins, her roars are enough to draw any surviving gugs from area @UUID[.oEtULN89SUVVuFR7]{H2} to aid her in battle—you can assume these gugs arrive in pairs once every 3 rounds of combat. If the PCs don’t defeat them quickly, this fight can swiftly spiral out of control. Aznithakantus’s first act in combat is to cast @UUID[Compendium.pf2e.spells-srd.Item.8Umt1AzYfFbC4fui]{Spellwrack} on a character she suspects might be the recipient of another PC’s magic, then follows that up with @UUID[Compendium.pf2e.spells-srd.Item.KSAEhNfZyXMO7Z7V]{Outcast’s Curse} on that PC. She then uses melee Strikes on PCs closest to her (or daze against foes who remain at range). She fights until destroyed but doesn’t pursue the PCs far from her perch here.</p><p><strong>Hazard:</strong> Aznithakantus has protected the entrance to area @UUID[.i2pRckD9YVygbyxz]{H5} with a Riddler’s Rune (7th-rank @UUID[Compendium.pf2e.spells-srd.Item.R8bqnYiThB6MYTxD]{Phantom Pain})—something she doesn’t tell the PCs and expects them to deal with on their own. If the PCs trigger the rune, she giggles in delight at the results but only attacks if the PCs do so first, perhaps in anger that she didn’t warn them in the first place about the trap. The riddle glows softly on the door as soon as the PCs approach: “When bloodline breaks and form betrays, whose claws twist grace through sudden decay?” The answer is Charg and allows the PCs to pass unharmed.</p><section class=\"treasure\"><header><h4 data-no-toc>Treasure</h4><p></p></header><p>The first PC to touch the <em>major soulheart</em> Aznithakantus has receives a brief memory of Aron Mordimus and his lover Brensen Firecask as the two creep about in the Bastardhall dungeon. The two are obviously drunk and have come to the mysterious stairs leading down to the vault. The two playfully dare each other to descend the stairs, and eventually, Brensen gives in... but less than a minute after he descends out of sight, he returns utterly sober, racing up the stairs, with his face pale and expression fearful. He’s unwilling to return, and he never tells Aron what he saw down those steps.</p></section><section class=\"milestone\"><header><h4 data-no-toc>Reward</h4></header><p>If the PCs manage to navigate this encounter without combat by successfully answering Aznithakantus’s riddles, grant them XP as if they’d defeated her in combat, plus an additional 10 XP per riddle answered, to a maximum reward of 60 XP for answering riddles.</p></section>"
      },
      {
        "kind": "current-approved-cn",
        "source": "<section class=\"description\"><p>一座以漆黑缟玛瑙筑成的巨大五层塔庙，在此紧靠远处岩壁，从洞穴地面拔地而起。中央楼梯通向塔庙顶端，那里洞壁内嵌着一扇巨大双开石门。</p></section><section class=\"encounter\"><header class=\"split\"><h3 data-no-toc class=\"title\">遭遇</h3><p>低度12</p><p class=\"creatures\">@UUID[Actor.YUJG5Ou3TJvt1eGI]{阿兹尼萨坎图斯}</p></header><figure class=\"portrait\"><img src=\"modules/pf2e-bastion-of-blasphemies/assets/actors/portraits/MummySphinxAznithakantus.webp\"><figcaption>阿兹尼萨坎图斯</figcaption></figure><div class=\"rules\"><p><strong>生物：</strong>伊罗克西斯最早的盟友之一在此守卫。她是名叫阿兹尼萨坎图斯的斯芬克斯，在他扩建实验室、发现灵魂漩涡（区域@UUID[.EPAmP1TdzmePRO9b]{I}）入口后不久来到这里。伊罗克西斯最初通过一次探索性的@UUID[Compendium.pf2e.spells-srd.Item.yM3KTTSAIHhyuP14]{托梦术}与她联系；他改进这种施法方式，寻找并联系志同道合的查尔格崇拜者，希望找到能够帮助理解阿鲁多拉城堡深处那座未完成灵魂之锚的人或物。阿兹尼萨坎图斯对研究很感兴趣，长途跋涉来到城堡与他会合，并担任了多年助手。</p></div></section><p>诅咒降临时，阿兹尼萨坎图斯死去，随后迅速以干瘪的不死形态起身。如今成了木乃伊的她，安于担当伊罗克西斯领地入口的守卫，大部分时间只是休憩，吸收遍布新居的恐惧能量。</p><p>不过看见PC时，阿兹尼萨坎图斯会精神一振，因为她很少有访客。他们走近时，她会出声喝问来访“伊罗克西斯领主实验室”的目的。她确认实验室就在自己守护的门后，却也声明无人可入，因为“领主过去几个世纪一直忙于伟大计划，不容打扰”。说话时，她漫不经心地用双爪抛接一块发光水晶——PC应该立即认出，那是一枚@UUID[Compendium.pf2e.equipment-srd.Item.05h3LWflr74iJiVg]{上等魂心}。</p><p>幸运的是，阿兹尼萨坎图斯有些无聊。如果PC请求她帮忙，无论是打听伊罗克西斯、进入门后实验室，还是商量取得她把玩的闪亮宝石，她干燥如皮革的脸上都会浮现沉思，随后说道：“证明你们配得上阿鲁多拉的秘密，也许我们就能交易。”</p><p>PC向她请求的每项帮助，都必须用自己关于孽裔厅堂、诅咒或任一阿鲁多拉族人的知识支付。他们通过回答她当场围绕某个课题编出的古怪谜题，分享这些知识。要得到帮助，队伍须答对一至三道谜题，但答得不好就可能招致她的怒火。下列三类示例帮助给出了知识“价格”；对于未列出的其他帮助，可用这些数值估计她的要价。</p><ul><li><p><strong>交换知识：</strong>答对一道简单问题，阿兹尼萨坎图斯就会告诉PC自己知道的一个孽裔厅堂重要主题的情报。每次可传授相当于1研究点的情报，适用于“@UUID[JournalEntry.YwM6UU2fCnRTjzO2.JournalEntryPage.UUqGlDCzpRnwqovv]{孽裔厅堂诅咒}”中的任何研究课题，唯独弗洛琳·金德勒除外。她关于这些课题的知识来自“梦境与幻视”，而弗洛琳是城堡受害者中极新的一员，来到这里尚不足以让她注意。</p></li><li><p><strong>施法服务：</strong>答对一道困难问题，阿兹尼萨坎图斯就同意为PC施放一个内在法术。</p></li><li><p><strong>上等魂心：</strong>答对两道困难问题，阿兹尼萨坎图斯就同意将<em>上等魂心</em>交给PC。</p></li><li><p><strong>进入伊罗克西斯的实验室：</strong>答对两道简单和两道困难问题，阿兹尼萨坎图斯就会让路，不阻止PC进入实验室，不过她会警告，里面有足以击倒他们的守卫与防护，而帮助PC应对这些危险并非她的职责。</p></li></ul><p>她出谜时，你可以把问题交给PC，让玩家凭知识回答；不过更简单的模拟方式，是让PC对简单问题进行DC 28技能检定，对困难问题进行DC 32技能检定。根据问题性质，可用技能包括以下任一种：</p><ul><li><p>@Check[architecture-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[architecture-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li><li><p>@Check[genealogy-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[genealogy-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li><li><p>@Check[heraldry-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[heraldry-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li><li><p>@Check[occultism|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[occultism|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li><li><p>@Check[society|dc:28|name:Answer Riddle|options:aznithakantus-riddle] @Check[society|dc:32|name:Answer Riddle|options:aznithakantus-riddle]</p></li></ul><p>PC检定失败时，阿兹尼萨坎图斯会讥笑，欢快地指出其才智不配得到这项帮助，并禁止该PC再次回答。大失败会冒犯阿兹尼萨坎图斯（明显无礼、明显试图盗取<em>魂心</em>或闯入实验室亦然），促使她发动攻击。（若让玩家凭自身知识回答，答错两题的玩家就不能继续作答；如果还坚持第三次回答，或所有玩家都已失去资格，阿兹尼萨坎图斯便会攻击。）</p><p>战斗开始后，她的吼声足以吸引区域@UUID[.oEtULN89SUVVuFR7]{H2}存活的古革巨人前来助战——可假定每3轮有两名古革巨人抵达。PC若不能迅速解决敌人，战斗很快就会失控。阿兹尼萨坎图斯首先对一名她认为可能受到其他PC魔法帮助的角色施放@UUID[Compendium.pf2e.spells-srd.Item.8Umt1AzYfFbC4fui]{法力迸裂}，随后对同一PC施放@UUID[Compendium.pf2e.spells-srd.Item.KSAEhNfZyXMO7Z7V]{流放诅咒}。之后，她近战打击最近的PC（或用晕眩术对付远处敌人）。她战斗到被摧毁为止，但不会远离此处据点追击PC。</p><p><strong>危害：</strong>阿兹尼萨坎图斯用一道谜语人的符文保护区域@UUID[.i2pRckD9YVygbyxz]{H5}的入口（7环@UUID[Compendium.pf2e.spells-srd.Item.R8bqnYiThB6MYTxD]{幻痛术}）；她不告诉PC这件事，指望他们自行处理。PC若触发符文，她会幸灾乐祸地咯咯笑，但只有PC先攻击她才会还击——也许PC会因她事先不警告陷阱而愤怒动手。PC一走近，门上便会浮现微光谜语：“血脉断裂，形躯背叛，谁的利爪借骤然腐朽将优雅扭转？”答案是查尔格，可让PC毫发无伤地通过。</p><section class=\"treasure\"><header><h4 data-no-toc>宝藏</h4><p></p></header><p>第一个碰触阿兹尼萨坎图斯所持<em>上等魂心</em>的PC，会看到一段短暂记忆，看见阿隆·莫迪穆斯与情人布伦森·火桶在孽裔厅堂地牢中鬼鬼祟祟地游荡。两人显然都喝醉了，来到通往地下密库的神秘楼梯前，嬉闹着激将对方下去。最终布伦森让步……但他下行消失在视线中后不到一分钟，就彻底清醒地飞奔上楼，脸色苍白，神情恐惧。他不肯再下去，也始终没有告诉阿隆自己在楼梯下看见了什么。</p></section><section class=\"milestone\"><header><h4 data-no-toc>奖励</h4></header><p>如果PC成功回答阿兹尼萨坎图斯的谜题，不经战斗便通过此遭遇，给予如同在战斗中击败她的XP；每答对一题再奖励10 XP，答谜奖励至多60 XP。</p></section>"
      }
    ],
    "macros": [
      {
        "batch": 54,
        "index": 49,
        "rowOneBased": 50,
        "blockId": "GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5071:5230",
        "macro": "@Check[architecture-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle]",
        "core": "@Check[architecture-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle]",
        "sourceLabel": null,
        "translatedLabel": null,
        "type": "architecture-lore",
        "nativeFallbackLabel": "Architecture Lore",
        "displayLabel": "建筑学识",
        "dc": "28",
        "rollOptions": "aznithakantus-riddle",
        "titleBefore": "Answer Riddle",
        "titleAfter": "回答谜题",
        "titleStatus": "source-derived-composition-for-root-review",
        "blockApprovalSha256": "dbfa91c02ebad8ca9cb7e755769140f20e111a656cbf8ef2af8c2bbb64228fef"
      },
      {
        "batch": 54,
        "index": 49,
        "rowOneBased": 50,
        "blockId": "GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5071:5230",
        "macro": "@Check[architecture-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]",
        "core": "@Check[architecture-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]",
        "sourceLabel": null,
        "translatedLabel": null,
        "type": "architecture-lore",
        "nativeFallbackLabel": "Architecture Lore",
        "displayLabel": "建筑学识",
        "dc": "32",
        "rollOptions": "aznithakantus-riddle",
        "titleBefore": "Answer Riddle",
        "titleAfter": "回答谜题",
        "titleStatus": "source-derived-composition-for-root-review",
        "blockApprovalSha256": "dbfa91c02ebad8ca9cb7e755769140f20e111a656cbf8ef2af8c2bbb64228fef"
      },
      {
        "batch": 55,
        "index": 0,
        "rowOneBased": 1,
        "blockId": "GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5246:5399",
        "macro": "@Check[genealogy-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle]",
        "core": "@Check[genealogy-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle]",
        "sourceLabel": null,
        "translatedLabel": null,
        "type": "genealogy-lore",
        "nativeFallbackLabel": "Genealogy Lore",
        "displayLabel": "族谱学识",
        "dc": "28",
        "rollOptions": "aznithakantus-riddle",
        "titleBefore": "Answer Riddle",
        "titleAfter": "回答谜题",
        "titleStatus": "source-derived-composition-for-root-review",
        "blockApprovalSha256": "127bbda54fd9a27cbe7e4568ced8f4e45dc6787399d0ce1cb85151cd30708d36"
      },
      {
        "batch": 55,
        "index": 0,
        "rowOneBased": 1,
        "blockId": "GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5246:5399",
        "macro": "@Check[genealogy-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]",
        "core": "@Check[genealogy-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]",
        "sourceLabel": null,
        "translatedLabel": null,
        "type": "genealogy-lore",
        "nativeFallbackLabel": "Genealogy Lore",
        "displayLabel": "族谱学识",
        "dc": "32",
        "rollOptions": "aznithakantus-riddle",
        "titleBefore": "Answer Riddle",
        "titleAfter": "回答谜题",
        "titleStatus": "source-derived-composition-for-root-review",
        "blockApprovalSha256": "127bbda54fd9a27cbe7e4568ced8f4e45dc6787399d0ce1cb85151cd30708d36"
      },
      {
        "batch": 55,
        "index": 1,
        "rowOneBased": 2,
        "blockId": "GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5415:5566",
        "macro": "@Check[heraldry-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle]",
        "core": "@Check[heraldry-lore|dc:28|name:Answer Riddle|options:aznithakantus-riddle]",
        "sourceLabel": null,
        "translatedLabel": null,
        "type": "heraldry-lore",
        "nativeFallbackLabel": "Heraldry Lore",
        "displayLabel": "纹章学识",
        "dc": "28",
        "rollOptions": "aznithakantus-riddle",
        "titleBefore": "Answer Riddle",
        "titleAfter": "回答谜题",
        "titleStatus": "source-derived-composition-for-root-review",
        "blockApprovalSha256": "c631c87b225dfb40f22b21c13342bbed85e00a90047444408fc9502f6191d977"
      },
      {
        "batch": 55,
        "index": 1,
        "rowOneBased": 2,
        "blockId": "GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5415:5566",
        "macro": "@Check[heraldry-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]",
        "core": "@Check[heraldry-lore|dc:32|name:Answer Riddle|options:aznithakantus-riddle]",
        "sourceLabel": null,
        "translatedLabel": null,
        "type": "heraldry-lore",
        "nativeFallbackLabel": "Heraldry Lore",
        "displayLabel": "纹章学识",
        "dc": "32",
        "rollOptions": "aznithakantus-riddle",
        "titleBefore": "Answer Riddle",
        "titleAfter": "回答谜题",
        "titleStatus": "source-derived-composition-for-root-review",
        "blockApprovalSha256": "c631c87b225dfb40f22b21c13342bbed85e00a90047444408fc9502f6191d977"
      }
    ],
    "approvalReferences": [
      "canonical/field-translations.json:journal[5].name",
      "canonical/field-translations.json:journal[5].pages[10].name",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/8764:9023",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/8741:8747",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/8072:8676",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/8040:8048",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/7306:7986",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/6544:7299",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5897:6537",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5741:5880",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5582:5725",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5415:5566",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5246:5399",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/5071:5230",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/4669:5056",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/4317:4652",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/4148:4301",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/3980:4132",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/3326:3964",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/2779:3311",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/2405:2772",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/1784:2398",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/1452:1777",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/661:1429",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/604:617",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/409:453",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/378:384",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/361:370",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/nk1c8QgLT7wGiRvG/32:268"
    ]
  },
  {
    "journalId": "GPl5VHF2ksW5wL8X",
    "pageId": "EPAmP1TdzmePRO9b",
    "journalNames": [
      "8. The Vault",
      "第8章：地下密库 8. The Vault"
    ],
    "pageNames": [
      "Soul Vortex",
      "灵魂漩涡 Soul Vortex"
    ],
    "journalFolder": "DHEv4fW8zYgduoWQ",
    "journalSourceUuid": null,
    "pageSourceUuid": null,
    "pageType": "text",
    "pageFormat": 1,
    "pageCategory": "VrsEhcOiMNSa3kiE",
    "pageFlags": {
      "pf2e-bastion-of-blasphemies": {
        "index": "I"
      }
    },
    "journalFlags": {
      "core": {
        "sheetClass": "pf2e-bastion-of-blasphemies.BastionJournalSheet"
      }
    },
    "pageSystem": {},
    "forms": [
      {
        "kind": "raw",
        "source": "<p>The long tunnel that leads south from the laboratory grows increasingly cold and moist as the PCs continue, descending several natural terraces with large steps until they finally reach a chamber directly below the hanging tower of Bastardhall above.</p><section class=\"description\"><p>The wide tunnel comes to a sudden end over what appears to be a bottomless pit that drops away into an eternity of glowing green mist. Above, the ceiling rises up like an inverted funnel to a height of two-hundred feet at its apex from the tunnel edge. On the ceiling, large pools of what looks like water collect in puddles and blobs, as if gravity itself had been inverted. At the center of the space churns a whirling mass of blue and green energy, a slowly spinning vortex made up of thousands of distorted ghosts and tormented wailing spirits. The screams from these ghosts fill the room, or so it seems at first, for after a few moments, it becomes apparent the screaming of these myriad souls is all in the mind.</p></section><p>This room opens directly into the Ethereal Plane. A PC who steps into it doesn’t fall and finds they can move about through force of will in the area as if they had a fly Speed equal to their base Speed, and if they don’t take an action to Fly, they don’t fall—they simply float in place. Those who seek to head out into the vast below once the mist is gone are at risk of becoming lost in the Ethereal Plane if they travel out of sight of the mass of rock “above” that is Bastardhall.</p><p>The “water” pooling above is in fact raw ectoplasm—a side effect, almost like sweat, formed from the churning of the soul vortex, which fills the central portion of this area.</p><p>Before the curse, this chamber contained an ancient but incomplete object known as a <em>soul anchor</em>—a corruption of the River of Souls that sometimes allowed those who perished in its vicinity to retain their memories after death. Irrokcis discovered the partially completed <em>soul anchor</em> and tried for a time to complete it, then turned his attention to reverse engineering it. Before he could make any progress, though, the curse took everything away and used the <em>soul anchor</em> as a catalyst, transforming it into a soul vortex. This vortex contains all of the souls of those who perished that night as well as the souls of all Arudoras who were brought to Bastardhall since then. Other creatures that find their way into the area sometimes become caught by the soul vortex too, and over the course of centuries, it has grown full and is close to bursting. When the last Arudora is fully absorbed into the soul vortex, Caydserris can transport the castle fully back to Golarion to establish it as a locus for Charg’s power in the heart of Avistan.</p><p>The soul vortex is frightening and unsettling, but it has no ability to affect a living creature—the PCs can pass through the vortex with little more than a case of gooseflesh and the weird sensation of someone walking over their grave. If a PC dies in such close proximity, though, their soul is automatically swept up in the vortex—any attempt to restore them to life that isn’t attempted in this room must succeed at a @Check[flat|dc:11] or fail to bring them back to life.</p><section class=\"encounter\"><header class=\"split\"><h3 data-no-toc class=\"title\">Encounter</h3><p>Severe 12</p><p class=\"creatures\">@UUID[Actor.95TfQgYDh4rl6SgP]{Mymnians x2}</p></header><figure class=\"portrait\"><img src=\"modules/pf2e-bastion-of-blasphemies/assets/actors/portraits/SahkilMymnian.webp\"><figcaption>Mymnian</figcaption></figure><div class=\"rules\"><p><strong>Creatures:</strong> A pair of powerful mymnian sahkils, fiends who embody the primal fear of ghosts and vengeance from beyond the grave, have come here to bask in the strange energies exuded by the soul vortex. Unlike the PCs, sahkils are affected by this chamber—they become quickened as long as they remain in this room and can use the extra action only to Fly. The energies also affect the sahkils as if they were mildly drunk, and they function as if @UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{Sickened 1} as well. When the PCs arrive, the sahkils are in the center of the cave near the soul vortex. They don’t immediately notice the PCs, but once they do, they attack and fight to the death.</p></div></section><section class=\"research\"><header><h4>Research</h4><p><strong>Any Research Topic</strong> (see below)</p></header><p><strong>Communion with the Soul Vortex:</strong> Once the sahkils are dealt with, the souls trapped in the vortex are able to communicate with the PCs, but this communication is random and undirected; each time a soul passes through a PC, they experience a random memory fragment—the scent of a rose, the sting of a bee, the taste of fine wine, sadness from a broken heart, and so on.</p><p>These souls know much, and a PC who spends a minute @UUID[Compendium.pf2e.actionspf2e.Item.EwgTZBWsc8qKaViP]{Investigating} or @UUID[Compendium.pf2e.actionspf2e.Item.TiNDYUGlMmxzxBYU]{Searching} the area realizes that they can open their mind and concentrate to become more receptive to these souls. Doing so allows the PCs to Research any and all of the Research topics listed in @UUID[JournalEntry.YwM6UU2fCnRTjzO2.JournalEntryPage.gRFl7AZFdxcRUo8n]{The Bastardhall Curse} journal category, provided they know that topic exists to research—only the topic of Florin Kindler can’t be researched here, as her soul hasn’t yet been taken by the soul vortex. They can research like this as many times as they want, but only to a maximum number of 5 RP per day, and unlike other research opportunities, there are real dangers to exposing yourself to the dead for too long! Each attempt to commune with the soul vortex takes 1 hour.</p><p><strong>Maximum RP</strong> 5 per day; <strong>Research Checks</strong> @Check[occultism|dc:28|name:Research|options:action:research|traits:concentrate,exploration] or @Check[religion|dc:30|name:Research|options:action:research|traits:concentrate,exploration] to understand the perils and tricks of speaking with souls, @Check[will|dc:32|name:Research|options:action:research|traits:concentrate,exploration] save to resist being unsettled and baffled by the rush of information, or @Check[perception|dc:35|name:Research|options:action:research|traits:concentrate,exploration] to simply absorb what the souls have to share on the topic. A PC who fails a Research check becomes @UUID[Compendium.pf2e.conditionitems.Item.e1XGnhKNSQIm5IXg]{Stupefied 1} with an unlimited duration, while a PC who critically fails becomes @UUID[Compendium.pf2e.conditionitems.Item.e1XGnhKNSQIm5IXg]{Stupefied 2} with an unlimited duration, as portions of their own memories are scrambled and lost. This can be removed with proper methods and is a 12th-level curse effect with a @Check[counteract|dc:32|name:Counteract Curse].</p></section>"
      },
      {
        "kind": "current-approved-cn",
        "source": "<p>从实验室向南延伸的长隧道，随着PC前进变得愈发寒冷潮湿，沿大台阶降过几级天然平台，最终到达正处于上方孽裔厅堂悬塔之下的房间。</p><section class=\"description\"><p>宽阔隧道突然终止于一座看似无底的深坑上方，深坑向下伸入无穷无尽的发光绿雾。上方天花板像倒置漏斗般抬升，顶点距离隧道边缘高两百尺。洞顶聚着大片似水的液体，形成水洼与水团，仿佛重力本身被颠倒。空间中央翻涌着一团蓝绿能量，缓缓旋转的漩涡由数千个扭曲幽灵与痛苦哀号的灵魂组成。幽灵尖叫似乎充满房间，但片刻后便会明白，无数灵魂的尖叫全都响在脑海中。</p></section><p>这个房间直接通向灵界。PC踏入其中不会坠落，而会发现自己可以凭意志在区域内移动，仿佛拥有等同基本速度的飞行速度；即使不花动作飞行，也不会落下，只会悬浮原地。雾气散去后，若有人想前往辽阔的下方，离开“上方”孽裔厅堂所在岩体的视线范围，就有在灵界迷失的风险。</p><p>上方汇聚的“水”其实是原始灵质，如同汗液般的副产物，由占据本区域中央的灵魂漩涡不断翻涌而成。</p><p>诅咒降临前，这间洞室内有一件古老却未完成、名为<em>灵魂之锚</em>的物件；它是对灵魂之河的扭曲，有时能让附近死者在死后保留记忆。伊罗克西斯发现这座未完成的<em>灵魂之锚</em>后，曾试图完成它，之后又转向逆向解析。但还未有任何进展，诅咒就夺走了一切，并以<em>灵魂之锚</em>为催化，将其化为灵魂漩涡。漩涡中包含当夜死去者的全部灵魂，以及此后被带到孽裔厅堂的所有阿鲁多拉族人的灵魂。其他进入本区域的生物有时也会被卷入；几个世纪过去，漩涡已近饱和，即将爆裂。最后一名阿鲁多拉族人被完全吸入灵魂漩涡时，凯德瑟里斯便能将整座城堡完整送回格拉利昂，使其成为查尔格在阿维斯坦腹地的力量据点。</p><p>灵魂漩涡骇人不安，却无法影响活物——PC穿过其中，最多只会起一身鸡皮疙瘩，并有种仿佛有人踏过自己坟墓的古怪感觉。不过，如果PC死在如此近处，灵魂便会自动被漩涡卷入；任何不在本房间内进行的复活尝试，都必须通过@Check[flat|dc:11]，否则无法使其复生。</p><section class=\"encounter\"><header class=\"split\"><h3 data-no-toc class=\"title\">遭遇</h3><p>严重12</p><p class=\"creatures\">@UUID[Actor.95TfQgYDh4rl6SgP]{弥姆尼安魔 x2}</p></header><figure class=\"portrait\"><img src=\"modules/pf2e-bastion-of-blasphemies/assets/actors/portraits/SahkilMymnian.webp\"><figcaption>弥姆尼安魔</figcaption></figure><div class=\"rules\"><p><strong>生物：</strong>两只强大的弥姆尼安恐亡魔来到这里，沐浴灵魂漩涡散出的奇异能量；这些魔族体现了对幽灵与死后复仇的原始恐惧。与PC不同，恐亡魔会受本房间影响——只要待在这里，就获得迅捷，额外动作只能用于飞行。能量还会使恐亡魔如同微醉，亦视为@UUID[Compendium.pf2e.conditionitems.Item.fesd1n5eVhpCSS18]{恶心1}。PC抵达时，恐亡魔在洞穴中央、灵魂漩涡附近。它们不会立刻发现PC，但一旦发现，就会攻击，战斗至死。</p></div></section><section class=\"research\"><header><h4>研究</h4><p><strong>任意研究课题</strong>（见下文）</p></header><p><strong>与灵魂漩涡沟通：</strong>处理完恐亡魔，困在漩涡中的灵魂就能与PC交流，但这种交流随机而无方向；每当灵魂穿过一名PC，PC就会经历一段随机记忆碎片——玫瑰的芬芳、蜂螫的刺痛、美酒的滋味、心碎的悲伤，等等。</p><p>这些灵魂知晓甚多；PC在区域内@UUID[Compendium.pf2e.actionspf2e.Item.EwgTZBWsc8qKaViP]{调查}或@UUID[Compendium.pf2e.actionspf2e.Item.TiNDYUGlMmxzxBYU]{搜寻}一分钟，就会意识到可以敞开心灵、集中精神，更好地接纳这些灵魂。如此一来，只要知道有相应课题可研究，PC就能研究“@UUID[JournalEntry.YwM6UU2fCnRTjzO2.JournalEntryPage.gRFl7AZFdxcRUo8n]{孽裔厅堂诅咒}”日志类别中列出的任何乃至全部课题；唯独弗洛琳·金德勒不行，因为她的灵魂尚未被灵魂漩涡夺取。PC可以无限次如此研究，但每天最多获得5 RP；而且不同于其他研究机会，与死者接触太久确有危险！每次尝试与灵魂漩涡沟通需要1小时。</p><p><strong>RP上限</strong>每天5；<strong>研究检定</strong>@Check[occultism|dc:28|name:Research|options:action:research|traits:concentrate,exploration]或@Check[religion|dc:30|name:Research|options:action:research|traits:concentrate,exploration]，理解与灵魂交谈的危险及技巧；@Check[will|dc:32|name:Research|options:action:research|traits:concentrate,exploration]豁免，抵抗信息洪流带来的不安与困惑；或@Check[perception|dc:35|name:Research|options:action:research|traits:concentrate,exploration]，单纯吸收灵魂分享的该课题信息。研究检定失败的PC会@UUID[Compendium.pf2e.conditionitems.Item.e1XGnhKNSQIm5IXg]{呆滞1}，持续时间无限；大失败则@UUID[Compendium.pf2e.conditionitems.Item.e1XGnhKNSQIm5IXg]{呆滞2}，持续时间无限，因为自身部分记忆被打乱丢失。该效果可以用恰当方法移除，是12级诅咒效应，反制检定为@Check[counteract|dc:32|name:Counteract Curse]。</p></section>"
      }
    ],
    "macros": [
      {
        "batch": 55,
        "index": 12,
        "rowOneBased": 13,
        "blockId": "GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/5800:6903",
        "macro": "@Check[counteract|dc:32|name:Counteract Curse]",
        "core": "@Check[counteract|dc:32|name:Counteract Curse]",
        "sourceLabel": null,
        "translatedLabel": null,
        "type": "counteract",
        "nativeFallbackLabel": "Counteract",
        "displayLabel": "反制",
        "dc": "32",
        "rollOptions": null,
        "titleBefore": "Counteract Curse",
        "titleAfter": "反制诅咒",
        "titleStatus": "source-derived-composition-for-root-review",
        "blockApprovalSha256": "1613f888a62f27a020f97af7a386170d554168babc05b28a71c41fffea3c1e39"
      }
    ],
    "approvalReferences": [
      "canonical/field-translations.json:journal[5].name",
      "canonical/field-translations.json:journal[5].pages[13].name",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/5800:6903",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/4867:5793",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/4476:4860",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/4413:4460",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/4397:4405",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/3618:4339",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/3567:3574",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/3385:3427",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/3351:3360",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/3334:3343",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/2775:3251",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/1699:2768",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/1517:1692",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/1025:1510",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/289:1008",
      "canonical/journal-blocks.json:GPl5VHF2ksW5wL8X/EPAmP1TdzmePRO9b/3:253"
    ]
  }
];
