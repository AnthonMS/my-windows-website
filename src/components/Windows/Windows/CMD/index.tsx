import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/Windows/Window'

import cmdIcon from '@/assets/images/icons/console_prompt-0.png'
import { KeyboardEventHandler, useRef, useState, useEffect } from 'react'

import { getNumberOfLinesInTextArea } from '@/lib/util_textarea'
import { isElementInClass } from '@/lib/util_DOM'
import axios from 'axios'

import { CommandResponse } from '@/services/cmd'
import { isDirectorySyntax } from '@/lib/utils'

import { ParsedCommand } from '@/services/cmd/util_cmdParsing'
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

    const windowRef = useRef<{ closeWindow?: () => void } | null>(null)

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

        const res = await axios.post('/api/cmd', commandItem)
        const data: CommandResponse = await res.data

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

    const handleCommand = (data: CommandResponse) => {
        let outputMsg: string = ''
        switch (data.success) {
            case 'HELP':
                outputMsg = `${data.parsedCommand}: ${data.usage}\n`
                outputMsg += `${data.help}\n\n`
                outputMsg += `\tOptions:\n`
                if (data.options) {
                    data.options.map((option: { option: string, usage: string }) => {
                        outputMsg += `\t\t ${option.option} \t ${option.usage}\n`
                    })
                }
                outputMsg += `\n`
                updateOutput(outputMsg)
                break;
            case 'EXECUTE':
                const commandParsed: ParsedCommand = {
                    command: data.parsedCommand,
                    options: data.parsedOptions,
                    arguments: data.parsedArgs
                }
                switch (data.parsedCommand) {
                    case 'cd':
                        cd(commandParsed)
                        break;
                    default:
                        console.log(`${data.parsedCommand} is not a command that is handled in the frontend yet. Sorry.`)
                        break;
                }
                break;
            default:
                break;
        }
    }

    const cd = (data: ParsedCommand) => {
        // Since command was parsed successfully, we know there is a single argument in data
        let path = data.arguments[0]
        const pathValid = isDirectorySyntax(path)
        if (pathValid) {
            if (typeof pathValid === 'string') {
                path = pathValid
            }
            // Remove the ending "/" from the path if it has one
            path = path.replace(/\/$/, '')

            const startsWithSlash = /^\//.test(path)
            if (startsWithSlash) { // if path starts with "/" then we want to override the currentDir with C:\${path}>
                const finalPath = path.replace(/\//g, '\\') // Replace '/' with '\'
                setCurrentDir(`C:${finalPath}> `)

            }
            else { // if path does not start with "/" we want to add to currentDir
                // RegEx to capture content between ":" and ">"
                const match = currentDir.match(/:(.*?)(?=>)/)
                // Extracting the captured content or empty string
                let finalPath = match ? match[1] : ''
                const endsWithBackslash = /\\$/.test(finalPath)
                if (!endsWithBackslash) {
                    finalPath += '\\'
                }
                path = path.replace(/\//g, '\\') // Replace '/' with '\'
                finalPath += path
                setCurrentDir(`C:${finalPath}> `)

            }

        }
        else {
            const outputMsg = `${data.command}: path invalid "${path}"\n`
            updateOutput(outputMsg)
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

    return <Window ref={windowRef} update={update} triggerUpdate={triggerUpdate}
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
                            {indentedText}
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