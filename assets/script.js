var repl = document.querySelector('.repl');
var fakeConsole = Object.create(console);

fakeConsole.log = function(){
    // Handles multiple arguments for console
    // handle false like values
    var outputArray = [];
    for(i=0;i<arguments.length;i++){
        var currentElement = arguments[i];
        // if not NaN
        if(currentElement==currentElement){
            if(currentElement===null){
                outputArray.push("null");
            }
            else if(currentElement===undefined){
                outputArray.push("undefined");
            }
            else if(Array.isArray(currentElement)){
                //handle arrays including empty ones
                var arrayBody = "["+currentElement.join(",")+"]";
                outputArray.push(arrayBody);
            }
            else{
                outputArray.push(currentElement);
            }
        }
        else{
            outputArray.push("NaN");
        }
    }

    var line = document.createElement('li'),
        output = Array.prototype.join.call(outputArray, ", ");

    line.innerHTML = output;
    document.querySelector('.result .lines').appendChild(line);
    console.log(arguments);
};
var replManager = CodeMirror(repl,{
    mode:'javascript',
    theme:'monokai',
    lineNumbers:true
});

document.querySelector('.action').addEventListener('click',evaluate);
document.addEventListener('keyup',function(e){
    if(e.ctrlKey && e.key=='e'){
        evaluate();
    }
})
function evaluate(){
    var worker = new Worker(window.URL.createObjectURL(new Blob([
        "var output = [];\n"+
        "\n"+
        "var fakeConsole = {\n"+
        "    log: function() {\n"+
        "        postMessage({\n"+
        "            kind: 'call',\n"+
        "            func: 'console.log',\n"+
        "            args: Array.prototype.slice.call(arguments)\n"+
        "        });\n"+
        "    }\n"+
        "};\n"+
        "\n"+
        "onmessage = function(e){\n"+
        "    var action = new Function('console', e.data.expressions);\n"+
        "    action(fakeConsole);\n"+
        "    \n"+
        "    postMessage({\n"+
        "        kind: 'exit'\n"+
        "    });\n"+
        "}\n"
    ], {
      type: 'text/javascript'
    })));

    //clear output if any
    document.querySelector('.result .lines').innerHTML="";

    var length = 0;

    var timeout = setTimeout(function() {
        worker.terminate();
        fakeConsole.log('[Terminated! Script took too long to end..]');
    }, 1000);
    worker.onmessage = function(e) {
        switch(e.data.kind) {
            case 'exit':
                clearTimeout(timeout);
                break

            case 'call':
                switch(e.data.func) {
                    case 'console.log':
                        length++;
                        fakeConsole.log.apply(fakeConsole, e.data.args);

                        if(length > 1000) {
                            clearTimeout(timeout);
                            worker.terminate();
                            fakeConsole.log('[Terminated! Script produced too much output..]');
                        }
                }
                break
        }
    }
    worker.onerror = function(e) {
        e.preventDefault()
        clearTimeout(timeout);
        worker.terminate();
        fakeConsole.log(e.message + ' (at line '+(e.lineno-2)+')')
    }
    worker.postMessage({
        expressions: replManager.getValue()
    })

    window.scrollTo(0, document.body.scrollHeight);
};
