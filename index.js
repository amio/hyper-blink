const throttle = require('lodash.throttle')

const BUSY_TIMEOUT = 700  // ms
const BUSY_THROTTLE = BUSY_TIMEOUT / 2

module.exports.decorateConfig = config => {
  return Object.assign({}, config, {
    termCSS: `
      ${config.termCSS || ''}
      .cursor-node[focus=true]:not([hyper-blink-moving]) {
        animation: blink 1s ease infinite;
      }
      @keyframes blink {
        10%, 50% { opacity: 0 }
        60%, 100% { opacity: 1 }
      }
    `
  })
}

module.exports.decorateTerm = (Term, {React, notify}) => {
  return class extends React.Component {
    constructor (props, context) {
      super(props, context)
      this._onTerminal = this._onTerminal.bind(this)
      this._onCursorChange = this._onCursorChange.bind(this)
      this._updateCursorStatus = this._updateCursorStatus.bind(this)
      this._markBusyThrottled = throttle(this._markBusy.bind(this), BUSY_THROTTLE)
      this._markIdle = this._markIdle.bind(this)
    }

    _onTerminal (term) {
      /* eslint-disable prop-types */
      if (this.props.onTerminal) {
        this.props.onTerminal(term)
      }

      this._cursor = term.cursorNode_

      /* global MutationObserver */
      this._observer = new MutationObserver(this._onCursorChange)
      this._observer.observe(this._cursor, {
        attributes: true,
        childList: false,
        characterData: false
      })
    }

    _onCursorChange (mutations) {
      const cursorMoved = mutations.some(m => m.attributeName === 'title')
      if (cursorMoved) {
        this._updateCursorStatus()
      }
    }

    _updateCursorStatus () {
      this._markBusyThrottled()

      clearTimeout(this._markingTimer)
      this._markingTimer = setTimeout(() => {
        this._markIdle()
      }, BUSY_TIMEOUT)
    }

    _markBusy () {
      // console.log('!!! Cursor Moving !!!')
      this._cursor.setAttribute('hyper-blink-moving', true)
    }

    _markIdle () {
      // console.log('...idle...')
      this._cursor.removeAttribute('hyper-blink-moving')
    }

    render () {
      return React.createElement(Term, Object.assign({}, this.props, {
        onTerminal: this._onTerminal
      }))
    }

    componentWillUnmount () {
      if (this._observer) {
        this._observer.disconnect()
      }
    }
  }
}
