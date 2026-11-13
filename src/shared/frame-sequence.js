/* Compressed frames stay cached; decoded images use a bounded working set. */
class FoodFrameSequence {
  constructor({base,count,mobile,onFrame,onProgress}) {
    Object.assign(this,{base,count,onFrame,onProgress});
    this.capacity=mobile?14:24; this.radius=mobile?6:10;
    this.blobs=new Map(); this.decoded=new Map(); this.requests=new Map();
    this.fetchQueue=[]; this.decodeQueue=[]; this.decoding=new Set();
    this.fetching=0; this.activeDecodes=0; this.center=0; this.direction=1;
    this.controller=new AbortController(); this.stopped=false;
  }
  url(i){return `${this.base}/frame-${String(i+1).padStart(4,'0')}.webp`}
  blob(i,urgent=false){
    if(this.blobs.has(i))return Promise.resolve(this.blobs.get(i));
    let job=this.requests.get(i);
    if(!job){
      job={i};job.promise=new Promise((resolve,reject)=>Object.assign(job,{resolve,reject}));
      this.requests.set(i,job);this.fetchQueue.push(job);
    }
    if(urgent){const position=this.fetchQueue.indexOf(job);if(position>=0){this.fetchQueue.splice(position,1);this.fetchQueue.unshift(job)}}
    this.pumpFetch();return job.promise;
  }
  pumpFetch(){
    while(!this.stopped&&this.fetching<4&&this.fetchQueue.length){
      const job=this.fetchQueue.shift();this.fetching++;
      fetch(this.url(job.i),{signal:this.controller.signal,cache:'force-cache'})
        .then(r=>{if(!r.ok)throw Error(`Frame ${r.status}`);return r.blob()})
        .then(blob=>{if(this.stopped)throw Error('Stopped');this.blobs.set(job.i,blob);job.resolve(blob);this.onProgress(this.blobs.size)})
        .catch(job.reject).finally(()=>{this.fetching--;this.requests.delete(job.i);this.pumpFetch()});
    }
  }
  prefetch(){for(let i=0;i<this.count;i++)this.blob(i).catch(()=>{})}
  warm(index,direction=1){
    if(this.stopped)return;
    this.center=Math.max(0,Math.min(this.count-1,index));this.direction=direction;
    const order=[this.center];
    for(let n=1;n<=this.radius;n++){order.push(this.center+n*direction,this.center-n*direction)}
    this.decodeQueue=order.filter(i=>i>=0&&i<this.count&&!this.decoded.has(i)&&!this.decoding.has(i));
    // The displayed frame's fetch jumps ahead of background prefetch work.
    this.blob(this.center,true).catch(()=>{});this.pumpDecode();
  }
  async decode(blob){
    if(typeof createImageBitmap==='function')return createImageBitmap(blob);
    const url=URL.createObjectURL(blob),img=new Image();
    try{await new Promise((resolve,reject)=>{img.onload=resolve;img.onerror=reject;img.src=url});return img}
    finally{URL.revokeObjectURL(url)}
  }
  dispose(image){if(image?.close)image.close();else if(image)image.src=''}
  trim(){
    while(this.decoded.size>this.capacity){
      const farthest=[...this.decoded.keys()].sort((a,b)=>Math.abs(b-this.center)-Math.abs(a-this.center))[0];
      this.dispose(this.decoded.get(farthest));this.decoded.delete(farthest);
    }
  }
  pumpDecode(){
    while(!this.stopped&&this.activeDecodes<2&&this.decodeQueue.length){
      const i=this.decodeQueue.shift();if(this.decoded.has(i)||this.decoding.has(i))continue;
      this.activeDecodes++;this.decoding.add(i);
      this.blob(i,true).then(blob=>this.decode(blob)).then(image=>{
        if(this.stopped||Math.abs(i-this.center)>this.radius+2){this.dispose(image);return}
        this.decoded.set(i,image);this.trim();this.onFrame(i);
      }).catch(()=>{}).finally(()=>{this.decoding.delete(i);this.activeDecodes--;this.pumpDecode()});
    }
  }
  nearest(index){
    if(this.decoded.has(index))return {index,image:this.decoded.get(index)};
    const keys=[...this.decoded.keys()];if(!keys.length)return null;
    const closest=keys.reduce((a,b)=>Math.abs(a-index)<=Math.abs(b-index)?a:b);
    return {index:closest,image:this.decoded.get(closest)};
  }
  stop(){
    this.stopped=true;this.controller.abort();
    this.fetchQueue.forEach(job=>job.reject(Error('Stopped')));this.fetchQueue=[];this.decodeQueue=[];
    this.decoded.forEach(image=>this.dispose(image));this.decoded.clear();this.blobs.clear();
  }
}
