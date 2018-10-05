import {_encode,_decode} from './base64';
const transformer = 'function _tostr(thing){\
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
        let mapped = thing.map(_tostr).join(",");\
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
function b64EncodeUnicode(str) {
    // first we use encodeURIComponent to get percent-encoded UTF-8,
    // then we convert the percent encodings into raw bytes which
    // can be fed into btoa.
    return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g,
        function toSolidBytes(match, p1) {
            return String.fromCharCode('0x' + p1);
    }));
}
`
function b64DecodeUnicode(str) {
    // Going backwards: from bytestream, to percent-encoding, to original string.
    return decodeURIComponent(atob(str).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
}
let worker = null;
export default function evaluate(sourcecode){
    return new Promise((resolve,reject)=>{
        const fbody = `
            ${transformer}
            ${unicodeSolution}
            var output = [];
            var console = {};
            console.log = function(){
                if(!arguments) return false;
                output.push([].map.call(arguments,_tostr));
            }
            ${sourcecode}
            postMessage(JSON.stringify(output.map(b64EncodeUnicode)));
            `;
        if(worker){
            worker.terminate();
            worker = null;
        }
        //return console.log(fbody);
        worker = new Worker(window.URL.createObjectURL(new Blob([fbody])));
        worker.onmessage = function(m){
            worker.terminate();
            worker=null;
            //console.log(m);
            resolve({
                error:false,
                data:JSON.parse(m.data).map(b64DecodeUnicode)
            });
        }
        worker.onerror = function(e){
            //console.log(arguments);
            resolve({
                error:true,
                data:[`Error: ${e.message} on line ${e.lineno-8}`]
            })
        }
    });
    
}