Hooks.once('babele.init', (babele) => {
  if (typeof Babele !== 'undefined') {
    babele.register({
      module: 'pf2e-compendium-extra-cn',
      lang: 'cn',
      dir: 'compendium',
    });

    console.log('pf2e-compendium-extra-cn | 第三方模组中文翻译已加载');
  }
});
