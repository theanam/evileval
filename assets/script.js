//check if app is embedded
var embedded = false;
//change it to the app url, otherwise embed won't work
//make sure you're including the trailing hash (#)
var baseUrl="http://theanam.github.io/evileval/#"; 
if(top!=self){
    document.querySelector('body').classList.add('embedded');
    embedded = true;
}

//hide info
if(!embedded){
setTimeout(function(){
    var infowindow=document.querySelector('.info');
    infowindow.style.opacity=0;
    setTimeout(function(){infowindow.style.display="none"},500); //hide afrer animation
},2000);
}
var repl = document.querySelector('.repl');
var fakeConsole = Object.create(console);
//dress up output for better understanding
function sanitize(currentElement,avoidArray){
        // if not NaN
        if(currentElement==currentElement){
            if(currentElement===null){
                return "null";
            }
            else if(currentElement===undefined){
                return "undefined";
            }
            else if(Array.isArray(currentElement)){
                if(avoidArray){
                    return ("Array"+"["+currentElement.length+"]");
                }
                else{
                    return ("["+currentElement.map(function(el){return sanitize(el,true)}).join(",")+"]");
                }
            }
            else if(typeof currentElement ==="string"){
                var textRepresentation = '\"'+currentElement+'\"';
                return textRepresentation;
            }
            else{
                return currentElement;
            }
        }
        else{
            return "NaN";
        }
}
fakeConsole.log = function(){
    // Handles multiple arguments for console
    // handle false like values
    var outputArray = [];
    for(i=0;i<arguments.length;i++){
        var currentElement = arguments[i];
        outputArray.push(sanitize(currentElement));
    }
    //console.log(outputArray);
    var line = document.createElement('li'),
        output = Array.prototype.join.call(outputArray, ", ");

    line.innerHTML = output;
    document.querySelector('.result .lines').appendChild(line);
//    console.log(arguments);
};
var replManager = CodeMirror(repl,{
    mode:'javascript',
    theme:'monokai',
    lineNumbers:true
});
//if the document is embedded look for hash, decode it and get the code
if(embedded){
    var hash = location.hash.substr(1,location.hash.length);
    if(hash){
        replManager.setValue(atob(hash)); //get the code from url and show
        evaluate();//evaluate at the very beginning for the first time
    }
}
//embed code
document.querySelector('.embed-button').addEventListener('click',showEmbed);
document.querySelector('.embed-close').addEventListener('click',function(){
   document.querySelector('.embed-code').style.display="none"; 
})
function showEmbed(){
    if(sourceCode=replManager.getValue()){
        var embedCode ='<iframe width="100%" height="250px" src="'+baseUrl;
        embedCode+=btoa(sourceCode);
        embedCode+='"></iframe>';
        document.querySelector("#embed").value=embedCode;
        document.querySelector('.embed-code').style.display="block";
    }
}
replManager.on('change',function() {
    if(isContinuous) {
        evaluateDebounced()
    }
});
//tabs action for embedded
var activeTab = false; //false for repl, true for editor
var buttons = document.querySelectorAll('.tabs .btn');
for(it=0;it<buttons.length;it++){
    buttons[it].addEventListener('click',changeTab);
}
function changeTab(e){
    if(!activeTab){ //if editor is visible
        buttons[0].classList.remove('active');
        buttons[1].classList.add('active');
        document.querySelector('.repl').style.display="none";
        document.querySelector('.result').style.display="block";
    }
    else{
        buttons[1].classList.remove('active');
        buttons[0].classList.add('active');
        document.querySelector('.repl').style.display="block";
        document.querySelector('.result').style.display="none";
    }
    activeTab=!activeTab; //change it
}
document.querySelector('.action').addEventListener('click',function(e){
    if(e.shiftKey || isContinuous) {
        toggleContinuous();
    } else {
        evaluate();
        if(embedded)
            changeTab(); //change tab to console if embedded mode
    }
});
document.addEventListener('keyup',function(e){
    if(e.ctrlKey && e.keyCode===13){
        if(e.shiftKey || isContinuous) {
            toggleContinuous();
        } else {
            evaluate();
        }
    }
})

var isContinuous = false;
function toggleContinuous(){
    isContinuous = !isContinuous;
    document.querySelector('.action').classList.toggle('active', isContinuous);
}

var worker;
function evaluate(){
    if(worker) {
        worker.terminate()
        worker = null
    }
    worker = new Worker(window.URL.createObjectURL(new Blob([
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

// Taken from https://remysharp.com/2010/07/21/throttling-function-calls
function debounce(fn, delay){
    var timer = null;
    return function () {
        var context = this, args = arguments;
        clearTimeout(timer);
        timer = setTimeout(function () {
            fn.apply(context, args);
        }, delay);
    };
}

var evaluateDebounced = debounce(evaluate, 1000);
