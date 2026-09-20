export type AdapterKind="deep"|"structured-browser"|"generic-reference";
export interface DesignSource {
  id:string;name:string;url:string;categories:string[];tags:string[];access:"public"|"freemium"|"authenticated";adapter:AdapterKind;priority:number;
  capabilities:{search:boolean;screenshot:boolean;recording:boolean;code:boolean;registry:boolean};
}
const d=(id:string,name:string,url:string,tags:string[]):DesignSource=>({id,name,url,categories:["components"],tags,access:"freemium",adapter:"deep",priority:.9,capabilities:{search:true,screenshot:true,recording:false,code:true,registry:true}});
export const CORE_SOURCES:DesignSource[]=[
 d("21st","21st.dev","https://21st.dev",["react","shadcn","components","loader"]),
 d("aceternity","Aceternity UI","https://ui.aceternity.com",["react","motion","hero","saas"]),
 d("magicui","Magic UI","https://magicui.design",["react","motion","shadcn","effects"]),
 d("reactbits","React Bits","https://reactbits.dev",["react","animation","creative"]),
 d("motion","Motion","https://motion.dev",["motion","animation","react"]),
 d("gsap","GSAP","https://gsap.com",["motion","scroll","timeline"]),
 {id:"godly",name:"Godly",url:"https://godly.website",categories:["inspiration"],tags:["web","editorial","creative"],access:"public",adapter:"structured-browser",priority:.94,capabilities:{search:true,screenshot:true,recording:true,code:false,registry:false}},
 {id:"landing-love",name:"Landing Love",url:"https://www.landing.love",categories:["inspiration","motion"],tags:["landing","animation","recording"],access:"public",adapter:"structured-browser",priority:.94,capabilities:{search:true,screenshot:true,recording:true,code:false,registry:false}},
 {id:"lapa",name:"Lapa Ninja",url:"https://www.lapa.ninja",categories:["inspiration","landing"],tags:["landing","screenshots","saas"],access:"public",adapter:"structured-browser",priority:.92,capabilities:{search:true,screenshot:true,recording:true,code:false,registry:false}},
 {id:"mobbin",name:"Mobbin",url:"https://mobbin.com",categories:["product-ui","mobile"],tags:["app","product","ux","flows"],access:"freemium",adapter:"structured-browser",priority:.95,capabilities:{search:true,screenshot:true,recording:false,code:false,registry:false}},
 {id:"saasframe",name:"SaaSFrame",url:"https://www.saasframe.io",categories:["product-ui","saas"],tags:["saas","dashboard","flows"],access:"freemium",adapter:"structured-browser",priority:.94,capabilities:{search:true,screenshot:true,recording:false,code:false,registry:false}},
 {id:"awwwards",name:"Awwwards",url:"https://www.awwwards.com",categories:["inspiration"],tags:["web","motion","webgl","creative"],access:"public",adapter:"structured-browser",priority:.9,capabilities:{search:true,screenshot:true,recording:true,code:false,registry:false}},
 {id:"spline",name:"Spline Community",url:"https://community.spline.design",categories:["3d"],tags:["3d","webgl","scene"],access:"freemium",adapter:"structured-browser",priority:.89,capabilities:{search:true,screenshot:true,recording:true,code:false,registry:false}},
 {id:"threejs",name:"Three.js Examples",url:"https://threejs.org/examples",categories:["3d","code"],tags:["3d","webgl","shader"],access:"public",adapter:"deep",priority:.9,capabilities:{search:true,screenshot:true,recording:true,code:true,registry:false}},
 {id:"shadergradient",name:"ShaderGradient",url:"https://shadergradient.co",categories:["3d","shader"],tags:["shader","gradient","webgl"],access:"freemium",adapter:"structured-browser",priority:.86,capabilities:{search:false,screenshot:true,recording:true,code:false,registry:false}},
 {id:"relume",name:"Relume",url:"https://www.relume.io",categories:["components","webflow"],tags:["wireframe","webflow","sections"],access:"authenticated",adapter:"structured-browser",priority:.9,capabilities:{search:true,screenshot:true,recording:false,code:true,registry:false}},
 {id:"flowbase",name:"Flowbase",url:"https://www.flowbase.co",categories:["components","webflow","framer"],tags:["webflow","framer","sections"],access:"authenticated",adapter:"structured-browser",priority:.87,capabilities:{search:true,screenshot:true,recording:false,code:true,registry:false}},
 {id:"navbar-gallery",name:"Navbar Gallery",url:"https://www.navbar.gallery",categories:["navigation"],tags:["navbar","navigation"],access:"public",adapter:"generic-reference",priority:.82,capabilities:{search:true,screenshot:true,recording:false,code:false,registry:false}},
 {id:"footer-design",name:"Footer Design",url:"https://www.footer.design",categories:["footer"],tags:["footer","website"],access:"public",adapter:"generic-reference",priority:.82,capabilities:{search:true,screenshot:true,recording:false,code:false,registry:false}},
 {id:"404s",name:"404s.design",url:"https://www.404s.design",categories:["404"],tags:["404","error","creative"],access:"public",adapter:"generic-reference",priority:.8,capabilities:{search:true,screenshot:true,recording:false,code:false,registry:false}}
];
export function planSources(query:string,maxSources=12){
 const terms=new Set(query.toLowerCase().split(/[^a-z0-9]+/).filter(Boolean));
 const selected=CORE_SOURCES.map(source=>({source,score:source.priority+[...source.tags,...source.categories].filter(t=>terms.has(t.toLowerCase())).length*.2}))
 .sort((a,b)=>b.score-a.score).slice(0,Math.max(1,maxSources)).map(x=>x.source);
 return {query,selected};
}
