import EventEmitter from 'events'

type PromiseJob<T = unknown> = () => Promise<T>

class ProHub<T = unknown> extends EventEmitter {
  private jobCount: number
  private eventJobs = [] as PromiseJob<T>[]
  private hubSize: number
  runningJobs = [] as PromiseJob<T>[]

  constructor(jobs: PromiseJob<T>[], hubSize: number) {
    super()
    this.jobCount = jobs.length
    this.eventJobs = jobs.map(this.jobMapping)
    this.hubSize = hubSize
  }

  private jobMapping = (job: PromiseJob<T>, index?: number) => {
    return () => {
      const eventJobs = this.eventJobs
      const runningJobs = this.runningJobs
      return job().then((res) => {
        const idx = runningJobs.findIndex(job)
        const next = eventJobs.shift()
        if (next) {
          runningJobs[idx] = next
        } else {
          runningJobs.splice(idx, 1)
        }
        const data = { value: res, index, next: next?.(), done: !next }
        this.emit('shift', data)
        if (runningJobs.length === 0) {
          this.emit('done', data)
        }
        return res
      })
    }
  }

  async start(): Promise<void> {
    const eventJobs = this.eventJobs
    this.runningJobs = eventJobs.splice(0, this.hubSize)
    const runningJobs = this.runningJobs
    await Promise.all(runningJobs.map((j) => j()))
  }

  push(job: PromiseJob<T>): number {
    this.jobCount += 1
    return this.eventJobs.push(this.jobMapping(job, this.jobCount))
  }

  pop(): PromiseJob<T> | undefined {
    this.jobCount -= 1
    return this.eventJobs.pop()
  }
}

export default ProHub
