import React,{Component} from 'react';
import {colors} from './ values';
import EvilEditor from './theeditor';
import favicon from './assets/favicon.png';
import {_encode,_decode} from './base64';
/*Icons*/
import splitIcon from './assets/spliticon.png';
import shareSVG from './assets/share-alt.svg';
import githubIcon from './assets/gh.svg';
import babelIcon from './assets/babel.svg';
import iconOn from './assets/toggle-on.svg';
import iconOff from './assets/toggle-off.svg';
/*CORE */
import evaluate from './evaluator';
import Conditional from 'react-simple-conditional';
let _jst = function(ob){
    return JSON.stringify(ob);
}
// RENDER LIST
function Output(props){
    return (<div
    style={{...props.style,...styles.resultParts,backgroundColor:(props.index%2)?'rgba(255,255,255,0.1)':'rgba(0,0,0,0.1)'}}>
        {props.children}
    </div>)
}
class App extends Component {
    state = {
        horizontal:true,
        fontSize:24,
        outputData:{
            error:false,
            data:[]
        },
        code:"",
        embedded:false,
        fromURL:false,
        showEmbedWindow:false,
        babel:true
    }
    componentDidMount(){
        // Mobile check
        if(window.innerWidth<window.innerHeight){
            this.setState({horizontal:false,fontSize:14})
        }
        //iFrame?
        if(window.self !== window.top){
            this.setState({embedded:true,fontSize:14});
        }
        //take care of the code in the URL
        let hash = window.location.hash;
        if(!hash) return true;
        let rex = /\/s\/(.+)/ig;
        let result = rex.exec(hash);
        if(!result) return true;
        let _code = _decode(result[1]);
        let code = _code;
        let babel = true;
        let fromURL = true;
        try{
            _code = JSON.parse(_code);
            code  = _code.code;
            babel = _code.babel; 
        }catch(e){
            console.log("Old Embed without babel information");
        }finally{
            this.setState({code,babel,fromURL});
            this.evaluateCode(code);
        }
    }
    changeFontSize=(e)=>{
        let fontSize = +e.target.value;
        if(Number.isInteger(fontSize)){
            this.setState({fontSize})
        }
    }
    time_out=null;
    evaluateCode =(code)=> {
        this.code=code;
        if(this.time_out){
            clearTimeout(this.time_out);
            this.time_out = null;
        }
        if(code && typeof code === "string" && code.trim()){
            this.time_out = setTimeout(()=>this.doEval(code),800);
        }
        else{
            this.setState({
                outputData:{
                    data:[],
                    error:false,
                },
                code:""
            })
        }
    }
    copy=(type)=>{
        let target=null;
        if(type==='embed'){
            target = this.embedref;
        }
        else if(type==='url'){
            target = this.urlref;
        }
        else{
            return false;
        }
        // Using the old API for maximum compatibility
        target.focus();
        target.select();
        document.execCommand('copy');
        console.log("Copied");
    }
    doEval=async (code)=>{
        this.setState({code})
        this.time_out = null;
        let outputData = await evaluate(code,this.state.babel);
        if(outputData && outputData.data){
            this.setState({outputData})
        }
        else{
            console.log(outputData);
        }
    }
    toggleBabel=()=>{
        this.setState({babel:!this.state.babel});
        this.evaluateCode(this.state.code);
    }
    render() { 
        return ( <div className="container" style={{height:'100%',display:'flex',flexDirection:'column'}}>
            {/* HEADER */}
            <div className="header" style={styles.header}>
                <img style={{height:30}} src={favicon} alt="EvilEval Icon"/>
                <Conditional condition={!this.state.embedded} className="logoname" style={{marginLeft:10,fontFamily:'monospace',fontSize:`1.1em`}}>{`{evileval}`}</Conditional>
                <div style={{flex:1}}></div>
                <div className="toolbar" style={styles.toolbar}>
                    <Conditional condition={!this.state.embedded} style={styles.toolholder}>
                        <select name="fontSize" defaultValue={this.state.fontSize} onChange={this.changeFontSize} style={{...styles.tool}}>
                            <option value="14">14px</option>
                            <option value="16">16px</option>
                            <option value="24">24px</option>
                            <option value="28">28px</option>
                            <option value="32">32px</option>
                            <option value="38">38px</option>
                            <option value="42">42px</option>
                        </select>
                    </Conditional>
                    <Conditional condition={!this.state.embedded}
                    onClick={this.toggleBabel}
                     style={{...styles.toolholder}}>
                        <img src={babelIcon} style={{height:20,transform:`translateY(2px)`}} alt="Babel"></img>
                        <img src={this.state.babel?iconOn:iconOff} 
                        style={{...styles.tool,transform:'scale(1.9)',marginLeft:10}} 
                        alt="babelState"></img>
                    </Conditional>
                    <Conditional condition={!this.state.embedded} style={styles.toolholder}>
                        <img 
                        style={{...styles.tool,transform:`rotate(${this.state.horizontal?'0':'90'}deg) scale(0.8)`}} 
                        src={splitIcon} alt="splitIcon"
                        onClick={e=>this.setState({horizontal:!this.state.horizontal})}/>
                    </Conditional>
                    <Conditional condition={!this.state.embedded}style={styles.toolholder}>
                        <img src={shareSVG} 
                        onClick={e=>this.setState({showEmbedWindow:true})}
                        style={{...styles.tool,transform:`scale(1.14)`}} alt="Share"/>
                    </Conditional>
                    <Conditional condition={!this.state.embedded} style={styles.toolholder}>
                        <a style={{display:`block`}} rel="noopener noreferrer" href="https://evileval.io" target="_blank">
                            <img src={githubIcon} 
                            style={{...styles.tool,transform:`scale(1)`}} alt="Share"/>
                        </a>
                    </Conditional>
                    <Conditional condition={this.state.embedded}>
                        <a style={{display:`block`}} rel="noopener noreferrer" href={`https://evileval.io/#/s/${_encode(_jst({code:this.state.code,babel:this.state.babel}))}`} target="_blank">
                            <img src={shareSVG} 
                            style={{...styles.tool,transform:`scale(1)`}} alt="Share"/>
                        </a>
                    </Conditional>
                </div>
            </div>
            {/* BODY */}
            <div className="container" 
            style={{...styles.container,transition:`all 0.5s`,flex:1,flexDirection:`${this.state.horizontal?'row':'column'}`}}>
                <EvilEditor value={this.state.code} onChange={this.evaluateCode} fontSize={this.state.fontSize} 
                style={{transition:`all 0.5s`,flex:1,height:'auto',width:`${this.state.horizontal?'auto':'100%'}`}}></EvilEditor>
                <div className="resultview"
                style={{transition:`all 0.5s`,...styles.result,fontSize:`${this.state.fontSize}px`,...getBorder(this.state.horizontal)}}>
                    {this.state.outputData.data.map((d,i)=><Output style={{color:`${this.state.outputData.error?colors.RED:colors.WHITE}`}} key={i} index={i}>{d}</Output>)}
                </div>
            </div>
            {/* EMBED WINDOW */}
            <Conditional style={styles.embedw} condition={this.state.showEmbedWindow}>
                <div style={styles.embedholder}>
                    <p style={{marginTop:15}}>Link to this eval <span style={styles.copybtn} onClick={e=>this.copy('url')}>Copy</span></p>
                    <input value={`https://evileval.io/#/s/${_encode(_jst({code:this.state.code,babel:this.state.babel}))}`}
                    ref={r=>this.urlref = r} style={styles.embfields}></input>
                    <p style={{marginTop:15}}>Embed Code of this eval <span style={styles.copybtn} onClick={e=>this.copy('embed')}>Copy</span></p>
                    <textarea ref={r=>this.embedref = r}
                    style={{...styles.embfields,height:'5em'}}
                    value={`<iframe width="100%" height="250px" src="https://evileval.io/#/s/${_encode(_jst({code:this.state.code,babel:this.state.babel}))}"></iframe>`}></textarea>
                    <div style={{marginTop:20,textAlign:'right'}}>
                        <div style={styles.closebutton} onClick={e=>this.setState({showEmbedWindow:false})}>
                            Close
                        </div>
                    </div>
                </div>
            </Conditional>
        </div> );
    }
}
 
