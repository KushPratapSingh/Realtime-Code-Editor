import React, { useEffect, useRef } from 'react'
import "codemirror/mode/javascript/javascript"
import "codemirror/theme/dracula.css"
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';  // Import closeBrackets addon
import 'codemirror/lib/codemirror.css'

import CodeMirror from 'codemirror'
import ACTIONS, { CODE_CHANGE } from '../Actions';
const Editor = ({socketRef, roomId, onCodeChange}) => {
  const editorRef = useRef(null);
    useEffect(()=>{
        async function init() {
          
          editorRef.current = CodeMirror.fromTextArea(document.getElementById('realTimeEditor'), {
            mode:{name:'javascript', json:true},
            theme:'dracula',
            autoCloseTags:true,
            autoCloseBrackets:true,
            lineNumbers:true
          });

          editorRef.current.on('change', (instance , changes)=>{
            // console.log('changes', changes);
            const {origin} = changes;

            const code = instance.getValue();
             onCodeChange(code);
            if(origin !== 'setValue'){
              // console.log('working', code)
               socketRef.current.emit(ACTIONS.CODE_CHANGE,{
                roomId,
                code
               } )
            }
            // console.log(code);
            
          });

          // socketRef.current.on(ACTIONS.CODE_CHANGE, ({code})=>{
          //   console.log('recieving phle ',code);
          //   if(code !== null){
          //     editorRef.current.setValue(code);
          //   }
          // })
        }
        init();
      }, []);


      
      useEffect(()=>{

        if(socketRef.current){
          socketRef.current.on(ACTIONS.CODE_CHANGE, ({code})=>{
            // console.log('recieving phle ',code);
            if(code !== null){
              editorRef.current.setValue(code);
            }
          });
        }
        
        return ()=>{
          socketRef.current.off(ACTIONS.CODE_CHANGE)
        }
      } , [socketRef.current])
      return (
        <div >
            <textarea id="realTimeEditor"></textarea>
        </div>
      )
}

export default Editor
