import fetch from 'node-fetch'
import Cheerio, { CheerioAPI } from 'cheerio'
import loo from './loo'

const debug = false

const parser = (url: string, retryTimes = 0): Promise<CheerioAPI | void> => {
  const after = Date.now()
  return fetch(url)
    .then((t) => {
      debug && loo.debug('花了', Date.now() - after, url)
      return t
    })
    .then((t) => t.text())
    .then(Cheerio.load)
    .catch((err) => {
      if (retryTimes > 3) {
        loo.error('parser error', url, err)
        return
      }
      loo.info(retryTimes, 'times retry to parse', url)
      return parser(url, retryTimes + 1)
    })
}

export default parser
