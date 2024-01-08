import Window from '@/components/OSEmulator/PC/Window'

import cmdIcon from '@/assets/images/icons/console_prompt-0.png'
import { KeyboardEventHandler, useRef, useState, useEffect } from 'react'

import { getNumberOfLinesInTextArea } from '@/lib/util_textarea'
import { isElementInClass } from '@/lib/util_DOM'
import axios from 'axios'

import { isDirectorySyntax, isTouch, isValidIPv4, isValidIPv6, isValidUrl } from '@/lib/utils'

import * as commandsJson from '@/services/cmd/commands.json'
type Commands = Record<string, Command>
const commands: Commands = commandsJson as Commands

import { extractErrors, errorsToOutputString, Command } from '@/services/cmd'
import { Res } from '@/app/api/cmd/route'

import { useSettingsStore } from '@/stores/SettingsStore'

import { pingSimulator } from '@/services/cmd/commands/ping'

interface CommandHistoryItem {
    dir: string
    command: string
}
export interface CommandPromptProps {
}
const CommandPrompt = (props: CommandPromptProps) => {
    const { } = props
    const { styles } = useSettingsStore()
    const inputArea = useRef<HTMLTextAreaElement | null>(null)
    const [inputAreaLines, setInputAreaLines] = useState(1)
    const [commandHistory, setCommandHistory] = useState<CommandHistoryItem[]>([]);
    const [historyIndex, setHistoryIndex] = useState(0)
    const [currentDir, setCurrentDir] = useState<string>('C:\\> ')
    const [command, setCommand] = useState<string>('')
    const [output, setOutput] = useState<string[]>(['Welcome to the Command Prompt Emulator!'])

    const windowRef = useRef<{ close: () => void } | null>(null)

    const updateOutput = (str: string) => {
        setOutput((prev) => [...prev, str])
    }
    const clearOutput = () => {
        setOutput([])
    }
    // TODO: Make command history persistent in local storage. Maybe use a custom store for this?
    const updateCommandHistory = (commandItem: CommandHistoryItem) => {
        setCommandHistory((prevHistory) => {
            setHistoryIndex([...prevHistory, commandItem].length)
            return [...prevHistory, commandItem]
        })
    }

    useEffect(() => {
        scrollToBottom()
    }, [output])

    const execute = async () => {
        const commandItem: CommandHistoryItem = {
            dir: currentDir,
            command: command.trim() // Remove leading and trailing whitespace
        }
        hideInputArea()
        updateCommandHistory(commandItem)
        updateOutput(currentDir + command)
        setCommand('')
        // here we should set the commandHistoryIndex to the last index in commandHistory

        try {
            const res = await axios.post('/api/cmd', commandItem)
            const data: Res = await res.data

            if (data.message === "UNKNOWN_COMMAND") {
                updateOutput(`${data.command}: command not found`)
                showInputArea()
            }
            else if (data.message === "PARSED") {
                const cmdObj: Command = data.command as Command
                const errors = extractErrors(cmdObj)

                const helpOption = cmdObj.options?.find(arg => arg.option === '--help')
                if (errors.length > 0) {
                    const errOutput = errorsToOutputString(data.config!, cmdObj, errors[0])
                    updateOutput(errOutput)
                    showInputArea()
                }
                else if (helpOption) {
                    const helpOutput = errorsToOutputString(data.config!, cmdObj, 'HELP')
                    updateOutput(helpOutput)
                    showInputArea()
                }
                else {
                    const commandFunc = commandFuncs[cmdObj.command] || commandFuncs.defaultCommand
                    commandFunc(cmdObj)
                }
            }
        }
        catch (e) {
            console.error('CATCH ERROR:', e)
        }

    }
    type CommandFuncs = {
        [key: string]: (data: Command) => void
    }
    const commandFuncs: CommandFuncs = {
        cd: (data: Command) => {
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

            showInputArea()
        },
        pwd: (data: Command) => {
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
            showInputArea()
        },
        clear: (data: Command) => {
            // TODO: Handle options and arguments for clearing console
            clearOutput()
            showInputArea()
        },
        ping: (data: Command) => {
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

            if (isValidUrl(target)) {
                updateOutput(`\nPinging ${target} with ${size} bytes of data:`)

                let sent = 0
                let received = 0
                let lost = 0
                let pingTime: number[] = []
                const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))
                const pingLoop = async () => {
                    for (let i = 0; i < count; i++) {
                        sent++
                        const start = Date.now()
                        const result = await pingSimulator(target, timeout)
                        const elapsed = Date.now() - start
                        if (result.status === 'ok') {
                            received++
                            pingTime.push(result.ping)
                            updateOutput(`Reply from ${target}: bytes=${size} time=${result.ping} TTL=${Math.floor(Math.random() * (ttl + 1))}`)
                            // scrollToBottom()
                        }
                        else {
                            lost++
                            updateOutput(`Ping to ${target} failed: bytes=${size} time=${result.ping} TTL=${Math.floor(Math.random() * (ttl + 1))}`)
                            // scrollToBottom()
                        }
                        const delayTime = Math.max(timeout - elapsed, 0)
                        if (i < count - 1) { // Don't delay after the last ping
                            await delay(delayTime)
                        }
                    }
                };

                const pingAndPrintStats = async () => {
                    await pingLoop()
                    let pingStats = `\nPing statistics for ${target}:\n`
                    pingStats += `\t\tPackets: Sent = ${sent}, Received = ${received}, Lost = ${lost} (${Math.floor(lost / sent * 100)}% loss),\n`
                    pingStats += `Approximate round trip times in milli-seconds:\n`
                    pingStats += `\t\tMinimum = ${Math.min(...pingTime)}ms, Maximum = ${Math.max(...pingTime)}ms, Average = ${Math.floor(pingTime.reduce((a, b) => a + b, 0) / pingTime.length)}ms\n`
                    updateOutput(pingStats)
                    updateOutput('\n')
                    showInputArea()
                    // scrollToBottom()

                    // setTimeout(() => {
                    //     console.log('Scroll to bottom after ping')
                    //     scrollToBottom()
                    // }, 1000);
                }

                pingAndPrintStats()
            }
            else {
                updateOutput(`Ping request could not find host ${target}. Please check the name and try again.`)
                updateOutput('\n')
                showInputArea()
            }
        },
        ipconfig: (data: Command) => {
            const getIpAndPrintResult = async () => {
                const ipRes = await fetch('https://api64.ipify.org?format=json')
                const ipData = await ipRes.json()

                let outputStr = `\nIP Configuration\n\n`
                outputStr += `Internet adapter Public:\n\n`
                outputStr += `\tConnection-specific DNS Suffix. . : \n`
                outputStr += `\tIPv6 Address. . . . . . . . . . . : ${isValidIPv6(ipData.ip) ? ipData.ip : ''}\n`
                outputStr += `\tIPv4 Address. . . . . . . . . . . : ${isValidIPv4(ipData.ip) ? ipData.ip : ''}\n`
                outputStr += `\tSubnet Mask . . . . . . . . . . . : 255.255.255.0 (Probably)\n`
                outputStr += `\tDefault Gateway . . . . . . . . . : 192.168.0/1.1 (Probably)\n\n`

                outputStr += `Ethernet adapter Bluetooth Network Connection:\n\n`
                outputStr += `\tMedia State . . . . . . . . . . . : Media disconnected or connected. Who knows? You do.\n`
                outputStr += `\tConnection-specific DNS Suffix  . : \n\n`

                updateOutput(outputStr)
                showInputArea()
            }

            getIpAndPrintResult()
        },
        dir: (data: Command) => {
            // TODO: List random files and directories
            showInputArea()
        },
        exit: (data: Command) => {
            if (windowRef.current !== null) {
                windowRef.current.close()
            }
        },
        defaultCommand: (data: Command) => {
            updateOutput(`${data.command}: command not supported yet. Sorry.`)
            showInputArea()
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
                    if (!isClickInInput && !isClickInOutput && event.type === 'mouseup') {
                        focusInputArea()
                    }
                    // If click is in output check if there is text selected, if not, focus the input
                    if (isClickInOutput && !isTextSelectedInOutput && event.type === 'mouseup') {
                        // Focus the input only if there is no text selected in the output
                        focusInputArea()
                    }
                }
                else { // First mount
                    focusInputArea()
                }
            }
        }, 100)
    }
    const focusInputArea = () => {
        if (inputArea.current) {
            const { value } = inputArea.current
            inputArea.current.setSelectionRange(value.length, value.length)
            inputArea.current.focus()
        }
    }
    const scrollToBottom = () => {
        if (inputArea.current !== null && inputArea.current.parentElement !== null && inputArea.current.parentElement.parentElement !== null) {
            const contentDiv = inputArea.current.parentElement.parentElement
            contentDiv.scrollTop = contentDiv.scrollHeight
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
        focusInputArea()
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

    if (!styles.window) return <></>
    return <Window ref={windowRef}
        width={Math.min(window.innerWidth - 25, 675)} height={Math.min(window.innerHeight - 25, 350)} fullscreen={isTouch()}
        title='Command Prompt' icon={cmdIcon}
        onActive={focusInputOnEvent}>

        <div className={styles.cmdContainer}>
            <div className={`${styles.border} ${styles.content}`}>

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

export default CommandPrompt