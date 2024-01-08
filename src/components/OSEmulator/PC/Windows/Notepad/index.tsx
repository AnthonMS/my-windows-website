import { useRef, useState } from 'react'

import Window from '@/components/OSEmulator/PC/Window'
import Toolbar from '@/components/OSEmulator/PC/Window/Toolbar'

import _notepad from '@/assets/images/Windows98/notepad.png'

import { useSettingsStore } from '@/stores/SettingsStore'

interface NotepadProps {
    width?: number
    height?: number
}
const Notepad = (props: NotepadProps) => {
    const {  } = props
    let { width, height } = props
    const { styles } = useSettingsStore()
    const windowRef = useRef<{ close?: () => void } | null>(null)
    const [thisTitle, setThisTitle] = useState('Notepad - Untitled')

    if (width === null ||width === undefined) {
        width = Math.min(window.innerWidth - 25, 650)
    }
    if (height === null || height === undefined) {
        height = Math.min(window.innerHeight - 25, 750)
    }

    if (!styles.window) return <></>
    return <Window ref={windowRef} icon={_notepad}
        width={width} height={height}
        title={thisTitle} helpBtn={true} maximizeBtn={false} hideBtn={false}>

        <Toolbar windowTitle={thisTitle}/>
        <div className={styles.notepadContainer}>
            Hello Notepad?
        </div>

    </Window>
}

export default Notepad