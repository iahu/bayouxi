import fetch from 'node-fetch'
import path from 'path'
import { RunResult } from 'sqlite3'
import { all, run } from './db'
import { promisesThrottle } from './helper'
import loo from './loo'

const main = async (): Promise<void> => {
  const getComment = (gameId: number, resourceId: number | string): Promise<RunResult> => {
    return fetch('https://www.233xyx.com/apiserv/bbs/queryComment', {
      headers: {
        accept: 'application/json, text/javascript, */*; q=0.01',
        'accept-language': 'zh-CN,zh;q=0.9,en;q=0.8,zh-TW;q=0.7',
        'content-type': 'application/json',
      },
      body: `{"categoryId":"","commentNum":99999,"condition":"ALL","moduleType":"GAME","order":"HOTTEST","pageNum":0,"replyNum":5,"resourceId":"${resourceId}","uuid":""}`,
      method: 'POST',
    })
      .then((t) => t.json())
      .then((data) => run('INSERT INTO comments (comment) VALUES (?)', [JSON.stringify(data)]))
      .then((result) => run('UPDATE game_info SET comment=? WHERE id=?', [result.lastID, gameId]))
      .catch((e) => {
        loo.error('获取评论失败', resourceId, e)
        return e
      })
  }

  type GameInfo = { id: number; link: string }

  const data = await all<GameInfo>('SELECT id,link FROM game_info WHERE comment ISNULL')
  const jobs = data.map((d) => () => getComment(d.id, path.basename(d.link, '.html')))

  promisesThrottle(jobs, 100, (result, idx) => console.log(idx))
}

main()
