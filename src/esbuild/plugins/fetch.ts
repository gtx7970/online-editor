import * as esbuild from 'esbuild-wasm'
import axios from 'axios'
import localForage from 'localforage'

const unPkgCache = localForage.createInstance({
  name: 'unpkg-cache'
})

export const fetchPlugin = (inputCode: string) => {
  return {
    name: 'fetch-plugin',
    setup(build: esbuild.PluginBuild) {
      // entry
      build.onLoad({ filter: /(^index\.js$)/ }, () => {
        return {
          loader: 'jsx',
          contents: inputCode
        }
      })

      // cache
      build.onLoad({filter: /.*/}, async (args: any) => {
        const cacheRes = await unPkgCache.getItem<esbuild.OnLoadResult>(args.path)

        if (cacheRes) return cacheRes
      })

      // css
      build.onLoad({ filter: /.css$/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path)

        const escaped = data
        .replace(/\n/g, '')
        .replace(/"/g, '\\"')
        .replace(/'/g, "\\'")

        const contents = `
          const style = document.createElement('style');
          style.innerText = '${escaped}';
          document.head.appendChild(style);
        ` 
        const res: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents,
          resolveDir: new URL('./', request.responseURL).pathname
        }

        await unPkgCache.setItem(args.path, res)

        return res
      })

      build.onLoad({ filter: /.*/ }, async (args: any) => {
        const { data, request } = await axios.get(args.path)
        const res: esbuild.OnLoadResult = {
          loader: 'jsx',
          contents: data,
          resolveDir: new URL('./', request.responseURL).pathname
        }

        await unPkgCache.setItem(args.path, res)

        return res
      })
    }
  }
}