const Module=require('module'),load=Module._load;Module._load=function(request,...args){if(request==='canvas')return {};return load.call(this,request,...args);};require('D:/GitHub/skillstream-jobs-us/node_modules/jest/bin/jest');

