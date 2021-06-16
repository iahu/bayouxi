import fs from 'fs'
import { glob } from 'glob'
import path from 'path'
import PngQuant from 'pngquant'
import ProHub from './prohub'

const main = () => {
  glob(path.join(__dirname, '../assets/videos/**/*.png'), (err, matches) => {
    if (err) {
      return
    }

    const tasks = matches.map((pathToFile) => () => {
      return new Promise((resolve) => {
        const pathToMinFile = pathToFile.replace('.png', '-min.png')
        const read = fs.createReadStream(pathToFile)
        const write = fs.createWriteStream(pathToMinFile)
        const pngQuanter = new PngQuant([192, '--quality', '60-80', '--nofs', '-'])

        read.on('end', () => {
          read.close()
          fs.rmSync(pathToFile)
          fs.renameSync(pathToFile, pathToMinFile)
          resolve('')
        })
        write.on('end', () => write.close())

        read.pipe(pngQuanter).pipe(write)
      })
    })

    new ProHub(tasks, 10).start()
  })
}

main()
