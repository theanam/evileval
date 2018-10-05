import React,{Component} from 'react';
import {colors} from './ values';
import EvilEditor from './components/theeditor';
import favicon from './assets/favicon.png';
/*Icons*/
import splitIcon from './assets/spliticon.png';
import shareSVG from './assets/share-alt.svg'; 
/*CORE */
import evaluate from './evaluator';
// RENDER LIST
function Output(props){
    return (<div
    style={{...props.style,...styles.resultParts,backgroundColor:(props.index%2)?'rgba(255,255,255,0.2)':'rgba(0,0,0,0.2)'}}>
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
        code:""
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
                        <img src={shareSVG} style={{...styles.tool,transform:`scale(1.14)`}} alt="Share"/>
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
    }
}