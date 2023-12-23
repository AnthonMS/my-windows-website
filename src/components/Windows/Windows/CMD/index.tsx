import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/Windows/Window'

import cmdIcon from '@/assets/images/icons/console_prompt-0.png'
import { KeyboardEventHandler, useRef, useState, useEffect } from 'react'

import { getNumberOfLinesInTextArea } from '@/lib/util_textarea'
import { isElementInClass } from '@/lib/util_DOM'
import axios from 'axios'

// import { executeCommand } from "@/services/cmd"

interface CommandHistoryItem {
    dir: string
    command: string
}
export interface CMDWindowProps {
    update?: Boolean
    triggerUpdate?: Function
    openWindow: Function
}
const CMDWindow = (props: CMDWindowProps) => {
    const { update, triggerUpdate, openWindow } = props
    const inputArea = useRef<HTMLTextAreaElement | null>(null)
    const [inputAreaLines, setInputAreaLines] = useState(1)
    const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
    const [currentDir, setCurrentDir] = useState<string>('C:\\> ')
    const [command, setCommand] = useState<string>('')
    const [output, setOutput] = useState<string[]>([])

    const updateOutput = (str: string) => {
        setOutput((prev) => [...prev, str])
        focusInputArea()
    }
    const updateCommandHistory = (commandItem: CommandHistoryItem) => {
        setCommandHistory((prevHistory) => [...prevHistory, commandItem])
    }


    const execute = async () => {
        const commandItem: CommandHistoryItem = {
            dir: currentDir,
            command: command
        }
        updateCommandHistory(commandItem)
        updateOutput(currentDir + command)
        setCommand('')

        hideInputArea()

        // const res = executeCommand(commandItem.dir, commandItem.command)
        // console.log('res:', res)
        // if (!res.error) {
        //     handleCommand(res)
        // }
        // else {
        //     handleError(res)
        // }

        const res = await axios.post('/api/cmd', commandItem)
        const data = await res.data

        if (res.status === 200) {
            if (!data.error) {
                handleCommand(data)
            }
            else {
                handleError(data)
            }
        }
        else {
            console.error('ERROR:', data)
        }

        showInputArea()
        focusInputArea()
    }

    const handleCommand = (data: any) => {
        console.log('HANDLE COMMAND:', data)
        let outputMsg: string = ''
        switch (data.success) {
            case 'HELP':
                outputMsg = `${data.parsedCommand}: ${data.usage}\n`
                outputMsg += `${data.help}\n\n\t`
                outputMsg += `Options:\n\t`
                data.options.map((option: { option: string, usage: string }) => {
                    outputMsg += `\t ${option.option} \t ${option.usage}\n\t`
                })
                outputMsg += `\n`
                updateOutput(outputMsg)
                break;
            case 'EXECUTE':
                console.log('Executing command:', data.parsedCommand)
                console.log('Options:', data.parsedOptions)
                console.log('Args:', data.parsedArgs)
                break;
            default:
                break;
        }
    }

    const handleError = (data: any) => {
        switch (data.error) {
            case 'UNKNOWN_COMMAND':
                let UNKNOWN_COMMAND_MSG = `${data.parsedCommand}: command not found`
                updateOutput(UNKNOWN_COMMAND_MSG)
                break;
            case 'UNKNOWN_OPTION':
                // Encapsulate each item in "'" and separate them with ", "
                const formattedInvalidOptions = data.invalidOptions.map((arg: string) => `'${arg}'`).join(', ')
                let UNKNOWN_OPTION_MSG = `${data.parsedCommand}: unknown option: ${formattedInvalidOptions}\n`
                UNKNOWN_OPTION_MSG += `Usage: ${data.usage}\n\n`
                UNKNOWN_OPTION_MSG += `Options:\n`
                data.options.map((option: { option: string, usage: string }) => {
                    UNKNOWN_OPTION_MSG += `\t ${option.option} \t ${option.usage}\n`
                })
                UNKNOWN_OPTION_MSG += `\n`
                updateOutput(UNKNOWN_OPTION_MSG)
                break;
            case 'UNKNOWN_OPTION_ARG': // TODO: Create output when error: unknown argument for option
                // const formattedInvalidOptions = data.invalidOptions.map((arg: string) => `'${arg}'`).join(', ')
                // let UNKNOWN_OPTION_MSG = `${data.parsedCommand}: unknown option: ${formattedInvalidOptions}\n`
                // UNKNOWN_OPTION_MSG += `Usage: ${data.usage}\n\n`
                // UNKNOWN_OPTION_MSG += `Options:\n`
                // data.options.map((option: { option: string, usage: string }) => {
                //     UNKNOWN_OPTION_MSG += `\t ${option.option} \t ${option.usage}\n`
                // })
                // UNKNOWN_OPTION_MSG += `\n`
                // updateOutput(UNKNOWN_OPTION_MSG)
                break;
            case 'UNKNOWN_ARG':
                const formattedArgs = data.parsedArgs.map((arg: string) => `'${arg}'`).join(', ')
                let UNKNOWN_ARG_MSG = `${data.parsedCommand}: unknown argument: ${formattedArgs}\n`
                UNKNOWN_ARG_MSG += `Usage: ${data.usage}\n\n`
                UNKNOWN_ARG_MSG += `Options:\n`
                data.options.map((option: { option: string, usage: string }) => {
                    UNKNOWN_ARG_MSG += `\t ${option.option} \t ${option.usage}\n`
                })
                UNKNOWN_ARG_MSG += `\n`
                updateOutput(UNKNOWN_ARG_MSG)
                break;
            default:
                break;
        }
    }


    const handleKeyDown: KeyboardEventHandler<HTMLTextAreaElement> = (event) => {
        const cursorPosition = event.currentTarget.selectionStart

        if (event.key === 'Backspace' && cursorPosition === currentDir.length) {
            // If Backspace key is pressed at the beginning of the currentDir, prevent deletion
            event.preventDefault()
        }
        else if (event.key === 'Enter') {
            event.preventDefault()
            execute()
        }
        else if (event.key === 'ArrowLeft' && cursorPosition <= currentDir.length) {
            // If left arrow key is pressed at or before the end of currentDir, prevent moving further left
            event.preventDefault()
        }
    }


    const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const inputValue = e.target.value
        // Check if the inputValue starts with the currentDir
        if (inputValue.startsWith(currentDir)) {
            // Remove only the leading currentDir, keep the rest of the string
            setCommand(inputValue.substring(currentDir.length))
            const noOfLines: number = getNumberOfLinesInTextArea(inputArea.current!)
            setInputAreaLines(noOfLines + 1)
        }
    }

    // Function called 
    const focusInputOnEvent = (event: React.MouseEvent<HTMLDivElement>) => {
        setTimeout(() => {
            if (inputArea.current !== null) {
                if (event) {
                    const target = event.target as Element
                    const isClickInInput = isElementInClass(target, styles.input)
                    const isClickInOutput = isElementInClass(target, styles.output)
                    const selectedText = window.getSelection()?.toString() || ''
                    const isTextSelectedInOutput = isClickInOutput && selectedText.length > 0

                    // Dont focus input if click is inside input or output
                    if (!isClickInInput && !isClickInOutput) {
                        focusInputArea()
                    } 
                    // If click is in output check if there is text selected, if not, focus the input
                    else if (isClickInOutput && !isTextSelectedInOutput) {
                        // Focus the input only if there is no text selected in the output
                        focusInputArea()
                    }
                }
                else {
                    focusInputArea()
                }
            }
        }, 100);
    }

    const focusInputArea = () => {
        if (inputArea.current) {
            const { value } = inputArea.current
            inputArea.current.setSelectionRange(value.length, value.length)
            inputArea.current.focus()
        }
    }
    const hideInputArea = () => {
        if (inputArea.current) {
            inputArea.current.style.display = 'none'
        }
    }

    const showInputArea = () => {
        if (inputArea.current) {
            inputArea.current.style.display = ''
        }
    }


    return <Window update={update} triggerUpdate={triggerUpdate}
        width={550} height={300}
        title='Command Prompt' icon={cmdIcon}
        onActive={focusInputOnEvent}>

        <div className={styles.windowContainer}>
            <div className={`${globalStyles.border} ${styles.content}`}>

                <p className={styles.output}>
                    Welcome to the Command Prompt Emulator!
                </p>

                {
                    output.map((out, index) => {
                        const indentedText = out.replace(/\t/g, '  ')
                        return <p key={`output-${index}`} className={styles.output}>
                            { indentedText }
                        </p>
                    })
                }

                <div className={styles.inputContainer}>
                    <textarea ref={inputArea} className={`${styles.input}`} rows={inputAreaLines}
                        value={currentDir + command}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown} />
                </div>
            </div>
        </div>
    </Window>
}

export default CMDWindow