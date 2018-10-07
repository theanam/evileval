import {_decode} from './base64';
const transformer = 'function __tostr(thing){\
    if(thing!=thing){\
        return "NnN"\
    }\
    if(thing===null){\
        return "null"\
    }\
    else if(thing===undefined){\
        return "undefined"\
    }\
    else if(Array.isArray(thing)){\
        let mapped = thing.map(__tostr).join(",");\
        return `[${mapped}]`;\
    }\
    else if(typeof thing === "string"){\
        return `"${thing}"`;\
    }\
    else if(typeof thing === "object"){\
        return JSON.stringify(thing);\
    }\
    else{\
        try{\
            return thing.toString();\
        }\
        catch(e){\
            return "<CURRENTLY UNSUPPORTED>"\
        }\
    }\
}'

let unicodeSolution = `
function __b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}
`
let worker = null;
let timer = null;
export default function evaluate(sourcecode){
    return new Promise((resolve,reject)=>{
        const fbody = `
            ${transformer}
            ${unicodeSolution}
            var __output = [];
            var console = {};
            console.log = function(){
                if(!arguments) return false;
                __output.push([].map.call(arguments,__tostr));
            }
            ${sourcecode}
            postMessage(JSON.stringify(__output.map(__b64EncodeUnicode)));
            `;
        if(worker){
            worker.terminate();
            worker = null;
        }
        //return console.log(fbody);
        worker = new Worker(window.URL.createObjectURL(new Blob([fbody])));
        //Timeout for long running tasks
        timer = setTimeout(()=>{
            if(!worker) return false;
            if(worker) worker.terminate();
            worker = null;
            resolve({
                error:true,
                data:[`Error: Script took too long. Try looking for infinite loop`]
            })
        },5000);
        worker.onmessage = function(m){
            worker.terminate();
            worker=null;
            if(timer){
                clearTimeout(timer);
                timer=null;
            }
            //console.log(m);
            resolve({
                error:false,
                data:JSON.parse(m.data).map(_decode)
            });
        }
        worker.onerror = function(e){
            //console.log(arguments);
            resolve({
                error:true,
                data:[`Error: ${e.message} on line ${e.lineno-19}`]
            })
        }
    });
    
}