// import styles from './../styles.module.css'

import React, { useRef, useState, useEffect } from 'react'
import Image, { StaticImageData } from 'next/image'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'

import { isElementInClass, findParentWithClass } from '@/lib/util_DOM'

import Button from '../UI/Button'

import { useWindowStore } from '@/stores/windowStore'

export interface WindowProps {
    children?: React.ReactNode
    width?: number
    height?: number
    left?: number
    top?: number
    title?: string
    icon?: string | StaticImport
    onActive?: Function
}

const Window = React.forwardRef((props: WindowProps, ref: React.ForwardedRef<unknown>) => {
    const { children, width, height, left, top, title, icon, onActive } = props
    const { windows, openWindow, closeWindow, hideWindow, updateWindowStyle, styles } = useWindowStore()
    const initialMount = useRef<Boolean>(true)
    const thisWindow = useRef<HTMLDivElement | null>(null)
    const [isHeaderHeld, setIsHeaderHeld] = useState(false)
    const [isResizeHeld, setIsResizeHeld] = useState(false)
    const [resizeX, setResizeX] = useState<number>(0) // 0: false, -1: true inverse, 1: true
    const [resizeY, setResizeY] = useState<number>(0) // 0: false, -1: true inverse, 1: true

    const [prevMousePosition, setPrevMousePosition] = useState<{ x: number; y: number } | null>(null)

    const [isFullscreen, setIsFullscreen] = useState(false)
    const [thisWidth, setThisWidth] = useState(width || 600)
    const [thisHeight, setThisHeight] = useState(height || 400)
    const [thisLeft, setThisLeft] = useState(left || 200)
    const [thisTop, setThisTop] = useState(top || 200)
    const [thisTitle, setThisTitle] = useState<string>(title || 'Untitled-')


    React.useImperativeHandle(ref, () => ({
        close: () => {
            closeThis()
        },
        // expose more functions or values here if needed
    }))

    const closeThis = () =>{
        if (thisWindow.current) {
            closeWindow(thisWindow.current!.getAttribute('data-title') as string)
        }
    }
    const hideThis = () =>{
        if (thisWindow.current) {
            hideWindow(thisWindow.current!.getAttribute('data-title') as string)
        }
    }

    useEffect(() => { // Initial Mount Management
        if (initialMount.current) {
            initialMount.current = false
            // Position window in middle of screen when first launched
            if (thisWindow.current) {
                if (!isFullscreen) {
                    const screenWidth = window.innerWidth
                    const screenHeight = window.innerHeight - 30
                    const left = (screenWidth - thisWidth) / 2
                    const top = ((screenHeight - thisHeight) / 2)
                    setThisLeft(left)
                    setThisTop(top)
                }

                if (onActive) {
                    onActive()
                }
            }
        }
    }, [])

    useEffect(() => { // Fullscreen Management
        if (thisWindow.current) {
            if (isFullscreen) {
                const screenWidth = window.innerWidth
                const screenHeight = window.innerHeight
                updateWindowStyle(thisWindow.current.getAttribute('data-title') as string, {
                    left: `0px`,
                    top: `0px`,
                    width: `${screenWidth}px`,
                    height: `${screenHeight-30}px`
                })
            }
            else {
                updateWindowStyle(thisWindow.current.getAttribute('data-title') as string, {
                    left: `${thisLeft}px`,
                    top: `${thisTop}px`,
                    width: `${thisWidth}px`,
                    height: `${thisHeight}px`
                })
            }
        }
    }, [isFullscreen])
    

    useEffect(() => { // Move Listeners
        if (isHeaderHeld) {
            window.addEventListener("mousemove", move)
        }
        else {
            window.removeEventListener('mousemove', move)
        }
        return () => {
            window.removeEventListener('mousemove', move)
        }
    }, [thisWindow, isHeaderHeld, prevMousePosition])

    useEffect(() => { // Resize Listeners
        if (isResizeHeld) {
            window.addEventListener("mousemove", resize)
        }
        else {
            window.removeEventListener('mousemove', resize)
        }
        return () => {
            window.removeEventListener('mousemove', resize)
        }
    }, [thisWindow, isResizeHeld, prevMousePosition])


    const move = (event: MouseEvent) => {
        if (event.button !== 0) { return }
        if (!isHeaderHeld) { return }

        if (prevMousePosition && thisWindow.current !== null) {
            const deltaX = event.clientX - prevMousePosition.x
            const deltaY = event.clientY - prevMousePosition.y

            const computedStyles = getComputedStyle(thisWindow.current)
            const currentLeft = parseInt(computedStyles.left, 10) || 0 // Default to 0 if left is not set
            const currentTop = parseInt(computedStyles.top, 10) || 0 // Default to 0 if top is not set
            const newLeft = currentLeft + deltaX
            const newTop = currentTop + deltaY

            setThisLeft(newLeft)
            setThisTop(newTop)
        }

        setPrevMousePosition({ x: event.clientX, y: event.clientY })
    }

    // TODO: Add Minimum height and width constraints
    const resize = (event: MouseEvent) => {
        if (event.button !== 0) { return }
        if (!isResizeHeld) { return }

        if (prevMousePosition && thisWindow.current !== null) {
            const deltaX = event.clientX - prevMousePosition.x
            const deltaY = event.clientY - prevMousePosition.y

            const computedStyles = getComputedStyle(thisWindow.current)
            const currentWidth = parseInt(computedStyles.width, 10) || 0 // Default to 0
            const currentHeight = parseInt(computedStyles.height, 10) || 0 // Default to 0

            const currentLeft = parseInt(computedStyles.left, 10) || 0 // Default to 0 if left is not set
            const currentTop = parseInt(computedStyles.top, 10) || 0 // Default to 0 if top is not set

            let newLeft = currentLeft
            let newTop = currentTop
            let newWidth = currentWidth
            let newHeight = currentHeight

            if (resizeX === -1) { // Inverse: Make smaller and move to match cursor
                newWidth = currentWidth - deltaX
                newLeft = currentLeft + deltaX
            }
            else if (resizeX === 1) {
                newWidth = currentWidth + deltaX
            }
            if (resizeY === -1) { // Inverse: Make smaller and move to match cursor
                newHeight = currentHeight - deltaY
                newTop = currentTop + deltaY
            }
            else if (resizeY === 1) {
                newHeight = currentHeight + deltaY
            }
            setThisWidth(newWidth)
            setThisHeight(newHeight)
            setThisLeft(newLeft)
            setThisTop(newTop)

        }

        setPrevMousePosition({ x: event.clientX, y: event.clientY })
    }


    const mouseDownHeader = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) { return }
        const target = event.target as HTMLElement
        if (target.classList.contains(styles.button)) { return }
        setIsHeaderHeld(true)
        document.addEventListener("mouseup", mouseUpHeader, { once: true })
    }
    const mouseUpHeader = () => {
        setIsHeaderHeld(false)
        setPrevMousePosition(null)
    }

    const mouseDownResize = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) { return }
        setIsResizeHeld(true)

        document.addEventListener("mouseup", mouseUpResize, { once: true })

        const target = event.target as HTMLElement

        if (target.classList.contains(styles.bottomRight)) {
            setResizeX(1)
            setResizeY(1)
        }
        else if (target.classList.contains(styles.bottomLeft)) {
            setResizeX(-1)
            setResizeY(1)
        }
        else if (target.classList.contains(styles.topRight)) {
            setResizeX(1)
            setResizeY(-1)
        }
        else if (target.classList.contains(styles.topLeft)) {
            setResizeX(-1)
            setResizeY(-1)
        }
        else if (target.classList.contains(styles.top)) {
            setResizeX(0)
            setResizeY(-1)
        }
        else if (target.classList.contains(styles.bottom)) {
            setResizeX(0)
            setResizeY(1)
        }
        else if (target.classList.contains(styles.left)) {
            setResizeX(-1)
            setResizeY(0)
        }
        else if (target.classList.contains(styles.right)) {
            setResizeX(1)
            setResizeY(0)
        }
    }
    const mouseUpResize = () => {
        setIsResizeHeld(false)
        setPrevMousePosition(null)
    }

    const clickBtn = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) { return }

        if (event.currentTarget.classList.contains(styles.max)) {
            setIsFullscreen(true)
        }
        else if (event.currentTarget.classList.contains(styles.min)) {
            setIsFullscreen(false)
        }
        else if (event.currentTarget.classList.contains(styles.hide)) {
            // setIsHidden(true)
            hideThis()
        }
        else if (event.currentTarget.classList.contains(styles.close)) {
            closeThis()
        }
        else if (event.currentTarget.classList.contains(styles.help)) {
        }
    }

    const mouseDownWindow = (event: React.MouseEvent<HTMLDivElement>) => {
        if (onActive) {
            onActive(event)
        }
    }

    if (!styles.window) return <></>
    return <>
        <div ref={thisWindow} data-title={thisTitle} id={thisTitle} className={`${styles.window}`}
            style={{ width: `${thisWidth}px`, height: `${thisHeight}px`, top: `${thisTop}px`, left: `${thisLeft}px` }}
            onMouseDown={mouseDownWindow}>


            <div className={styles.windowHeader} onMouseDown={mouseDownHeader}>
                <div className={styles.windowTitle}>
                    {icon !== null ? <Image className={styles.windowIcon} width={48} height={48} src={icon as string | StaticImport} alt={`icon`} data-icon={true} /> : <></>}
                    <p className={styles.windowTitleText}>{thisTitle}</p>

                </div>
                <div className={styles.windowButtons}>
                    <Button className={`${styles.button} ${styles.windowButton} ${styles.hide}`} onClick={clickBtn} />
                    <Button className={`${styles.button} ${styles.windowButton} ${isFullscreen ? styles.min : styles.max}`} onClick={clickBtn} />
                    <Button className={`${styles.button} ${styles.windowButton} ${styles.help}`} onClick={clickBtn} />
                    <Button className={`${styles.button} ${styles.windowButton} ${styles.close}`} onClick={clickBtn} />
                </div>
            </div>

            <div className={styles.windowContent}>
                {children}
            </div>

            <div className={`${styles.dragToResize} ${styles.topRight}`} onMouseDown={mouseDownResize}></div>
            <div className={`${styles.dragToResize} ${styles.topLeft}`} onMouseDown={mouseDownResize}></div>
            <div className={`${styles.dragToResize} ${styles.bottomRight}`} onMouseDown={mouseDownResize}></div>
            <div className={`${styles.dragToResize} ${styles.bottomLeft}`} onMouseDown={mouseDownResize}></div>
            <div className={`${styles.dragToResize} ${styles.top}`} onMouseDown={mouseDownResize}></div>
            <div className={`${styles.dragToResize} ${styles.bottom}`} onMouseDown={mouseDownResize}></div>
            <div className={`${styles.dragToResize} ${styles.left}`} onMouseDown={mouseDownResize}></div>
            <div className={`${styles.dragToResize} ${styles.right}`} onMouseDown={mouseDownResize}></div>
        </div>
    </>

})

Window.displayName = 'Window'
export default Window