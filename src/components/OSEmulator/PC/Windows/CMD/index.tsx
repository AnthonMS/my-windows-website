import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/OSEmulator/PC/Window'

import cmdIcon from '@/assets/images/icons/console_prompt-0.png'
import { KeyboardEventHandler, useRef, useState, useEffect } from 'react'

import { getNumberOfLinesInTextArea } from '@/lib/util_textarea'
import { isElementInClass } from '@/lib/util_DOM'
import axios from 'axios'

import { isDirectorySyntax, isTouch } from '@/lib/utils'

import * as commandsJson from '@/services/cmd/commands.json'
type Commands = Record<string, Command>
const commands: Commands = commandsJson as Commands

import { extractErrors, errorsToOutputString, Command } from '@/services/cmd'
import { Res } from '@/app/api/cmd/route'

import { useWindowStore } from '@/stores/windowStore'

import { ping as actualPing } from '@/services/cmd/commands/ping'

interface CommandHistoryItem {
    dir: string
    command: string
}
export interface CMDWindowProps {
}
const CMDWindow = (props: CMDWindowProps) => {
    const { } = props
    const { openWindow } = useWindowStore()
    const inputArea = useRef<HTMLTextAreaElement | null>(null)
    const [inputAreaLines, setInputAreaLines] = useState(1)
    const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(0)
    const [currentDir, setCurrentDir] = useState<string>('C:\\> ')
    const [command, setCommand] = useState<string>('')
    const [output, setOutput] = useState<string[]>(['Welcome to the Command Prompt Emulator!'])

    const windowRef = useRef<{} | null>(null)

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
        setCommandHistory((prevHistory) => {
            setHistoryIndex([...prevHistory, commandItem].length)
            return [...prevHistory, commandItem]
        })
    }

    const execute = async () => {
        const commandItem: CommandHistoryItem = {
            dir: currentDir,
            command: command.trim() // Remove leading and trailing whitespace
        }
        updateCommandHistory(commandItem)
        updateOutput(currentDir + command)
        setCommand('')
        // here we should set the commandHistoryIndex to the last index in commandHistory

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
                    // console.log('EXECUTE COMMAND; NO ERRORS!', cmdObj)
                    // Handle command
                    switch (cmdObj.command) {
                        case 'cd':
                            cd(cmdObj)
                            break;
                        case 'pwd':
                            pwd(cmdObj)
                            break;
                        case 'clear':
                            clear(cmdObj)
                            break;
                        case 'ping':
                            ping(cmdObj)
                            break;
                        default:
                            defaultCommand(cmdObj)
                            break;
                    }
                }
            }
        }
        catch (e) {
            console.log('CATCH ERROR:', e)
        }

    }

    const cd = (data: Command) => {
        // TODO: Handle options for changing directory
        // Since command was parsed successfully, we know there is a single argument in data
        let path = data.arguments!.find(arg => arg.name === 'dir')!.value
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
                // RegEx to capture content between ":" and ">" in currentDir
                const currentPathMatch = currentDir.match(/:(.*?)(?=>)/)
                // Extracting the captured content or empty string
                let finalPath = currentPathMatch ? currentPathMatch[1] : ''
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
    const pwd = (data: Command) => {
        // TODO: Handle options pwd
        // RegEx to capture content between ":" and ">" in currentDir
        const currentPathMatch = currentDir.match(/:(.*?)(?=>)/)
        // Extracting the matched content or empty string
        let currentPath = currentPathMatch ? currentPathMatch[1] : ''
        const endsWithBackslash = /\\$/.test(currentPath)
        if (!endsWithBackslash) {
            currentPath += '\\'
        }
        const currentDrive = currentDir.charAt(0)
        currentPath = "\\" + currentDrive + currentPath
        currentPath = currentPath.replace(/\\/g, '/') // Replace all "\\" with "/"
        updateOutput(currentPath)
    }
    const clear = (data: Command) => {
        // TODO: Handle options and arguments for clearing console
        clearOutput()
    }
    const ping = (data: Command) => {
        const args = data.arguments || []
        const opts = data.options || []
        let timeout = 1000
        let count = 4
        let target = ''
        let size = 32
        let ttl = 64

        const targetArg = args.find(arg => arg.name === 'target_name')
        target = targetArg!.value
        const option_count = opts.find(opt => opt.option === '-n')
        if (option_count) { // If option_count is defined, then we know that the count argument is also defined
            const countArg = option_count.arguments!.find(arg => arg.name === 'count')
            count = parseInt(countArg!.value)
        }
        const option_timeout = opts.find(opt => opt.option === '-w')
        if (option_timeout) { // If option_count is defined, then we know that the count argument is also defined
            const timeoutArg = option_timeout.arguments!.find(arg => arg.name === 'timeout')
            timeout = parseInt(timeoutArg!.value)
        }
        const option_size = opts.find(opt => opt.option === '-l')
        if (option_size) { // If option_count is defined, then we know that the count argument is also defined
            const sizeArg = option_size.arguments!.find(arg => arg.name === 'size')
            size = parseInt(sizeArg!.value)
        }
        const option_ttl = opts.find(opt => opt.option === '-i')
        if (option_ttl) { // If option_count is defined, then we know that the count argument is also defined
            const ttlArg = option_ttl.arguments!.find(arg => arg.name === 'TTL')
            ttl = parseInt(ttlArg!.value)
        }

        updateOutput(`\nPinging ${target} with ${size} bytes of data:`)
        hideInputArea()

        let sent = 0
        let received = 0
        let lost = 0
        let pingTime: number[] = []
        const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
        const pingLoop = async () => {
            for (let i = 0; i < count; i++) {
                sent++
                try {
                    const start = Date.now()
                    const result = await actualPing(target, timeout)
                    const elapsed = Date.now() - start
                    updateOutput(`Reply from ${target}: bytes=${size} time=${result} TTL=${Math.floor(Math.random() * (ttl + 1))}`)
                    hideInputArea()
                    pingTime.push(result)
                    received++
                    const delayTime = Math.max(timeout - elapsed, 0)
                    if (i < count - 1) { // Don't delay after the last ping
                        await delay(delayTime)
                    }
                } catch (error: any) {
                    console.warn(`Ping failed: ${error.message}`)
                    lost++
                    updateOutput(`Ping to ${target} failed: bytes=${size} TTL=${Math.floor(Math.random() * (ttl + 1))}`)
                    hideInputArea()
                }
            }
        };

        const pingAndPrintStats = async () => {
            await pingLoop()
            let pingStats = `\nPing statistics for ${target}:\n`
            pingStats    += `\t\tPackets: Sent = ${sent}, Received = ${received}, Lost = ${lost} (${Math.floor(lost / sent * 100)}% loss),\n`
            pingStats    += `Approximate round trip times in milli-seconds:\n`
            pingStats    += `\t\tMinimum = ${Math.min(...pingTime)}ms, Maximum = ${Math.max(...pingTime)}ms, Average = ${Math.floor(pingTime.reduce((a, b) => a + b, 0) / pingTime.length)}ms\n`
            updateOutput(pingStats)
            updateOutput('\n')
        }

        pingAndPrintStats()
    }
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

        // else if event.key === 'ArrowUp' or 'ArrowDown' then handle command history
        else if (event.key === 'ArrowUp') {
            event.preventDefault()
            if (historyIndex > 0) {
                const prevCommand = commandHistory[historyIndex - 1]
                setCommand(prevCommand.command)
                setHistoryIndex(historyIndex - 1)
            }
            // If we are at the first command and the command is not empty, set the command to an empty string
            else if (historyIndex === 0 && command !== '') {
                setHistoryIndex(0)
                setCommand('')
            }
            // If we are at the first command and the command is empty, go to the last command
            else if (historyIndex === 0 && command === '') {
                const lastCommand = commandHistory[commandHistory.length - 1]
                setCommand(lastCommand.command)
                setHistoryIndex(commandHistory.length - 1)
            }
        }
        else if (event.key === 'ArrowDown') {
            event.preventDefault()
            if (historyIndex < commandHistory.length - 1) {
                const nextCommand = commandHistory[historyIndex + 1]
                setCommand(nextCommand.command)
                setHistoryIndex(historyIndex + 1)
            }
            else if (historyIndex === commandHistory.length - 1) {
                setCommand('')
                setHistoryIndex(commandHistory.length)
            }
            // If the current command is empty and there are commands in the history, set the command to the first command in the history
            else if (command === '' && commandHistory.length > 0) {
                setCommand(commandHistory[0].command)
                setHistoryIndex(0)
            }

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

    return <Window ref={windowRef}
        width={550} height={300} fullscreen={isTouch()}
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