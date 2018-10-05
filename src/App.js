import React,{Component} from 'react';
import {colors} from './ values';
import EvilEditor from './components/theeditor';
import favicon from './assets/favicon.png';
/*Icons*/
import splitIcon from './assets/spliticon.png';
import shareSVG from './assets/share-alt.svg';
import githubIcon from './assets/gh.svg';
/*CORE */
import evaluate from './evaluator';
import Conditional from 'react-simple-conditional';
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
        showEmbedWindow:false
    }
    componentDidMount(){
        // Mobile check
        if(window.innerWidth<window.innerHeight){
            this.setState({horizontal:false})
        }
        //iFrame?
        if(window.self !== window.top){
            this.setState({embedded:true})
        }
        //take care of the code in the URL
        let hash = window.location.hash;
        if(!hash) return true;
        let rex = /\/s\/(.+)/ig;
        let result = rex.exec(hash);
        if(!result) return true;
        let code = atob(result[1]);
        this.setState({code,fromURL:true});
        this.evaluateCode(code); 
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
        if(type=='embed'){
            target = this.embedref;
        }
        else if(type=='url'){
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
        let outputData = await evaluate(code);
        if(outputData && outputData.data){
            this.setState({outputData})
        }
        else{
            console.log(outputData);
        }
    }
    render() { 
        return ( <div className="container" style={{height:'100%'}}>
            {/* HEADER */}
            <div className="header" style={styles.header}>
                <img style={{height:30}} src={favicon} alt="EvilEval Icon"/>
                <div style={{marginLeft:10,flex:1}}>{`{evileval}`}</div>
                <div className="toolbar" style={styles.toolbar}>
                    <div style={styles.toolholder}>
                        <select name="fontSize" defaultValue={"24"} onChange={this.changeFontSize} style={{...styles.tool}}>
                            <option value="14">14px</option>
                            <option value="16">16px</option>
                            <option value="24">24px</option>
                            <option value="28">28px</option>
                            <option value="32">32px</option>
                            <option value="38">38px</option>
                            <option value="42">42px</option>
                        </select>
                    </div>
                    <div style={styles.toolholder}>
                        <img 
                        style={{...styles.tool,transform:`rotate(${this.state.horizontal?'0':'90'}deg) scale(0.8)`}} 
                        src={splitIcon} alt="splitIcon"
                        onClick={e=>this.setState({horizontal:!this.state.horizontal})}/>
                    </div>
                    <div style={styles.toolholder}>
                        <img src={shareSVG} 
                        onClick={e=>this.setState({showEmbedWindow:true})}
                        style={{...styles.tool,transform:`scale(1.14)`}} alt="Share"/>
                    </div>
                    <div style={styles.toolholder}>
                        <a style={{display:`block`}} href="https://github.com/theanam/evileval" target="_blank">
                            <img src={githubIcon} 
                            style={{...styles.tool,transform:`scale(1)`}} alt="Share"/>
                        </a>
                    </div>
                </div>
            </div>
            {/* BODY */}
            <div className="container" 
            style={{...styles.container,transition:`all 0.5s`,height:'100%',flexDirection:`${this.state.horizontal?'row':'column'}`}}>
                <EvilEditor value={this.state.code} onChange={this.evaluateCode} fontSize={this.state.fontSize} 
                style={{transition:`all 0.5s`,flex:1,height:'auto',width:`${this.state.horizontal?'auto':'100%'}`}}></EvilEditor>
                <div 
                style={{transition:`all 0.5s`,...styles.result,fontSize:`${this.state.fontSize}px`,...getBorder(this.state.horizontal)}}>
                    {this.state.outputData.data.map((d,i)=><Output style={{color:`${this.state.outputData.error?colors.RED:colors.WHITE}`}} key={i} index={i}>{d}</Output>)}
                </div>
            </div>
            {/* EMBED WINDOW */}
            <Conditional style={styles.embedw} condition={this.state.showEmbedWindow}>
                <div style={styles.embedholder}>
                    <p style={{marginTop:15}}>Link to this eval <span style={styles.copybtn} onClick={e=>this.copy('url')}>Copy</span></p>
                    <input value={`https://theanam.github.io/evileval/#/s/${btoa(this.state.code)}`}
                    ref={r=>this.urlref = r} style={styles.embfields}></input>
                    <p style={{marginTop:15}}>Embed Code of this eval <span style={styles.copybtn} onClick={e=>this.copy('embed')}>Copy</span></p>
                    <textarea ref={r=>this.embedref = r}
                    style={{...styles.embfields,height:'5em'}}
                    value={`<iframe width="100%" height="250px" src="https://theanam.github.io/evileval/#/s/${btoa(this.state.code)}"></iframe>`}></textarea>
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
        borderLeft:`2px solid ${colors.BLUE}`
    }
    else return {
       borderTop:`2px solid ${colors.BLUE}`
    }
}
const styles = {
    header:{
        display:'flex',
        alignItems:'center',
        padding:`8px 10px`,
        color:colors.WHITE,
        backgroundColor:colors.DARK,
        boxShadow:`0px 0px 4px 0px ${colors.EDITOR_HIGHLIGHT}`
    },
    toolbar:{
        display:"flex"
    },
    toolholder:{
        margin:`0px 10px`,
        cursor:'pointer'
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
        fontFamily: 'monospace',
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