import { PageInfo } from './page'
import loo from './loo'
import parser from './parser'
import { delay, getNextListUrl } from './helper'

type Callback = Promise<PageInfo | null>

type Options = {
  url: string
  subCateId: number
  before: (index: number) => boolean
  after: (url: string, index: number) => Callback
  done?: (index: number) => void
  pageIdx?: number
}

const throughList = async (options: Options): Promise<number | void> => {
  const { url, subCateId, before, after, pageIdx = 1, done } = options
  if (before?.(pageIdx) === false) {
    loo.info(`已跳过第${subCateId},${pageIdx}页`)
    const nextUrl = getNextListUrl(url)
    return throughList({ ...options, url: nextUrl, pageIdx: pageIdx + 1 })
  }

  const start = Date.now()
  const $ = await parser(url)

  if (!$) {
    return loo.error('list 解析失败', url, subCateId)
  }
  const pipes = [] as Callback[]
  const pageNum = +$('.m-pager-number.active').text().trim()
  loo.log(`列表开始 第${subCateId},${pageNum}页`, url)

  $('.list .item')
    .toArray()
    .forEach((el, i) => {
      const $el = $(el)
      const link = $el.find('.game_img').attr('href') as string
      // 这里并行就可以了，顺序不重要
      pipes.push(after(link, i))
    })

  const activePager = $('.m-pager-number.active')
  const activeNext = activePager.next('.m-pager-number')
  const nextPagePath = activeNext?.find('a').attr('href')

  if (!nextPagePath) {
    loo.log(`解析完${subCateId}, 共${pageNum}页, 花费 ${Date.now() - start}`)
    return pageNum
  }

  // 详情页都跑完了再跑下一页
  await Promise.race([delay(2000), Promise.all(pipes)])
  done?.(pageNum)
  loo.log(`列表结束 第${subCateId},${pageNum}页`, url)

  return throughList({
    ...options,
    url: `https://www.233leyuan.com${nextPagePath}`,
    pageIdx: pageIdx + 1,
  })
}

export default throughList