export default App;
function getBorder(horiz){
    if(horiz) return {
        borderLeft:`2px solid ${colors.BLUE}`,
        maxWidth:'50%'
    }
    else return {
       borderTop:`2px solid ${colors.BLUE}`,
    }
}
const styles = {
    header:{
        display:'flex',
        alignItems:'center',
        padding:`8px 10px`,
        color:colors.WHITE,
        backgroundColor:colors.DARK,
        overflowX:'hidden',
        boxShadow:`0px 0px 4px 0px ${colors.EDITOR_HIGHLIGHT}`
    },
    toolbar:{
        display:"flex"
    },
    toolholder:{
        margin:`0px 10px`,
        cursor:'pointer',
        display:'flex',
        alignItems: 'center',
    },
    tool:{
        height:`25px`,
        transition:'all 0.5s'
    },
    container:{
        display:'flex'
    },
    result:{
        flex:1,
        backgroundColor:colors.EDITOR_SIDE,
        color:colors.WHITE,
        boxSizing:`border-box`,
        fontFamily: 'monospace'
    },
    resultParts:{
        padding:`0.083em 10px`
    },
    embedw:{
        position:'fixed',
        top:0,
        left:0,
        width:'100%',
        height:'100%',
        backgroundColor:`rgba(0,0,0,0.3)`,
        zIndex:3000,
        display:`flex`,
        alignItems: 'center',
        justifyContent: 'center',
    },
    embedholder:{
        padding:25,
        backgroundColor:colors.DARK,
        color:colors.WHITE,
        minWidth:`40vw`,
        maxWidth:`80vw`,
        borderRadius:6,
        boxShadow:`2px 2px 8px 0px ${colors.DARK_SHADOW}`,
        display:'flex',
        flexDirection:'column',
        alignItems:'stretch'
    },
    embfields:{
        padding:7,
        borderRadius:4,
        marginTop:15,
        fontSize:16,
        backgroundColor:'#555',
        boxShadow:'none',
        border:`1px solid #333`,
        color:`#eee`
    },
    copybtn:{
        display:'inline-block',
        backgroundColor:colors.BLUE,
        color:colors.WHITE,
        padding:`3px 4px`,
        borderRadius:3,
        cursor:'pointer'
    },
    closebutton:{
        backgroundColor:colors.BLUE,
        color:colors.WHITE,
        padding:`15px 20px`,
        display:'inline-block',
        borderRadius:4,
        cursor:'pointer'
    }
}