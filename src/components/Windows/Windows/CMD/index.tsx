import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/Windows/Window'

import cmdIcon from '@/assets/images/icons/console_prompt-0.png'
import { KeyboardEventHandler, useRef, useState, useEffect } from 'react'

import { getNumberOfLinesInTextArea } from '@/lib/util_textarea'
import { isElementInClass } from '@/lib/util_DOM'

export interface CMDWindowProps {
    update?: Boolean
    triggerUpdate?: Function
    openWindow: Function
}
const CMDWindow = (props: CMDWindowProps) => {
    const { update, triggerUpdate, openWindow } = props
    const inputArea = useRef<HTMLTextAreaElement | null>(null)
    const [inputAreaLines, setInputAreaLines] = useState(1)
    const [inputRunner, setInputRunner] = useState<string>('C:\\> ')
    const [input, setInput] = useState<string>('')

    useEffect(() => {
    }, [input])

    useEffect(() => {
        // console.log('inputAreaLines updated:', inputAreaLines)
    }, [inputAreaLines])


    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        // Ensure 'event' is of type React.KeyboardEvent<HTMLInputElement>'
        // console.log('event', event)
        if (event.key === 'Backspace' && event.currentTarget.selectionStart === inputRunner.length) {
            // If Backspace key is pressed at the beginning of the inputRunner, prevent deletion
            event.preventDefault()
        }
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputValue = e.target.value
        // Check if the inputValue starts with the inputRunner
        if (inputValue.startsWith(inputRunner)) {
            // Remove only the leading inputRunner, keep the rest of the string
            setInput(inputValue.substring(inputRunner.length))
            const noOfLines:number = getNumberOfLinesInTextArea(inputArea.current!)
            setInputAreaLines(noOfLines+1)
        }
    }

    const focusTextinput = (event: React.MouseEvent<HTMLDivElement>|null) => {
        setTimeout(() => {
            if (inputArea.current !== null) {
                if (event) {
                    const target = event.target as Element
                    
                    if (!isElementInClass(target, [styles.input])) {
                        const { value } = inputArea.current
                        inputArea.current.setSelectionRange(value.length, value.length)
                        inputArea.current.focus()
                    }
                }
                else {
                    const { value } = inputArea.current
                    inputArea.current.setSelectionRange(value.length, value.length)
                    inputArea.current.focus()
                }
            }
        }, 100);
    }

    // TODO: Add mouse down handler on windowContainer that will focus input
    return <Window update={update} triggerUpdate={triggerUpdate}
        width={550} height={300}
        title='Command Prompt' icon={cmdIcon}
        onActive={focusTextinput}>

        <div className={styles.windowContainer}>
            <div className={`${globalStyles.border} ${styles.content}`}>

                <p className={styles.output}>
                    Output of text prompts...
                </p>
                <div className={styles.inputContainer}>
                    <textarea ref={inputArea} className={`${styles.input}`} rows={inputAreaLines}
                        value={inputRunner + input}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown} />
                </div>
            </div>
        </div>
    </Window>
}

export default CMDWindow