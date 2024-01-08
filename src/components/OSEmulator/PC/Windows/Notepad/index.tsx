import { useRef, useState } from 'react'

import Window from '@/components/OSEmulator/PC/Window'
import Toolbar, { Item, Menu, MenuItem } from '@/components/OSEmulator/PC/Window/Toolbar'

import _notepad from '@/assets/images/Windows98/notepad.png'
import _folder from '@/assets/images/Windows98/folder.png'

import { useSettingsStore } from '@/stores/SettingsStore'

interface NotepadProps {
    width?: number
    height?: number
}
const Notepad = (props: NotepadProps) => {
    const { } = props
    let { width, height } = props
    const { styles } = useSettingsStore()
    const windowRef = useRef<{ close?: () => void } | null>(null)
    const [thisTitle, setThisTitle] = useState('Notepad - Untitled')

    if (width === null || width === undefined) {
        width = Math.min(window.innerWidth - 25, 650)
    }
    if (height === null || height === undefined) {
        height = Math.min(window.innerHeight - 25, 750)
    }

    if (!styles.window) return <></>
    return <Window ref={windowRef} icon={_notepad}
        width={width} height={height}
        title={thisTitle} helpBtn={true} maximizeBtn={false} hideBtn={false}>

        <Toolbar windowTitle={thisTitle}>
            <Item label="File">
                <Menu>
                    <MenuItem label="New" icon={_folder}/>
                    <MenuItem label="Open" more>
                        <Menu>
                            <MenuItem label="Open this" disabled />
                            <MenuItem label="Open that" disabled more>
                                <Menu>
                                    <MenuItem label="Open that there" disabled />
                                </Menu>
                            </MenuItem>
                        </Menu>
                    </MenuItem>
                    <MenuItem label="Save"/>
                    <MenuItem label="Save As..."/>
                    <MenuItem label="Page Setup..."/>
                    <MenuItem label="Print..."/>
                    <MenuItem label="Exit"/>
                </Menu>
            </Item>
            
            <Item label="Edit">
                <Menu>
                    <MenuItem label="Edit This"/>
                    <MenuItem label="Edit That"/>
                </Menu>
            </Item>
            
            <Item label="Search">
                <Menu>
                    <MenuItem label="Search This"/>
                    <MenuItem label="Search That"/>
                </Menu>
            </Item>
            
            <Item label="Help">
                <Menu>
                    <MenuItem label="Help You"/>
                    <MenuItem label="Help Me"/>
                </Menu>
            </Item>
        </Toolbar>
        <div className={styles.notepadContainer}>
            Hello Notepad?
        </div>

    </Window>
}

export default Notepad