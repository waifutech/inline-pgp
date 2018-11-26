const React = require('react')
const CSSTransitionGroup = require('react-addons-css-transition-group')

const style = require('./fade.sass')

module.exports = (props) => {
    const {children, ...rest} = props
    return (<CSSTransitionGroup
        transitionName="fade"
        transitionAppear={true}
        transitionEnter={true}
        transitionLeave={false}
        transitionAppearTimeout={150}
        transitionEnterTimeout={150}
        {...rest}
    >
        {children}
    </CSSTransitionGroup>)
}