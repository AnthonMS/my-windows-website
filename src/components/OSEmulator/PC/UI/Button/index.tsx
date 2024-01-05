import Image from 'next/image'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import React, { forwardRef, useRef, useImperativeHandle  } from 'react'

import { isTouch } from '@/lib/utils'
import { useWindowStore } from '@/stores/windowStore'

export interface ButtonProps {
    icon?: string | StaticImport
    text?: string
    onClick: React.MouseEventHandler<HTMLDivElement>
    className?: string
    key?: string
    dataTitle?: string
}

// const Button = (props: ButtonProps) => {
const Button = forwardRef((props: ButtonProps, ref) => {
    const { onClick, icon, text, className, dataTitle } = props
    const thisButton = useRef<HTMLDivElement | null>(null)
    const { styles } = useWindowStore()
    
    useImperativeHandle(ref, () => ({
        thisButton,
    }))

    const inputStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }
    
        const target = event.currentTarget;
        if (!target.classList.contains(styles.selected)) {
            target.classList.add(styles.selected);
        }
    
        const upEvent = 'changedTouches' in event ? "touchend" : "mouseup";
        document.addEventListener(upEvent, inputUp, { once: true });
    }
    const inputUp = () => {
        if (thisButton.current !== null) {
            if (thisButton.current.classList.contains(styles.selected)) {
                thisButton.current.classList.remove(styles.selected)
            }
        }
    }

    const buttonMouseEvents = !isTouch() ? {
        onMouseDown: inputStart
    } : {}
    const buttonTouchEvents = isTouch() ? {
        onTouchStart: inputStart
    } : {}

    if (!styles.button) return <></>
    return (
        <div ref={thisButton} 
            className={`${styles.button} ${className ? className : ''}`}
            data-title={dataTitle ? dataTitle : 'empty'} onClick={onClick}
            {...buttonMouseEvents} {...buttonTouchEvents} >
            <div className={styles.buttonContent}>
                { icon ? <Image className={styles.image} src={icon} alt={`windows-logo`} /> : <></>}
                { text ? <p className={styles.text}>{text}</p> : <></>}
            </div>
        </div>
    )
})

Button.displayName = 'Button'
export default Button