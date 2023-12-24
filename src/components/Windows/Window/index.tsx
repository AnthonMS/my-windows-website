import styles from './../styles.module.css'

import React, { useRef, useState, useEffect } from 'react'
import Image, { StaticImageData } from 'next/image'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'

import { isElementInClass, findParentWithClass } from '@/lib/util_DOM'

import Button from '../UI/Button'

export interface WindowProps {
    children?: React.ReactNode
    update?: Boolean
    triggerUpdate?: Function
    width?: number
    height?: number
    left?: number
    top?: number
    title?: string
    icon?: string | StaticImport
    onActive?: Function
}

const Window = React.forwardRef((props: WindowProps, ref) => {
    const { children, update, triggerUpdate, width, height, left, top, title, icon, onActive } = props
    const initialMount = useRef<Boolean>(true)
    const thisWindow = useRef<HTMLDivElement | null>(null)
    const [isHeaderHeld, setIsHeaderHeld] = useState(false)
    const [isResizeHeld, setIsResizeHeld] = useState(false)
    const [resizeX, setResizeX] = useState<number>(0) // 0: false, -1: true inverse, 1: true
    const [resizeY, setResizeY] = useState<number>(0) // 0: false, -1: true inverse, 1: true

    const [prevMousePosition, setPrevMousePosition] = useState<{ x: number; y: number } | null>(null)

    const [isFullscreen, setIsFullscreen] = useState(false)
    const [isHidden, setIsHidden] = useState(false)
    const [thisWidth, setThisWidth] = useState(width || 600)
    const [thisHeight, setThisHeight] = useState(height || 400)
    const [thisLeft, setThisLeft] = useState(left || 200)
    const [thisTop, setThisTop] = useState(top || 200)
    const [thisTitle, setThisTitle] = useState<string>(title || 'Untitled-')
    const [thisIndex, setThisIndex] = useState(10)


    React.useImperativeHandle(ref, () => ({
        closeWindow: () => {
            if (thisWindow.current) {
                const parent = thisWindow.current.parentElement
                if (parent && parent.classList.contains(styles.windowParent)) {
                    parent.remove()
                }
                else {
                    thisWindow.current.remove()
                }
            }
            if (triggerUpdate) triggerUpdate()
        },
        // expose more functions or values here if needed
    }))

    useEffect(() => {
        if (initialMount.current) {
            // console.log('INITIAL MOUNT ', title)
            initialMount.current = false
            // Initial mount, position window in middle of screen
            if (thisWindow.current) {
                if (!isFullscreen) {
                    const screenWidth = window.innerWidth
                    const screenHeight = window.innerHeight - 30
                    const left = (screenWidth - thisWidth) / 2
                    const top = ((screenHeight - thisHeight) / 2)
                    setThisLeft(left)
                    setThisTop(top)
                }
                setIsHidden(false)
                
                
                if (onActive) {
                    onActive()
                }
            }
        }
    }, [])

    useEffect(() => {
        if (thisWindow.current !== null && update !== null) {
        }
    }, [update, thisWindow.current])

    useEffect(() => {
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

    useEffect(() => {
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


    useEffect(() => {
        if (thisWindow.current) {
            if (isFullscreen) {
                // TODO: Fix bug where bottom bar overlays window when we fullscreen. We want to take the bottomBar height into account
                const screenWidth = window.innerWidth
                const screenHeight = window.innerHeight
                thisWindow.current.style.left = `0px`
                thisWindow.current.style.top = `0px`
                thisWindow.current.style.width = `${screenWidth}px`
                thisWindow.current.style.height = `${screenHeight}px`
            }
            else {
                thisWindow.current.style.left = `${thisLeft}px`
                thisWindow.current.style.top = `${thisTop}px`
                thisWindow.current.style.width = `${thisWidth}px`
                thisWindow.current.style.height = `${thisHeight}px`
            }
        }
    }, [isFullscreen])


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
            // thisWindow.current.style.left = `${newLeft}px`
            // thisWindow.current.style.top = `${newTop}px`
        }

        setPrevMousePosition({ x: event.clientX, y: event.clientY })
    }

    // TODO: Add Minimum height and width contraints
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
            // thisWindow.current.style.left = `${newLeft}px`
            // thisWindow.current.style.top = `${newTop}px`

        }

        setPrevMousePosition({ x: event.clientX, y: event.clientY })
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
            setIsHidden(true)
            if (thisWindow.current) {
                thisWindow.current.classList.remove(styles.active)
                thisWindow.current.classList.add(styles.hidden)
            }
            if (triggerUpdate) triggerUpdate()
        }
        else if (event.currentTarget.classList.contains(styles.close)) {
            if (thisWindow.current) {
                // thisWindow.current.remove()
                const parent = thisWindow.current.parentElement
                if (parent && parent.classList.contains(styles.windowParent)) {
                    parent.remove()
                }
                else {
                    thisWindow.current.remove()
                }
            }
            if (triggerUpdate) triggerUpdate()
        }
        else if (event.currentTarget.classList.contains(styles.help)) {
            // if (triggerUpdate)
            //     triggerUpdate()
        }
    }



    const mouseDownHeader = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) { return }
        const target = event.target as HTMLElement
        if (target.classList.contains(styles.button)) { return }
        setIsHeaderHeld(true)
    }
    const mouseUpHeader = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) { return }
        const target = event.target as HTMLElement
        if (target.classList.contains(styles.button)) { return }
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

    const mouseDownWindow = (event: React.MouseEvent<HTMLDivElement>) => {
        if (onActive) {
            onActive(event)
        }
    }


    return <>
        <div ref={thisWindow} data-title={title} id={title} className={`${styles.window} ${isHidden ? styles.hidden : ''}`}
            style={{ width: `${thisWidth}px`, height: `${thisHeight}px`, top: `${thisTop}px`, left: `${thisLeft}px` }}
            onMouseDown={mouseDownWindow}>


            <div className={styles.windowHeader} onMouseDown={mouseDownHeader} onMouseUp={mouseUpHeader}>
                <div className={styles.windowTitle}>
                    {icon !== null ? <Image className={styles.windowIcon} src={icon as StaticImport} alt={`icon`} /> : <></>}
                    <p className={styles.windowTitleText}>{thisTitle}</p>

                </div>
                <div className={styles.windowButtons}>
                    {/* <div className={`${styles.button} ${styles.windowButton} ${styles.hide}`} 
                        onMouseDown={mouseDownBtn} onTouchStart={touchDownBtn} onClick={clickBtn}></div> */}
                    <Button className={`${styles.button} ${styles.windowButton} ${styles.hide}`} onClick={clickBtn} />

                    {/* <div className={`${styles.button} ${styles.windowButton} ${isFullscreen ? styles.min : styles.max}`}
                        onMouseDown={mouseDownBtn} onTouchStart={touchDownBtn} onClick={clickBtn}></div> */}
                    <Button className={`${styles.button} ${styles.windowButton} ${isFullscreen ? styles.min : styles.max}`} onClick={clickBtn} />

                    {/* <div className={`${styles.button} ${styles.windowButton} ${styles.help}`}
                        onMouseDown={mouseDownBtn} onTouchStart={touchDownBtn} onClick={clickBtn}></div> */}
                    <Button className={`${styles.button} ${styles.windowButton} ${styles.help}`} onClick={clickBtn} />

                    {/* <div className={`${styles.button} ${styles.windowButton} ${styles.close}`}
                        onMouseDown={mouseDownBtn} onTouchStart={touchDownBtn} onClick={clickBtn}></div> */}
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

            {
                isHidden || <>
                </>

            }
        </div>
    </>

})

Window.displayName = 'Window'
export default Window