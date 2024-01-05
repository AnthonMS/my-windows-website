import { useRef } from 'react'

import myStyles from './styles.module.css'

// import Window from '@/components/Windows/Window'
import Window from '@/components/OSEmulator/PC/Window'

import errorIcon from '@/assets/images/icons/msg_error-0.png'
import successIcon from '@/assets/images/icons/check-0.png'

import Button from '../../UI/Button'

import { useWindowStore } from '@/stores/windowStore'

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
    const { styles } = useWindowStore()
    if (width === null ||width === undefined) {
        width = Math.min(window.innerWidth - 25, 300)
    }
    if (height === null || height === undefined) {
        height = Math.min(window.innerHeight - 25, 150)
    }
    // const { closeWindow } = useWindowStore()
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

        <div className={myStyles.errorContainer}>
            <p className={myStyles.text}>
                { text }
            </p>

            <div className={`${myStyles.content}`}>
                <div className={myStyles.buttonContainer}>
                    <Button text='OK' onClick={click}/>
                </div>
            </div>
        </div>

    </Window>
}

export default PopupWindow