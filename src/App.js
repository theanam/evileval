import React,{Component} from 'react';
import {colors} from './ values';
import EvilEditor from './components/theeditor';
import favicon from './assets/favicon.png';
/*Icons*/
import splitIcon from './assets/spliticon.png';
import shareSVG from './assets/share-alt.svg'; 
/*CORE */
import evaluate from './evaluator';
class App extends Component {
    state = {
        horizontal:true,
        fontSize:24
    }
    changeFontSize=(e)=>{
        let fontSize = +e.target.value;
        if(Number.isInteger(fontSize)){
            this.setState({fontSize})
        }
    }
    time_out=null;
    evaluateCode =(code)=> {
        if(this.time_out){
            clearTimeout(this.time_out);
            this.time_out = null;
        }
        this.time_out = setTimeout(()=>this.doEval(code),800)
    }
    doEval=async (code)=>{
        this.time_out = null;
        let result = await evaluate(code);
        console.log(result);
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
            style={{...styles.container,height:'100%',flexDirection:`${this.state.horizontal?'row':'column'}`}}>
                <EvilEditor onChange={this.evaluateCode} fontSize={this.state.fontSize} 
                style={{flex:1,height:'auto',width:`${this.state.horizontal?'auto':'100%'}`}}></EvilEditor>
                <div style={{...styles.result,fontSize:`${this.state.fontSize}px`,...getBorder(this.state.horizontal)}}>
                hello
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
        padding:`0px 10px`,
        fontFamily: 'monospace',
    }
}