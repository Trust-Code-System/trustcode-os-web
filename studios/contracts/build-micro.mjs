import {build} from 'esbuild';
import {readFile,writeFile,readdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
const directory=path.dirname(fileURLToPath(import.meta.url));
let license=await readFile(path.join(directory,'reactbits/LICENSE.md'),'utf8');
for(const name of ['react','react-dom','scheduler','motion','framer-motion','motion-dom','motion-utils']){
 const folder=path.join(directory,'node_modules',name),files=await readdir(folder),file=files.find(f=>/^license(\.|$)/i.test(f));
 if(!file)throw new Error('Missing runtime licence: '+name);
 license+='\n\n'+name+'\n'+await readFile(path.join(folder,file),'utf8');
}
const result=await build({entryPoints:[path.join(directory,'micro.jsx')],bundle:true,write:false,outdir:path.join(directory,'../../.studio-build'),entryNames:'contract-micro',format:'iife',target:['es2020'],jsx:'automatic',minify:true,legalComments:'inline',define:{'process.env.NODE_ENV':'"production"'},metafile:true});
for(const file of result.outputFiles){await writeFile(file.path,file.path.endsWith('.js')?'/* React Bits component adaptations\n'+license+'\n*/\n'+file.text:file.contents);console.log(path.basename(file.path),file.contents.length,'bytes')}
await writeFile(path.join(directory,'../../.studio-build/contract-micro-metafile.json'),JSON.stringify(result.metafile,null,2));
