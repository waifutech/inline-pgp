import React from 'react'

import Checkbox from './ui/Checkbox'
import Fade from './ui/Fade'
import KeySelect from './ui/KeySelect'

const EncryptionSettings = ({ value, onChange, ...rest }) => {
    const { encryptionKey, signKey, doSign } = value

    return (
        <table {...rest}>
            <tbody>
                <tr>
                    <td style={{ whiteSpace: 'nowrap' }}>
                        <label style={{ marginRight: '10px' }}>
                            <Checkbox
                                disabled
                                value
                            /> Encrypt for
                        </label>
                    </td>
                    <td style={{ height: '40px', verticalAlign: 'top', width: '360px' }}>
                        <KeySelect
                            maxDropHeight={300}
                            style={{ display: 'block', height: 0 }}
                            value={encryptionKey}
                            onChange={encryptionKey => onChange({ ...value, encryptionKey })}
                            currentEncryption
                        />
                    </td>
                </tr>
                <tr><td><div style={{ height: '5px' }} /></td></tr>
                <tr>
                    <td style={{ whiteSpace: 'nowrap' }}>
                        <label>
                            <Checkbox
                                value={doSign}
                                onChange={doSign => onChange({ ...value, doSign })}
                            /> Sign with
                        </label>
                    </td>
                    <td style={{ height: '40px', verticalAlign: 'top', maxWidth: '360px' }}>
                        <Fade>{doSign &&
                            <KeySelect
                                maxDropHeight={300}
                                style={{ display: 'block', height: 0 }}
                                value={signKey}
                                onChange={signKey => onChange({ ...value, signKey })}
                                currentSign
                                private
                            />}
                        </Fade>
                    </td>
                </tr>
            </tbody>
        </table>
    )
}

export default EncryptionSettings
