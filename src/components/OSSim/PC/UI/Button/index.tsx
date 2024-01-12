import Image from 'next/image'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'
import React, { forwardRef, useRef, useImperativeHandle, MouseEventHandler, TouchEventHandler } from 'react'

import { isTouch } from '@/lib/utils'
import { useSettingsStore } from '@/stores/SettingsStore'

export interface ButtonProps
    extends React.HTMLAttributes<HTMLDivElement> {
    icon?: string | StaticImport
    text?: string
    onClick: React.MouseEventHandler<HTMLDivElement>
    className?: string
    key?: string
    dataTitle?: string
}

const Button = forwardRef<HTMLDivElement, ButtonProps>(
    ({ icon, text, className, dataTitle, ...props }, ref) => {
        const thisButton = useRef<HTMLDivElement | null>(null)
        const { styles } = useSettingsStore()

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
            if (ref) {
                if ((ref as React.RefObject<HTMLDivElement>).current !== null) {
                    if ((ref as React.RefObject<HTMLDivElement>).current!.classList.contains(styles.selected)) {
                        (ref as React.RefObject<HTMLDivElement>).current!.classList.remove(styles.selected)
                    }
                }
            }
            else {
                if (thisButton.current !== null) {
                    if (thisButton.current.classList.contains(styles.selected)) {
                        thisButton.current.classList.remove(styles.selected)
                    }
                }
            }
        }

        const buttonMouseEvents = !isTouch() ? {
            onMouseDown: inputStart
        } : {}
        const buttonTouchEvents = isTouch() ? {
            onTouchStart: inputStart
        } : {}
        const combinedMouseEvents = Object.keys(buttonMouseEvents).reduce((handlers: Record<string, MouseEventHandler>, key) => {
            const existingHandler = props[key as keyof typeof buttonMouseEvents] as MouseEventHandler
            const newHandler = buttonMouseEvents[key as keyof typeof buttonMouseEvents]
            handlers[key] = (e: React.MouseEvent<HTMLDivElement>) => {
                existingHandler && existingHandler(e)
                newHandler && newHandler(e)
            };
            return handlers
        }, {} as Record<string, MouseEventHandler>)

        const combinedTouchEvents = Object.keys(buttonTouchEvents).reduce((handlers: Record<string, TouchEventHandler>, key) => {
            const existingHandler = props[key as keyof typeof buttonTouchEvents] as TouchEventHandler
            const newHandler = buttonTouchEvents[key as keyof typeof buttonTouchEvents]
            handlers[key] = (e: React.TouchEvent<HTMLDivElement>) => {
                existingHandler && existingHandler(e)
                newHandler && newHandler(e)
            }
            return handlers
        }, {} as Record<string, TouchEventHandler>)

        if (!styles.button) return <></>
        return (
            <div ref={ref ? ref : thisButton} {...props}
                className={`${styles.button} ${className ? className : ''}`}
                data-title={dataTitle ? dataTitle : 'empty'}
                {...combinedMouseEvents} {...combinedTouchEvents} >
                <div className={styles.buttonContent}>
                    {icon ? <Image className={styles.image} src={icon} alt={`windows-logo`} /> : <></>}
                    {text ? <p className={styles.text}>{text}</p> : <></>}
                </div>
            </div>
        )
    })

Button.displayName = 'Button'
export default Button