import { PageInfo } from './page'
import loo from './loo'
import parser from './parser'
import { delay } from './helper'

type Callback = Promise<PageInfo | null>

const throughList = async (
  url: string,
  subCateId: number,
  getPageInfo: (url: string, index: number) => Callback
): Promise<number | void> => {
  const start = Date.now()
  return parser(url).then(($) => {
    if (!$) {
      return loo.error('list 解析失败', url, subCateId)
    }
    const pipes = [] as Callback[]
    const pageNum = +$('.m-pager-number.active').text().trim()
    loo.log(`解析第${subCateId},${pageNum}页`, url)

    $('.list .item')
      .toArray()
      .forEach((el, i) => {
        const $el = $(el)
        const link = $el.find('.game_img').attr('href') as string
        // 这里并行就可以了，顺序不重要
        pipes.push(getPageInfo(link, i))
      })

    const activePager = $('.m-pager-number.active')
    const activeNext = activePager.next('.m-pager-number')
    const nextPagePath = activeNext?.find('a').attr('href')

    if (!nextPagePath) {
      loo.log(`解析完${subCateId}, 共${pageNum}页, 花费 ${Date.now() - start}`)
      return 1
    }

    // 详情页都跑完了再跑下一页
    Promise.race([delay(2000), Promise.all(pipes)]).then(() => {
      loo.log(`已跑完${subCateId}, 第${pageNum}页`)
      throughList(`https://www.233leyuan.com${nextPagePath}`, subCateId, getPageInfo)
    })
  })
}

export default throughList
