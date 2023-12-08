import { useRef } from 'react'

import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/Windows/Window'

import errorIcon from '@/assets/images/icons/msg_error-0.png'
import successIcon from '@/assets/images/icons/check-0.png'

import Button from '../../UI/Button'

interface PopupWindowProps {
    update?: Boolean
    triggerUpdate?: Function
    title: string
    text: string
    error?: boolean
}
const PopupWindow = (props: PopupWindowProps) => {
    const { update, triggerUpdate, title, text, error } = props
    const windowRef = useRef<{ closeWindow?: () => void } | null>(null)

    const click = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (windowRef.current && windowRef.current.closeWindow) {
            windowRef.current.closeWindow()
        }
    }

    return <Window ref={windowRef} update={update} triggerUpdate={triggerUpdate}
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