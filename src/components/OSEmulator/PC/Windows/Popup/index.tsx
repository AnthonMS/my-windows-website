import { useRef } from 'react'

import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

// import Window from '@/components/Windows/Window'
import Window from '@/components/OSEmulator/PC/Window'

import errorIcon from '@/assets/images/icons/msg_error-0.png'
import successIcon from '@/assets/images/icons/check-0.png'

import Button from '../../UI/Button'

// import { useWindowStore } from '@/stores/windowStore'

interface PopupWindowProps {
    title: string
    text: string
    error?: boolean
}
const PopupWindow = (props: PopupWindowProps) => {
    const { title, text, error } = props
    // const { closeWindow } = useWindowStore()
    const windowRef = useRef<{ close?: () => void } | null>(null)

    const click = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (windowRef.current && windowRef.current.close) {
            windowRef.current.close()
        }
    }

    return <Window ref={windowRef}
        width={250} height={150}
        title={title} icon={error ? errorIcon : successIcon}>

        <div className={styles.errorContainer}>
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