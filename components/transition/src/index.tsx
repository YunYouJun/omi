/**
 * o-transition element based on vue-transition
 * Tom Fales (@enlightenmentor)
 * Licensed under the MIT License
 * https://github.com/enlightenmentor/vue-transition/blob/master/LICENSE
 *
 * modified by dntzhang
 *
 */

//todo duration and delay support

import { tag, WeElement } from 'omi'
import * as _domReady from 'dready'
// tslint:disable-next-line:no-duplicate-imports
import { default as _rollupDomReady } from 'dready'

const domReady = _rollupDomReady || _domReady

interface Props {
  name: string
  leavingTime?: number
  autoRemove?: boolean
  appear?: boolean
  disappear?: boolean
  delay?: number
}

@tag('o-transition')
export default class Transition extends WeElement<Props>{

  static propTypes = {
    name: String,
    leavingTime: Number,
    autoRemove: Boolean,
    appear: Boolean,
    disappear: Boolean,
    delay: Number
  }

  static isLightDom = true

  static defaultProps = {
    name: 'o',
    delay: 0
  }

  _show = true

  installed() {

    domReady(() => {
      if (this.props.appear) {
        this.enter()
      }
      if (this.props.leavingTime) {
        setTimeout(() => {
          this.leave()
        }, this.props.leavingTime)
      }
    })
  }

  receiveProps() {
    if (this.props.appear) {
      this.enter()
    }

    if (this.props.disappear) {
      this.leave()
    }

  }

  async toggle() {
    this._show = !this._show
    if (this._show)
      return await this.enter()
    else
      return await this.leave()
  }

  callback: () => void

  async enter() {
    return new Promise((resolve) => {
      const el = this.children[0]
      if (el) {
        this.fire('before-enter')
        el.classList.remove(this.props.name + '-leave-active')
        el.classList.remove(this.props.name + '-leave-to')
        el.classList.add(this.props.name + '-enter')
        el.classList.add(this.props.name + '-enter-active')

        this.callback = function () {
          el.classList.remove(this.props.name + '-enter-active')
          this.fire('after-enter')

          this._show = true
          resolve()
        }.bind(this)
        this.once('transitionend', this.callback)
        this.once('animationend', this.callback)

        window.setTimeout(function () {
          el.classList.remove(this.props.name + '-enter')
          el.classList.add(this.props.name + '-enter-to')
          this.fire('enter')
        }.bind(this), this.props.delay)
      }
    })
  }

  async leave() {
    return new Promise((resolve) => {
      const el = this.children[0]
      if (el) {
        this.fire('before-leave')
        el.classList.remove(this.props.name + '-enter-active')
        el.classList.remove(this.props.name + '-enter-to')
        el.classList.add(this.props.name + '-leave')
        el.classList.add(this.props.name + '-leave-active')

        this.callback = function (e) {

          el.classList.remove(this.props.name + '-leave-active')

          this.fire('after-leave')

          this._show = false
          if (this.props.autoRemove && this.parentNode) {
            this.parentNode.removeChild(this)
          }

          resolve()
        }.bind(this)
        this.once('transitionend', this.callback)
        this.once('animationend', this.callback)

        window.setTimeout(function () {
          el.classList.remove(this.props.name + '-leave')
          el.classList.add(this.props.name + '-leave-to')
          this.fire('leave')
        }.bind(this), this.props.delay)
      }
    })
  }

  once(name, callback) {
    const wrapCall = function () {
      this.removeEventListener(name, wrapCall)
      callback()
    }.bind(this)
    this.addEventListener(name, wrapCall)
  }

  render() {
    return
  }
}
