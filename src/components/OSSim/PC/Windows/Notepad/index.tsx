import { useRef, useState } from 'react'

import Window from '@/components/OSSim/PC/Window'
import Toolbar, { Item, Menu, MenuItem } from '@/components/OSSim/PC/Window/Toolbar'

import _notepad from '@/assets/images/Windows98/notepad.png'
import _folder from '@/assets/images/Windows98/folder.png'
import _checkmark from '@/assets/images/Windows98/checkmark_small.png'

import { useSettingsStore } from '@/stores/SettingsStore'

interface NotepadProps {
    width?: number
    height?: number
}
const Notepad = (props: NotepadProps) => {
    const { } = props
    let { width, height } = props
    const { styles, openWindow } = useSettingsStore()
    const windowRef = useRef<{ close: () => void, updateTitle: (newTitle: string) => void } | null>(null)
    const textareaRef = useRef<HTMLTextAreaElement | null>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [thisTitle, setThisTitle] = useState('Notepad - Untitled.txt')
    const [textareaSelectedText, setTextareaSelectedText] = useState('')
    const [textareaSelectionStart, setTextareaSelectionStart] = useState<number>(0)
    const [textareaSelectionEnd, setTextareaSelectionEnd] = useState<number>(0)
    const [textareaHistory, setTextareaHistory] = useState<string[]>([''])
    const [textareaHistoryIndex, setTextareaHistoryIndex] = useState(0)
    const [textareaTimeoutId, setTextareaTimeoutId] = useState<NodeJS.Timeout | null>(null)

    const [wrap, setWrap] = useState(false)

    if (width === null || width === undefined) {
        width = Math.min(window.innerWidth - 25, 650)
    }
    if (height === null || height === undefined) {
        height = Math.min(window.innerHeight - 25, 750)
    }
    const updateTextareaHistory = (newValue: string) => {
        setTextareaHistory(prevHistory => [...prevHistory.slice(0, textareaHistoryIndex + 1), newValue])
        setTextareaHistoryIndex(textareaHistoryIndex + 1)
    }

    const handleClose = () => {
        if (!windowRef.current || !windowRef.current.close) { return }
        windowRef.current.close()
    }

    const handleNew = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }

        openWindow(<Notepad />)
    }
    const handleOpen = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }

        fileInputRef.current?.click();
    }
    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (thisTitle !== file.name) {
                setThisTitle(file.name)
                windowRef.current?.updateTitle(file.name)
            }

            const reader = new FileReader();
            reader.onload = function (e) {
                textareaRef.current!.value = e.target?.result as string;
            }
            reader.readAsText(file);
        }
    }
    const handleSave = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { return }
        const text = textareaRef.current.value
        const blob = new Blob([text], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        const link = document.createElement('a')
        link.href = url
        link.download = thisTitle
        link.click()
        URL.revokeObjectURL(url)
        link.remove()
    }
    const handleSaveAs = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { return }
        // const text = textareaRef.current.value
        // const blob = new Blob([text], { type: 'text/plain' })
        // const url = URL.createObjectURL(blob)
        // const link = document.createElement('a')
        // link.href = url
        // link.download = thisTitle
        // link.click()
        // URL.revokeObjectURL(url)
        // link.remove()
    }
    const handlePrint = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { return }

        const text = textareaRef.current.value
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`<html><head><title>${thisTitle}</title></head><body>`)
            printWindow.document.write(`<pre>${text}</pre>`)
            printWindow.document.write('</body></html>')
            printWindow.document.close()
            printWindow.print()
        }
    }
    const handleExit = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }
        if (!windowRef.current || !windowRef.current.close) { return }
        windowRef.current.close()
    }


    const handleUndo = (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }

        if (textareaHistoryIndex > 0) {
            const newHistoryIndex = textareaHistoryIndex - 1
            setTextareaHistoryIndex(newHistoryIndex)
            textareaRef.current!.value = textareaHistory[newHistoryIndex]
        }
    }
    const handleRedo = (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }

        if (textareaHistoryIndex < textareaHistory.length - 1) {
            const newHistoryIndex = textareaHistoryIndex + 1
            setTextareaHistoryIndex(newHistoryIndex)
            textareaRef.current!.value = textareaHistory[newHistoryIndex]
        }
    }
    const handleCut = async (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }

        await navigator.clipboard.writeText(textareaSelectedText || '')

        const textBeforeSelection = textareaRef.current!.value.substring(0, textareaSelectionStart)
        const textAfterSelection = textareaRef.current!.value.substring(textareaSelectionEnd)
        textareaRef.current.value = textBeforeSelection + textAfterSelection
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(textareaSelectionStart, textareaSelectionStart)

        updateTextareaHistory(textareaRef.current!.value)
        setTextareaSelectedText('')
        setTextareaSelectionEnd(textareaSelectionStart)
    }
    const handleCopy = async (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }

        await navigator.clipboard.writeText(textareaSelectedText || '')

        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(textareaSelectionStart, textareaSelectionEnd)
    }
    const handlePaste = async (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }

        // Just focus selected text, security stops us from reading clipboard
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(textareaSelectionStart, textareaSelectionEnd)
    }
    const handleDelete = async (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }


        const textBeforeSelection = textareaRef.current!.value.substring(0, textareaSelectionStart)
        const textAfterSelection = textareaRef.current!.value.substring(textareaSelectionEnd)
        textareaRef.current.value = textBeforeSelection + textAfterSelection
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(textareaSelectionStart, textareaSelectionStart)

        updateTextareaHistory(textareaRef.current!.value)
    }
    const handleSelectAll = async (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }

        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(0, textareaRef.current.value.length)
        setTextareaSelectedText(textareaRef.current.value)
        setTextareaSelectionStart(0)
        setTextareaSelectionEnd(textareaRef.current.value.length)
    }
    const handleTimeDate = async (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }

        const now = new Date()

        const day = now.getDate().toString().padStart(2, '0')
        const month = (now.getMonth() + 1).toString().padStart(2, '0') // Months are 0-based
        const year = now.getFullYear()
        const hour = now.getHours().toString().padStart(2, '0')
        const minute = now.getMinutes().toString().padStart(2, '0')
        const formattedDateTime = `${hour}:${minute} ${day}/${month}/${year}`

        // Insert the formatted date and time at the current caret position
        const textBeforeCaret = textareaRef.current.value.substring(0, textareaSelectionStart)
        const textAfterCaret = textareaRef.current.value.substring(textareaSelectionStart)
        const newValue = textBeforeCaret + formattedDateTime + textAfterCaret
        textareaRef.current.value = newValue;

        // Update the textarea history
        updateTextareaHistory(newValue)

        // Move the caret to the end of the inserted date and time
        const newCaretPosition = textareaSelectionStart + formattedDateTime.length;
        textareaRef.current.focus();
        textareaRef.current.setSelectionRange(newCaretPosition, newCaretPosition);
    }
    const handleWrap = async (event?: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (event && 'button' in event && event.button !== 0) { return }
        if (!textareaRef.current) { console.warn('Textarea ref not found'); return; }

        if (!textareaRef.current.classList.contains(styles.wrap)) {
            textareaRef.current.classList.add(styles.wrap)
            setWrap(true)
        }
        else {
            textareaRef.current.classList.remove(styles.wrap)
            setWrap(false)
        }
    }


    const handleSelectionChange = (event: React.UIEvent<HTMLTextAreaElement>) => {
        const textarea = event.target as HTMLTextAreaElement
        const start = textarea.selectionStart
        const end = textarea.selectionEnd
        if (start !== end) {
            setTextareaSelectedText(textarea.value.slice(start, end))
        }
        else if (textareaSelectedText !== '') {
            setTextareaSelectedText('')
        }

        setTextareaSelectionStart(start)
        setTextareaSelectionEnd(end)
    }
    const handleTextareaChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        const value = event.target.value

        if (textareaTimeoutId !== null) {
            clearTimeout(textareaTimeoutId)
        }

        const newTimeoutId = setTimeout(() => {
            updateTextareaHistory(value);
        }, 400)

        setTextareaTimeoutId(newTimeoutId)
    }
    const handleKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (event.ctrlKey && event.key === 'z') {
            event.preventDefault()
            handleUndo()
        }
        else if (event.ctrlKey && event.key === 'y') {
            event.preventDefault()
            handleRedo()
        }
    }
    if (!styles.window) return <></>
    return <Window ref={windowRef} title={thisTitle} icon={_notepad} width={width} height={height} onClose={handleClose}>

        <Toolbar windowTitle={thisTitle}>
            <Item label="File">
                <Menu>
                    <MenuItem label="New" icon={_folder} hotkey='Ctrl+N' onClick={handleNew} />
                    <MenuItem label="Open..." onClick={handleOpen} />
                    <MenuItem label="Save" hotkey='Ctrl+S' onClick={handleSave} />
                    <MenuItem label="Save As..." hotkey='Ctrl+Shift+S' onClick={handleSaveAs} disabled />
                    <div className={styles.separator} />
                    <MenuItem label="Page Setup..." disabled />
                    <MenuItem label="Print..." hotkey='Ctrl+P' onClick={handlePrint} />
                    <div className={styles.separator} />
                    <MenuItem label="Exit" onClick={handleExit} />
                </Menu>
            </Item>

            <Item label="Edit">
                <Menu>
                    <MenuItem label="Undo" hotkey='Ctrl+Z' onClick={handleUndo} disabled={textareaHistoryIndex === 0} />
                    <MenuItem label="Redo" hotkey='Ctrl+Y' onClick={handleRedo} disabled={textareaHistoryIndex === textareaHistory.length - 1} />
                    <div className={styles.separator} />
                    <MenuItem label="Cut" hotkey='Ctrl+X' onClick={handleCut} disabled={textareaSelectedText === ''} />
                    <MenuItem label="Copy" hotkey='Ctrl+C' onClick={handleCopy} disabled={textareaSelectedText === ''} />
                    <MenuItem label="Paste" hotkey='Ctrl+V' onClick={handlePaste} disabled />
                    <MenuItem label="Delete" hotkey='Del' onClick={handleDelete} disabled={textareaSelectedText === ''} />
                    <div className={styles.separator} />
                    <MenuItem label="Select All" hotkey='Ctrl+A' onClick={handleSelectAll} />
                    <MenuItem label="Time/Date" hotkey='F5' onClick={handleTimeDate} />
                    <div className={styles.separator} />
                    <MenuItem label="Word Wrap" onClick={handleWrap} icon={wrap ? _checkmark : undefined} />
                    <MenuItem label="Set Font..." disabled />
                </Menu>
            </Item>

            <Item label="Search">
                <Menu>
                    <MenuItem label="Find" hotkey='Ctrl+F' disabled />
                    <MenuItem label="Find Next..." hotkey='F3' disabled />
                </Menu>
            </Item>

            <Item label="Help">
                <Menu>
                    <MenuItem label="Help Topics" more disabled>
                        <Menu>
                            <MenuItem label="Help You..." disabled />
                            <MenuItem label="Help Me..." disabled more>
                                <Menu>
                                    <MenuItem label="Help Me Please..." disabled />
                                </Menu>
                            </MenuItem>
                        </Menu>
                    </MenuItem>
                    <div className={styles.separator} />
                    <MenuItem label="About Notepad" disabled />
                </Menu>
            </Item>
        </Toolbar>


        <div className={styles.notepadContainer}>
            <div className={`${styles.textAreaContainer}`}>
                <textarea ref={textareaRef} className={`${styles.textArea}`} onChange={handleTextareaChange} onKeyDown={handleKeyDown} onSelect={handleSelectionChange} />
            </div>
            <input type="file" style={{ display: 'none' }} ref={fileInputRef} onChange={handleFileChange} />
        </div>

    </Window>
}

export default Notepad