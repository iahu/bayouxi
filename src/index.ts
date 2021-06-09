import { promisesThrottle, useListHistory } from './helper'
import getCategory from './category'
import getPageInfo from './page'
import loo from './loo'
import throughList from './list'

const [startCateIndex = '0', startPageIndex = '0'] = process.argv.slice(2)
const fromCateIndex = parseInt(startCateIndex) || 0
const fromPageIndex = parseInt(startPageIndex) || 0

type Job = () => Promise<number | void>
const jobId = Date.now()

const main = async (fromCateIndex: number, fromPageIndex: number) => {
  const listHistory = await useListHistory()
  const subCategory = await getCategory()
  const cateLength = subCategory.length

  const listJobs = [] as Job[]

  subCategory.forEach((subCate, cateIdx) => {
    if (cateIdx < fromCateIndex) {
      return
    }

    listJobs.push(async () => {
      loo.log('分类开始', `${cateIdx + 1}/${cateLength}`, subCate.cate_name)
      const result = await throughList({
        url: subCate.link,
        subCateId: subCate.id,
        before: (pageIdx) => {
          const cacheIdx = listHistory[subCate.id] || 0
          return pageIdx > cacheIdx
        },
        after: (pageLink, pageIdx) => {
          if (pageIdx < fromPageIndex) {
            return Promise.resolve(null)
          }
          // loo.log('获取游戏信息', `(${cateIdx + 1}/${cateLength}类, ${pageIdx + 1}个)[${pageLink}]`)
          return getPageInfo(pageLink, subCate.cate_id, subCate.id)
        },
        done: (index: number) => {
          listHistory[subCate.id] = index
        },
      })

      console.log('result', result)
      if (result) {
        loo.log('分类结束', `${cateIdx + 1}/${cateLength}`, subCate.cate_name)
      }
      return result
    })
  })

  promisesThrottle(listJobs, 3).then(() => {
    loo.log('任务结束', jobId, '耗时', Date.now() - jobId)
  })
}

loo.log('任务开始', jobId)
main(fromCateIndex, fromPageIndex)
