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
    //clear output if any
    document.querySelector('.result .lines').innerHTML="";
    //load the contents as a function
    var expressions = replManager.getValue();
    var action = new Function('console', expressions);
    action(fakeConsole);
    window.scrollTo(0, document.body.scrollHeight);
};
