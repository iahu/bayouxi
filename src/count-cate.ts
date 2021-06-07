import parser from './parser'

const countCate = (url: string): Promise<number> => {
  return parser(url).then(($) => {
    if (!$) {
      return 0
    }
    const pager = $('.m-pager li').last()?.text() || '1'
    return +pager * 30
  })
}

export default countCate
