import * as esbuild from 'esbuild-wasm'
 
export const unpkgPathPlugin = () => {
  return {
    name: 'unpkg-path-plugin',
    setup(build: esbuild.PluginBuild) {
      // index.js
      build.onResolve({filter: /(^index\.js$)/}, () => {
        return {
          path: 'index.js',
          namespace: 'a'
        }
      })

      // relative path
      build.onResolve({filter: /^\.+\//}, async (args: any) => {
        return {
          namespace: 'a',
          path: new URL(args.path, `https://unpkg.com${args.resolveDir}/`).href
        }
      })

      // unpkg
      build.onResolve({ filter: /.*/ }, async (args: any) => {
        return {
          namespace: 'a',
          path: `https://unpkg.com/${args.path}`
        }
      });
    },
  };
};