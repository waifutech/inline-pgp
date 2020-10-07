export default (html) => {
    html = html.replace(/&nbsp;/g, ' ')
    html = html.replace(/<(\/|br)*?>/gi, '\n')
    html = html.replace(/<div>/gi, '\n')
    html = html.replace(/<[^>]+>/gi, '')

    return html
}
