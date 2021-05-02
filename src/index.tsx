import * as esbuild from 'esbuild-wasm'
import ReactDOM from 'react-dom'
import { useState, useEffect, useRef } from 'react'
import { unpkgPathPlugin, fetchPlugin } from './esbuild/plugins'

const App = () => {
  const [input, setInput] = useState('')
  const [code, setCode] = useState('')
  const ref = useRef<any>()

  const startEsbuildService = async () => {
    ref.current = await esbuild.startService({
      worker: true,
      wasmURL: 'https://unpkg.com/esbuild-wasm@0.8.27/esbuild.wasm'
    })
  }

  useEffect(() => {
    startEsbuildService()
  }, [])

  const onClick = async () => {
    console.log(ref.current)

    if (!ref.current) return

    // const res = await ref.current.transform(input, {
    //   loader: 'jsx',
    //   target: 'es2015'
    // })

    const res = await ref.current.build({
      entryPoints: ['index.js'],
      bundle: true,
      write: false,
      plugins: [unpkgPathPlugin(), fetchPlugin(input)],
      define: {
        'process.env.NODE_ENV': '"production"',
        global: 'window'
      }
    })

    console.log(res, 'res...')
    console.log(res.outputFiles[0].text)

    setCode(res.outputFiles[0].text)
  }

  return (
    <div>
      <textarea onChange={e => setInput(e.target.value)} value={input}></textarea>
      <div>
        <button onClick={onClick}>submit</button>
      </div>
      <pre>{code}</pre>
    </div>
  )
}

ReactDOM.render(<App />, document.querySelector('#root'))