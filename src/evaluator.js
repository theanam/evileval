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
let worker = null;
export default function evaluate(sourcecode){
    return new Promise((resolve,reject)=>{
        const fbody = `
            ${transformer}
            var output = [];
            var console = {};
            console.log = function(){
                if(!arguments) return false;
                output.push([].map.call(arguments,_tostr));
            }
            ${sourcecode}
            postMessage(JSON.stringify(output.map(btoa)));
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
                data:JSON.parse(m.data).map(atob)
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