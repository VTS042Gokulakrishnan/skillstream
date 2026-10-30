const Module=require('module');const original=Module._load;Module._load=function(name,...args){if(name==='canvas')return {};return original.call(this,name,...args)};require('D:/GitHub/skillstream-jobs-us/node_modules/jest/bin/jest');

