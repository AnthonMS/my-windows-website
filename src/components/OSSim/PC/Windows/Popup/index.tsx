import { useRef } from 'react'

import Window, { useWindowRef } from '@/components/OSSim/PC/Window'

import _warning from '@/assets/images/Windows98/warning.png'
import _error from '@/assets/images/Windows98/error.png'
import _success from '@/assets/images/Windows98/check.png'

import Button from '../../UI/Button'

import { useSettingsStore } from '@/stores/SettingsStore'
import React from 'react'

interface PopupProps {
    title: string
    error?: boolean
    warning?: boolean
    width?: number
    height?: number
    children?: React.ReactNode
}
const Popup = React.forwardRef<unknown, PopupProps>((props: PopupProps, ref: React.ForwardedRef<unknown>) => {
    const { title, error, warning, children } = props
    let { width, height } = props
    const { styles } = useSettingsStore()
    const icon = error ? _error : warning ? _warning : _success
    if (width === null ||width === undefined) {
        width = Math.min(window.innerWidth - 25, 300)
    }
    if (height === null || height === undefined) {
        height = Math.min(window.innerHeight - 25, 150)
    }
    const windowRef = useWindowRef()

    React.useImperativeHandle(ref, () => ({
        window: windowRef.current
    }))

    const click = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (windowRef.current) {
            windowRef.current.close()
        }
    }

    if (!styles.window) return <></>

    const childrenArray = React.Children.toArray(children);
    // Separate the Button components from the rest of the components
    const buttonChildren = childrenArray.filter(child => React.isValidElement(child) && child.type === Button)
    const otherChildren = childrenArray.filter(child => !buttonChildren.includes(child))

    return <Window ref={windowRef}
        width={width} height={height}
        title={title} icon={icon} helpBtn={true} maximizeBtn={false} hideBtn={false}>

        <div className={styles.popopContainer}>
            <div className={styles.content}>
                { otherChildren }
            </div>

            <div className={`${styles.bottomContainer}`}>
                <div className={styles.buttonContainer}>
                    { buttonChildren ? buttonChildren : <Button text='OK' onClick={click}/> }
                </div>
            </div>
        </div>

    </Window>
})
Popup.displayName = 'Popup'
export function usePopupRef() {
    return useRef<{ 
        window: ReturnType<typeof useWindowRef>['current']
    } | null>(null)
}
export default Popup