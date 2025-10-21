import AbstractSource from './abstract.js'

export default new class KuroNeko extends AbstractSource {
  base = 'https://cdn1.teamstardust.org/kuronekofansub/torrent/query.php?q='

  /** @type {import('./').SearchFunction} */
  async single({ titles, episode }) {
    if (!titles?.length) return []

    const query = this.buildQuery(titles[0], episode)
    const url = `${this.base}${encodeURIComponent(query)}`

    const res = await fetch(url)
    const data = await res.json()

    if (!Array.isArray(data)) return []

    return this.map(data)
  }

  /** @type {import('./').SearchFunction} */
  batch = this.single
  movie = this.single

  buildQuery(title, episode) {
    let query = title.replace(/[^\w\s-]/g, ' ').trim()
    if (episode) query += ` ${episode.toString().padStart(2, '0')}`
    return query
  }

  map(data) {
    return data.map(item => {
      const hash = item.Magnet?.match(/btih:([a-fA-F0-9]+)/)?.[1] || ''

      return {
        title: item.title || '',
        link: item.magnet || '',
        hash,
        seeders: parseInt(item.seeders || '0'),
        leechers: parseInt(item.leechers || '0'),
        downloads: parseInt(item.downloads || '0'),
        size: this.parseSize(item.size),
        date: new Date(item.date),
        verified: item.verified,
        type: 'alt',
        accuracy: 'medium'
      }
    })
  }

  parseSize(sizeStr) {
    const match = sizeStr.match(/([\d.]+)\s*(KiB|MiB|GiB|KB|MB|GB)/i)
    if (!match) return 0

    const value = parseFloat(match[1])
    const unit = match[2].toUpperCase()

    switch (unit) {
      case 'KIB':
      case 'Ko':
      case 'KB': return value * 1024
      case 'MIB':
      case 'Mo':
      case 'MB': return value * 1024 * 1024
      case 'GIB':
      case 'Go':
      case 'GB': return value * 1024 * 1024 * 1024
      default: return 0
    }
  }

  async test() {
    try {
      const res = await fetch(this.base + 'one piece')
      return res.ok
    } catch {
      return false
    }
  }
}()
