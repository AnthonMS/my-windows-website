import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/Windows/Window'

import cmdIcon from '@/assets/images/icons/console_prompt-0.png'
import { KeyboardEventHandler, useRef, useState, useEffect } from 'react'

import { getNumberOfLinesInTextArea } from '@/lib/util_textarea'
import { isElementInClass } from '@/lib/util_DOM'
import axios from 'axios'

import { isDirectorySyntax } from '@/lib/utils'

import * as commandsJson from '@/services/cmd_new/commands.json'
type Commands = Record<string, Command>
const commands: Commands = commandsJson as Commands

import { extractErrors, errorsToOutputString, Command } from '@/services/cmd_new'
import { Res } from '@/app/api/cmd/route'

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
    const [output, setOutput] = useState<string[]>(['Welcome to the Command Prompt Emulator!'])

    const windowRef = useRef<{ closeWindow?: () => void } | null>(null)

    const updateOutput = (str: string) => {
        hideInputArea()
        setOutput((prev) => [...prev, str])
        showInputArea()
        focusInputArea()
    }
    const clearOutput = () => {
        setOutput([])
    }
    const updateCommandHistory = (commandItem: CommandHistoryItem) => {
        setCommandHistory((prevHistory) => [...prevHistory, commandItem])
    }

    const execute = async () => {
        const commandItem: CommandHistoryItem = {
            dir: currentDir,
            command: command.trim() // Remove leading and trailing whitespace
        }
        updateCommandHistory(commandItem)
        updateOutput(currentDir + command)
        setCommand('')

        try {
            const res = await axios.post('/api/cmd', commandItem)
            const data: Res = await res.data
            
            if (data.message === "UNKNOWN_COMMAND") {
                updateOutput(`${data.command}: command not found`)
            }
            else if (data.message === "PARSED") {
                const cmdObj: Command = data.command as Command
                const errors = extractErrors(cmdObj)
    
                if (errors.length > 0) {
                    const errOutput = errorsToOutputString(data.config!, cmdObj, errors[0])
                    updateOutput(errOutput)
                }
                else {
                    console.log('EXECUTE COMMAND; NO ERRORS!', cmdObj)
                    // Handle command
                }
            }
        }
        catch (e) {
            console.log('CATCH ERROR:', e)
        }

    }


    // const handleCommand = (data: CommandResponse) => {
    //     const commandParsed: ParsedCommand = {
    //         command: data.parsedCommand,
    //         options: data.parsedOptions,
    //         arguments: data.parsedArgs
    //     }
    //     switch (data.parsedCommand) {
    //         case 'cd':
    //             cd(commandParsed)
    //             break;
    //         case 'pwd':
    //             pwd(commandParsed)
    //             break;
    //         case 'clear':
    //             clear(commandParsed)
    //             break;
    //         case 'ping':
    //             ping(commandParsed)
    //             break;
    //         default:
    //             defaultCommand(commandParsed)
    //             break;
    //     }
    // }

    // const showHelp = (data: CommandResponse) => {
    //     let outputMsg: string = ''
    //     outputMsg = `${data.parsedCommand}: ${data.usage}\n`
    //     outputMsg += `${data.help}\n\n`
    //     outputMsg += `\tOptions:\n`
    //     if (data.options) {
    //         data.options.map((option: { option: string, usage: string, description: string }) => {
    //             outputMsg += `\t\t ${option.usage} \t ${option.description}\n`
    //         })
    //     }
    //     outputMsg += `\n`
    //     updateOutput(outputMsg)
    // }

    // const showError = (data: CommandResponse) => {
    //     // const formattedInvalidOptions = data.invalidOptions.map((arg: string) => `'${arg}'`).join(', ')
    //     // const formattedArgs = data.parsedArgs.map((arg: string) => `'${arg}'`).join(', ')
    //     let MISSING_ARG_MSG = `${data.parsedCommand}: ${data.message}\n`
    //     MISSING_ARG_MSG += `Usage: ${data.usage}\n\n`
    //     if (data.options) {
    //         MISSING_ARG_MSG += `Options:\n`
    //         data.options.map((option: { option: string, usage: string, description: string }) => {
    //             MISSING_ARG_MSG += `\t ${option.usage} \t ${option.description}\n`
    //         })
    //         MISSING_ARG_MSG += `\n`
    //     }
    //     if (data.arguments) {
    //         MISSING_ARG_MSG += `Arguments:\n`
    //         data.arguments.map((arg: { name: string, description: string, required: boolean }) => {
    //             MISSING_ARG_MSG += `\t ${arg.name} \t ${arg.description}\n`
    //         })
    //         MISSING_ARG_MSG += `\n`
    //     }
    //     updateOutput(MISSING_ARG_MSG)
    // }

    // const handleError = (data: CommandResponse) => {
    //     if (data.error === 'UNKNOWN_COMMAND') {
    //         updateOutput(`${data.parsedCommand}: command not found`)
    //     }
    //     else {
    //         showError(data)
    //     }
    // }


    // const cd = (data: ParsedCommand) => {
    //     // TODO: Handle options and arguments for changing directory
    //     // Since command was parsed successfully, we know there is a single argument in data
    //     let path = data.arguments[0]
    //     const pathValid = isDirectorySyntax(path)
    //     if (pathValid) {
    //         if (typeof pathValid === 'string') {
    //             path = pathValid
    //         }
    //         // Remove the ending "/" from the path if it has one
    //         path = path.replace(/\/$/, '')

    //         const startsWithSlash = /^\//.test(path)
    //         if (startsWithSlash) { // if path starts with "/" then we want to override the currentDir with C:\${path}>
    //             const finalPath = path.replace(/\//g, '\\') // Replace '/' with '\'
    //             setCurrentDir(`C:${finalPath}> `)

    //         }
    //         else { // if path does not start with "/" we want to add to currentDir
    //             // RegEx to capture content between ":" and ">" in currentDir
    //             const currentPathMatch = currentDir.match(/:(.*?)(?=>)/)
    //             // Extracting the captured content or empty string
    //             let finalPath = currentPathMatch ? currentPathMatch[1] : ''
    //             const endsWithBackslash = /\\$/.test(finalPath)
    //             if (!endsWithBackslash) {
    //                 finalPath += '\\'
    //             }
    //             path = path.replace(/\//g, '\\') // Replace '/' with '\'
    //             finalPath += path
    //             setCurrentDir(`C:${finalPath}> `)

    //         }
    //     }
    //     else {
    //         const outputMsg = `${data.command}: path invalid "${path}"\n`
    //         updateOutput(outputMsg)
    //     }
    // }

    // const pwd = (data: ParsedCommand) => {
    //     // TODO: Handle options and arguments for showing pwd
    //     // RegEx to capture content between ":" and ">" in currentDir
    //     const currentPathMatch = currentDir.match(/:(.*?)(?=>)/)
    //     // Extracting the matched content or empty string
    //     let currentPath = currentPathMatch ? currentPathMatch[1] : ''
    //     const endsWithBackslash = /\\$/.test(currentPath)
    //     if (!endsWithBackslash) {
    //         currentPath += '\\'
    //     }
    //     const currentDrive = currentDir.charAt(0)
    //     currentPath = "\\" + currentDrive + currentPath
    //     currentPath = currentPath.replace(/\\/g, '/') // Replace all "\\" with "/"
    //     updateOutput(currentPath)
    // }

    // const clear = (data: ParsedCommand) => {
    //     // TODO: Handle options and arguments for clearing console
    //     clearOutput()
    // }
    // const ping = (data: ParsedCommand) => {
    //     console.log('PING TARGET!', data)
    // }

    const defaultCommand = (data: Command) => {
        console.log(`${data.command} is not a command that is handled in the frontend yet. Sorry.`)
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