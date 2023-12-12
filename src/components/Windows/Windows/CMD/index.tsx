import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/Windows/Window'

import cmdIcon from '@/assets/images/icons/console_prompt-0.png'
import { KeyboardEventHandler, useState } from 'react'

export interface CMDWindowProps {
    update?: Boolean
    triggerUpdate?: Function
    openWindow: Function
}
const CMDWindow = (props: CMDWindowProps) => {
    const { update, triggerUpdate, openWindow } = props
    const [inputRunner, setInputRunner] = useState<string>('C:\\>')
    const [input, setInput] = useState<string>('')

    
    const handleKeyDown: React.KeyboardEventHandler<HTMLInputElement> = (event) => {
        // Ensure 'event' is of type React.KeyboardEvent<HTMLInputElement>'
        console.log('event', event)
    }

    return <Window update={update} triggerUpdate={triggerUpdate}
        width={550} height={300}
        title='Command Prompt' icon={cmdIcon}>

        <div className={styles.windowContainer}>
            <div className={`${globalStyles.border} ${styles.content}`}>

                <p className={styles.output}>
                    Output of text prompts...
                </p>
                <div className={styles.inputContainer}>
                    <span className={styles.inputRunner}>{ inputRunner }</span>
                    <input type='text' className={`${styles.input}`} 
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown} />
                </div>
            </div>
        </div>
    </Window>
}

export default CMDWindow