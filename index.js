exports.decorateConfig = config => {
  return Object.assign({}, config, {
    termCSS: `
      ${config.termCSS || ''}
      .cursor-node[focus=true] {
        animation: blink 1s ease infinite;
      }
      @keyframes blink {
        0%, 40% { opacity: 0 }
        50%, 90% { opacity: 1 }
      }
    `
  })
}
