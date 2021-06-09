import db, { all, run } from './db'
import { getUid } from './helper'
import loo from './loo'
import parser from './parser'

export type SubCategory = { id: number; name: string; link: string; cate_id: number; cate_name: string }

const uid = getUid(0)

const getCategory = async (): Promise<SubCategory[]> => {
  const rows = (await all('SELECT * FROM category_l2', [])) as unknown as SubCategory[]

  if (rows.length) {
    return Promise.resolve(rows)
  }

  const $ = await parser('https://www.233leyuan.com/find/')

  if (!$) {
    return loo.error('category 解析失败')
  }

  const category = $('.nava_box a')
    .toArray()
    .reduce((acc, el, id) => {
      const name = el.attribs.title.trim()
      const link = el.attribs.href

      db.run('INSERT INTO category (id, name, link) VALUES (?, ?, ?)', [id, name, link])

      acc[name] = id
      return acc
    }, {} as Record<string, number>)

  const subCategory = $('.swiper-slide .item')
    .toArray()
    .reduce((acc, item) => {
      const cate_name = $('.item_tit', item).text().trim()
      const subCategory = $('.item_a a', item)
        .toArray()
        .map((a) => {
          const name = a.attribs.title.trim()
          const link = a.attribs.href
          const cate_id = category[cate_name]
          const id = uid()

          run('INSERT INTO category_l2 (id, name, link, cate_id, cate_name) VALUES (?, ?, ?, ?, ?)', [
            id,
            name,
            link,
            cate_id,
            cate_name,
          ])

          return { id, name, link, cate_id, cate_name }
        })

      acc = acc.concat(subCategory)
      return acc
    }, [] as SubCategory[])

  return subCategory
}

export default getCategory
