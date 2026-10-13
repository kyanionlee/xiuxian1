// Dependency-free ZIP writer (stored entries), usable on Windows, macOS and Linux.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist');fs.mkdirSync(out,{recursive:true});
const files=['index.html'];function walk(dir){for(const f of fs.readdirSync(path.join(root,dir),{withFileTypes:true})){const n=dir+'/'+f.name;if(f.isDirectory())walk(n);else files.push(n);}}walk('assets');
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0;});
function crc(b){let c=0xffffffff;for(const n of b)c=table[(c^n)&255]^(c>>>8);return(c^0xffffffff)>>>0;}
let offset=0;const entries=[],central=[];
for(const f of files.sort()){const name=Buffer.from(f),data=fs.readFileSync(path.join(root,f)),sum=crc(data),h=Buffer.alloc(30);h.writeUInt32LE(0x04034b50);h.writeUInt16LE(20,4);h.writeUInt16LE(0x800,6);h.writeUInt16LE(33,12);h.writeUInt32LE(sum,14);h.writeUInt32LE(data.length,18);h.writeUInt32LE(data.length,22);h.writeUInt16LE(name.length,26);entries.push(h,name,data);const c=Buffer.alloc(46);c.writeUInt32LE(0x02014b50);c.writeUInt16LE(20,4);h.copy(c,6,4,30);c.writeUInt32LE(offset,42);central.push(c,name);offset+=h.length+name.length+data.length;}
const directory=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(directory.length,12);end.writeUInt32LE(offset,16);
const target=path.join(out,'xiuxian1-offline.zip');fs.writeFileSync(target,Buffer.concat([...entries,directory,end]));console.log(target,files.length+' files');
