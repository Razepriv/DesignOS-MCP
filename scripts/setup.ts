import { mkdir } from "node:fs/promises";
import { spawn } from "node:child_process";
const full=process.argv.includes("--full"); const home=process.env.DESIGNOS_HOME??".designos";
const run=(cmd:string,args:string[])=>new Promise<void>((resolve,reject)=>{const c=spawn(cmd,args,{stdio:"inherit",shell:process.platform==="win32"});c.on("exit",code=>code===0?resolve():reject(new Error(`${cmd} exited ${code}`)));c.on("error",reject)});
for(const dir of ["projects","cache","artifacts","vault","indexes","captures"])await mkdir(`${home}/${dir}`,{recursive:true});
console.log(`DesignOS home initialized at ${home}`);
if(full){
 await run("pnpm",["exec","playwright","install","chromium"]);
 await run("npx",["-y","caveman-mcp","--help"]);
 await run("npx",["-y","skills","add","heygen-com/hyperframes"]);
 await run("pnpm",["exec","vercel","--version"]);
}
console.log("DesignOS foundation ready. Run: pnpm designos:doctor");
