import styles from './../../styles.module.css'
import Image from 'next/image'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import React, { forwardRef, useRef, useImperativeHandle  } from 'react'

import windowsLogo from '@/assets/images/windows92-logo.png'

export interface ButtonProps {
    update?: Boolean
    triggerUpdate?: Function
    icon?: string | StaticImport
    text?: string
    onClick: React.MouseEventHandler<HTMLDivElement>
    className?: string
    key?: string
    dataTitle?: string
}

// const Button = (props: ButtonProps) => {
const Button = forwardRef((props: ButtonProps, ref) => {
    const { update, triggerUpdate, onClick, icon, text, className, dataTitle } = props
    const thisButton = useRef<HTMLDivElement | null>(null)
    
    useImperativeHandle(ref, () => ({
        thisButton,
    }))

    const mouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) { return }

        const target = event.currentTarget
        if (!target.classList.contains(styles.selected)) {
            target.classList.add(styles.selected)
        }

        document.addEventListener("mouseup", inputUp, { once: true })
    }
    const touchStart = (event: React.TouchEvent<HTMLDivElement>) => {
        const target = event.currentTarget
        if (!target.classList.contains(styles.selected)) {
            target.classList.add(styles.selected)
        }

        document.addEventListener("touchend", inputUp, { once: true })
    }
    const inputUp = () => {
        if (thisButton.current !== null) {
            if (thisButton.current.classList.contains(styles.selected)) {
                thisButton.current.classList.remove(styles.selected)
            }
        }
    }

    return (
        <div ref={thisButton} 
            className={`${styles.button} ${className ? className : ''}`}
            data-title={dataTitle ? dataTitle : 'empty'}
            onMouseDown={mouseDown} onTouchStart={touchStart} onClick={onClick}>
            <div className={styles.buttonContent}>
                { icon ? <Image className={styles.image} src={icon} alt={`windows-logo`} /> : <></>}
                { text ? <p className={styles.text}>{text}</p> : <></>}
            </div>
        </div>
    )
})

export default Button