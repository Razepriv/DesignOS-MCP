export interface VideoProductionSpec {id:string;purpose:"app-preview"|"product-demo"|"launch"|"social";durationSeconds:number;scenes:Array<{id:string;durationSeconds:number;intent:string;motionNotes?:string}>}
export const VIDEO_STACK={deterministicRenderer:"Remotion",agenticProjectSkill:"HyperFrames",mediaPipeline:"FFmpeg"} as const;
