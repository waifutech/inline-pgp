import cn from 'classnames'
import isObjectLike from 'lodash.isobjectlike'

export default (css) => (block) => (element = null, modifiers = {}) => {
    if (isObjectLike(element)) {
        modifiers = element
        element = null
    }
    const elementClass = element ? `${block}__${element}` : block

    return cn(css[elementClass], Object.keys(modifiers).filter(m => modifiers[m]).map(m => css[`${elementClass}--${m}`]))
}
