import { access } from "node:fs/promises";
const checks:Array<[string,()=>Promise<boolean>]>=[
 ["Node >= 20",async()=>Number(process.versions.node.split(".")[0])>=20],
 ["DesignOS home",async()=>{try{await access(process.env.DESIGNOS_HOME??".designos");return true}catch{return false}}],
 ["TinyFish key (optional)",async()=>Boolean(process.env.TINYFISH_API_KEY)],
 ["Vercel token (optional)",async()=>Boolean(process.env.VERCEL_TOKEN)]
];
let failures=0;for(const[name,check]of checks){const ok=await check(),optional=name.includes("(optional)");if(!ok&&!optional)failures++;console.log(`${ok?"✓":optional?"○":"✗"} ${name}`)}if(failures)process.exitCode=1;
