import isNil from 'lodash.isnil'

const compactObject = (o, condition = v => isNil(v)) => {
    Object.keys(o).filter(k => condition(o[k])).forEach(k => delete o[k])

    return o
}

export default compactObject
