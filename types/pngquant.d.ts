/// <reference types="node" />

declare module 'pngquant' {
  import { Stream } from 'stream'
  export default class PngQuant extends Stream {
    constructor(pngQuantArgs: (number | string)[])

    cleanUp(): void

    destroy(): void

    end(chunk: any): void

    pause(): void

    resume(): void

    write(chunk: any): any

    writable = true
    readable = true

    static getBinaryPath(...args: any[]): any

    static setBinaryPath(binaryPath: any): void
  }
}
