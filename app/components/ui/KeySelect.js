const React = require('react')
const ReactDOM = require('react-dom')
const Autocomplete = require('react-autocomplete')

const Id = require('./Id')
const Keyring = require('../../Keyring')
const Settings = require('../../Settings')

const keys = () => Keyring.instance()

class KeySelect extends React.Component {
    constructor() {
        super()
        this.state = {options: [], query: null, focused: false}
        setTimeout(() => this.query(''))
    }

    query(query) {
        const {'private': p} = this.props
        this.setState({query, options: keys().find(query, {'private': p})})
    }

    focusInput() {
        ReactDOM.findDOMNode(this).querySelector('input').focus()
    }

    blurInput() {
        try {
            ReactDOM.findDOMNode(this).querySelector('input').blur()
        } catch(err) {
            console.error(err)
        }
    }

    selectKey(id) {
        const {currentEncryption, currentSign, onChange} = this.props

        this.blurInput()

        if(currentEncryption)
            Settings.setCurrentEncryptionKey(id)
        if(currentSign)
            Settings.setCurrentSignKey(id)

        onChange(id)

        this.query('')
    }

    render() {
        const {value, style, maxDropHeight} = this.props
        const {options, query, focused} = this.state

        return (
            <Autocomplete
                getItemValue={({id}) => id}
                items={options}
                renderItem={({id}, isHighlighted) =>
                    <div key={id} style={{
                        cursor: 'pointer',
                        background: (id === value || isHighlighted) ? 'whitesmoke' : 'white',
                        transition: 'background-color .15s',
                        padding: '4px'
                    }}>
                        <Id>{id}</Id>
                    </div>
                }
                renderInput={({onBlur, ...rest}) => {
                    const displayId = (!!value && !focused)

                    return (<div style={{
                        borderBottom: displayId && '1px solid grey',
                        height: '40px',
                        padding: '1px',
                        // overflow: 'hidden',
                        boxSizing: 'border-box',
                    }}>
                        {displayId
                            ? <Id key={value} style={{
                                cursor: 'pointer',
                                paddingTop: '2px',
                                transform: 'scale(0.9) translateY(-2px)',
                                transformOrigin: 'top left'
                            }} onClick={() =>
                                this.setState({focused: true}, () => this.focusInput())
                            }>{value}</Id>
                            : <input
                                {...rest}
                                style={{
                                    width: '100%',
                                    height: '40px',
                                }}
                                onBlur={(ev) => {
                                    this.setState({focused: false})
                                    !!onBlur && onBlur(ev)
                                }} />}
                    </div>)
                }}
                value={query == null ? value : query}
                onChange={(ev) => this.query(ev.target.value)}
                onSelect={this.selectKey.bind(this)}
                wrapperStyle={{
                    display: 'inline-block',
                    position: 'relative',
                    ...style,
                }}
                menuStyle={{
                    borderRadius: '3px',
                    boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
                    background: 'rgba(255, 255, 255, 0.9)',
                    padding: '2px 0',
                    fontSize: '90%',
                    position: 'absolute',
                    overflow: 'auto',
                    maxHeight: `${maxDropHeight || 400}px`,
                    width: '350px',
                    // maxHeight: '50%',
                    zIndex: '1',
                    bottom: '110%',
                    left: '0',
                    top: null,
                }}
            />
        )
    }
}

module.exports = KeySelect