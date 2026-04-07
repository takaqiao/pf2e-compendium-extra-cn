Hooks.once('init', () => {
    if (typeof Babele !== 'undefined') {
        game.babele.register({
            module: 'pf2e-compendium-extra-cn',
            lang: 'cn',
            dir: 'compendium/cn'
        });

        console.log('pf2e-compendium-extra-cn | 第三方模组中文翻译已加载');
    }
});
