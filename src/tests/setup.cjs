const fs=require('fs'),path=require('path');module.exports=name=>{process.chdir(path.resolve(__dirname,'../..'));fs.mkdirSync(path.join('test-results',name),{recursive:true});};
