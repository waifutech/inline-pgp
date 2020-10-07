import React from 'react'
import CSSTransitionGroup from 'react-addons-css-transition-group'

import './fade.sass'

const Fade = (props) => {
    const { children, ...rest } = props

    return (<CSSTransitionGroup
        transitionName='fade'
        transitionAppear
        transitionEnter
        transitionLeave={false}
        transitionAppearTimeout={150}
        transitionEnterTimeout={150}
        {...rest}
    >
        {children}
    </CSSTransitionGroup>)
}

export default Fade
