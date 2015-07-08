var repl = document.querySelector('.repl');
var fakeConsole = Object.create(console);

fakeConsole.log = function(){
    // Handles multiple arguments for console
    // doesn't handle weird cases such as undefined etc. In those cases an empty string is placed
    var line = document.createElement('li'),
        output = Array.prototype.join.call(arguments, ", ");

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
