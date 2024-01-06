import { useRef } from 'react'

import Window from '@/components/OSEmulator/PC/Window'

import errorIcon from '@/assets/images/icons/msg_error-0.png'
import successIcon from '@/assets/images/icons/check-0.png'

import Button from '../../UI/Button'

import { useSettingsStore } from '@/stores/SettingsStore'

interface PopupWindowProps {
    title: string
    text: string
    error?: boolean
    width?: number
    height?: number
}
const PopupWindow = (props: PopupWindowProps) => {
    const { title, text, error } = props
    let { width, height } = props
    const { styles } = useSettingsStore()
    if (width === null ||width === undefined) {
        width = Math.min(window.innerWidth - 25, 300)
    }
    if (height === null || height === undefined) {
        height = Math.min(window.innerHeight - 25, 150)
    }
    const windowRef = useRef<{ close?: () => void } | null>(null)

    const click = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (windowRef.current && windowRef.current.close) {
            windowRef.current.close()
        }
    }

    if (!styles.window) return <></>
    return <Window ref={windowRef}
        width={width} height={height}
        title={title} icon={error ? errorIcon : successIcon} helpBtn={true} maximizeBtn={false} hideBtn={false}>

        <div className={styles.popopContainer}>
            <p className={styles.text}>
                { text }
            </p>

            <div className={`${styles.content}`}>
                <div className={styles.buttonContainer}>
                    <Button text='OK' onClick={click}/>
                </div>
            </div>
        </div>

    </Window>
}

export default PopupWindow