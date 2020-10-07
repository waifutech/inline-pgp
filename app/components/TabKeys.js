import React from 'react'
import Paginator from 'react-paginate'

import ExportForm from './FormExport'
import GenerateForm from './FormGenerate'
import ImportForm from './FormImport'
import Key from './Key'
import KeyDetails from './KeyDetails'
import style from './keys.sass'
import Button from './ui/Button'
import Fade from './ui/Fade'
import Grid from './ui/Grid'
import Icon from './ui/Icon'
import LinkButton from './ui/LinkButton'
import pagesStyle from './ui/pages.sass'
import Section from './ui/Section'
import Tab from './ui/Tab'
import toast from './ui/Toast'

import Keyring from '../Keyring'
import bem from '../utils/bem'

const c = bem(style)('keys')
const sc = bem(style)('search')

const keys = () => Keyring.instance()

export default class KeysTab extends React.Component {
    constructor() {
        super()
        this.state = {
            v: 0,
            page: 0,
            search: null,
            keyInfo: null,
            filter: 'PRIVATE',
            showForm: null,
        }
    }

    refresh() {
        return new Promise(resolve => {
            const { v } = this.state

            this.setState({ v: v + 1 }, () => resolve())
        })
    }

    async refreshAfter(promise) {
        const ret = await promise

        await this.refresh()

        return ret
    }

    showKeyInfo(id) {
        this.setState({ keyInfo: id })
    }

    filter(filter) {
        this.setState({ filter, page: 0 })
    }

    async import_(imported) {
        let pubc = 0; let privc = 0

        await Promise.all(imported.map(async k => {
            try {
                const added = await keys().add(k)

                k.private_ ? privc += added : pubc += added
            } catch (err) {
                console.error(err)
            }
        }))

        await this.refresh()

        if (!privc && !pubc) { return toast('Nothing imported') }
        if (!privc) { return toast(`Imported ${pubc} new public key${pubc !== 1 ? 's' : ''}`) }
        if (!pubc) { return toast(`Imported ${privc} new private key${privc !== 1 ? 's' : ''}`) }
        toast(`Imported ${pubc} public and ${privc} private key${privc !== 1 ? 's' : ''}`)

        window.scroll({ top: 0 })
    }

    async generate(data) {
        await keys().generate(data)
        await this.refresh()

        window.scroll({ top: 0 })
    }

    toggleForm(form) {
        const { showForm } = this.state

        if (showForm === form) { return this.setState({ showForm: null }) }

        this.setState({ showForm: form }, () =>
            window.scroll({ top: window.innerHeight, left: 0 }),
        )
    }

    render() {
        const { keyInfo, filter, showForm, search } = this.state
        let { page } = this.state
        const { pageSize = 6 } = this.props

        if (keyInfo) {
            return (
                <Grid n={1} padding={10}>
                    <div><LinkButton onClick={() => this.showKeyInfo(null)} style={{ fontSize: '14px', color: 'black' }}>{'\u2190 Back'}</LinkButton></div>
                    <div><KeyDetails {...keys().byId(keyInfo)} /></div>
                </Grid>
            )
        }

        const filteredPrivate = keys().find(search, { private: true })
        const filteredAll = keys().find(search, { private: false })

        const filtered = filter === 'PRIVATE' ? filteredPrivate : filteredAll

        const pageCount = Math.ceil(filtered.length / pageSize)

        if (page > pageCount - 1) { page = pageCount - 1 }
        const st = page * pageSize
        const displayed = filtered.slice(st, st + pageSize)

        return (
            <div>
                <div style={{ marginBottom: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span>
                        <Tab active={filter === 'PRIVATE'} onClick={() => this.filter('PRIVATE')}>Key pairs ({filteredPrivate.length})</Tab>
                        <Tab active={filter === 'ALL'} onClick={() => this.filter('ALL')}>Public keys ({filteredAll.length})</Tab>
                    </span>
                    <span className={sc()}>
                        <Icon className={sc('icon')}>search</Icon>
                        <input
                            placeholder='Search...'
                            className={sc('input')}
                            value={search}
                            onChange={ev => this.setState({ search: ev.target.value })}
                        />
                        {!!search && <Icon className={sc('reset')} onClick={() => this.setState({ search: '' })}>close</Icon>}
                    </span>
                </div>
                {filtered.length ? <div className={c()}>
                    <div style={{ minHeight: `${55 * pageSize}px` }}>
                        <Section style={{ padding: '0' }}>
                            <Fade>
                                {displayed.map(k => <Key
                                    key={k.id} {...{
                                        key_: k,
                                        onDelete: () => {
                                            if (confirm('Are you sure you want to delete this key?')) { this.refreshAfter(keys().del(k.id)) }
                                        },
                                        onClick: () => this.showKeyInfo(k.id),
                                    }}
                                />)}
                            </Fade>
                        </Section>
                    </div>
                    <Fade>
                        {pageCount > 1 && <div style={{ textAlign: 'center' }}>
                            <Paginator
                                forcePage={page}
                                pageCount={pageCount}
                                onPageChange={({ selected: page }) => this.setState({ page })}
                                containerClassName={pagesStyle.pages}
                                pageClassName={pagesStyle.pages__page}
                                activeClassName={pagesStyle['pages__page--active']}
                                previousLabel={'\u2190'}
                                nextLabel={'\u2192'}
                            />
                        </div>}
                    </Fade>
                </div> : <div className={c({ empty: true })} style={{ minHeight: `${55 * pageSize}px` }}>{
                    filter === 'PRIVATE'
                        ? 'No key pairs'
                        : 'No public keys'
                }
                </div>}
                <div className={c('actions')}>
                    <Button pressed={showForm === 'GENERATE'} onClick={() => this.toggleForm('GENERATE')}>Generate</Button>
                    <Button pressed={showForm === 'IMPORT'} onClick={() => this.toggleForm('IMPORT')}>Import</Button>
                    <Button pressed={showForm === 'EXPORT'} onClick={() => this.toggleForm('EXPORT')}>Export</Button>
                </div>
                <Fade>
                    {(showForm === 'GENERATE') && <GenerateForm onSubmit={this.generate.bind(this)} />}
                    {(showForm === 'IMPORT') && <ImportForm onSubmit={this.import_.bind(this)} />}
                    {(showForm === 'EXPORT') && <ExportForm />}
                </Fade>
            </div>
        )
    }
}
