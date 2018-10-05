import React from 'react';
import AceEditor from 'react-ace';
import 'brace/mode/javascript';
import 'brace/theme/monokai';
function EvilEditor(props){
    return (<AceEditor
        mode="javascript"
        theme="monokai"
        name="evileval"
        style={props.style}
        value={props.value}
        // onLoad={props.onLoad}
        onChange={props.onChange}
        fontSize={props.fontSize||20}
        showPrintMargin={true}
        showGutter={true}
        highlightActiveLine={true}
        setOptions={{
            showLineNumbers: true,
            tabSize: 2,
        }}/>);
}
export default EvilEditor;