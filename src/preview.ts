import express from 'express'
import path from 'path'
import { all, get } from './db'

const app = express()

type IdName = {
  id: number
  name: string
}

const htmlTemplate = (body: string) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Document</title>
</head>
<body>
${body}
</body>
</html>
`

app.get('/assets/:type/:id/:name', (req, res) => {
  const { type, id, name } = req.params
  const filename = path.join(__dirname, '../assets', type, id, name)
  res.sendFile(filename)
})

app.get('/', async (req, res) => {
  const data = await all<IdName>('SELECT id, name FROM category_l2')
  const list = data.map((cat) => `<li><a href="/list/${cat.id}/0">${cat.name}</a></li>`).join('')
  res.send(htmlTemplate(`<ul>${list}</ul>`))
})

app.get('/list/:id/:page', async (req, res) => {
  const { id, page = '1' } = req.params
  const data = await all<IdName>('SELECT id, name from game_info WHERE sub_cate_id=? LIMIT 30 OFFSET ?', [
    id,
    +page * 30,
  ])
  const list = data.map((d) => `<li><a href="/game/${d.id}">${d.name}</a></li>`).join('')
  res.send(htmlTemplate(`<ul>${list}</ul>`))
})

type Page = {
  link: string
  name: string
  cate_id: number
  sub_cate_id: number
  score: number
  introduction: string
  tagsName: string
  icon: string
  images: string
  videos: string
  app_size: string
  app_version: string
  app_author: string
}

type Asset = {
  alt: string
  title: string
  path: string
}

app.get('/game/:id', async (req, res) => {
  const { id } = req.params
  const d = await get<Page>('SELECT * FROM game_info WHERE id=?', [id])
  if (!d) {
    return res.send('404')
  }
  const { images, videos, icon } = d
  const imagesPath = await all<Asset>(`SELECT path, alt, title FROM assets WHERE id IN (${images})`)
  const videosPath = await all<Asset>(`SELECT path, alt, title FROM assets WHERE id IN (${videos})`)
  const iconPath = await all<Asset>(`SELECT path, alt, title FROM assets WHERE id IN (${icon})`)

  const list = `
<div>
  <a href="/">首页</a>
  <span>/</span>
  <a href="/list/${d.sub_cate_id}/0">列表</a>
</div>

<div>
  <img src="/assets/${iconPath[0].path}" alt="${iconPath[0].alt}">
  <h1>${d.name}</h1>
</div>

<div>
  <h4>标签</h4>
  <ul>${d.tagsName
    .split(',')
    .map((t) => `<li>${t}</li>`)
    .join('')}</ul>
</div>

<div>
  <h4>图片</h4>
  <ul>${imagesPath.map((t) => `<li><img src="/assets/${t.path}" alt="${t.alt}"></li></li>`).join('')}</ul>
</div>

<div>
  <h4>视频</h4>
  <ul>${videosPath.map((t) => `<li><video src="/assets/${t.path}" controls></li></li>`).join('')}</ul>
</div>
`
  res.send(htmlTemplate(list))
})

const port = 4001
app.listen(port)
console.log('app listen at', port)
