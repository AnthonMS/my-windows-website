import React, { useRef, useState, useEffect } from 'react'
import Image, { StaticImageData } from 'next/image'
import { StaticImport } from 'next/dist/shared/lib/get-img-props'

import { isElementInClass, findParentWithClass, getClientCoordinates } from '@/lib/util_DOM'

import Button from '../UI/Button'

import Toolbar from './Toolbar'

import { useSettingsStore } from '@/stores/SettingsStore'
import { isTouch } from '@/lib/utils'

export interface WindowProps {
    children?: React.ReactNode
    width?: number
    height?: number
    left?: number
    top?: number
    title: string
    icon?: string | StaticImport
    onActive?: Function
    fullscreen?: Boolean

    hideBtn?: Boolean
    maximizeBtn?: Boolean
    helpBtn?: Boolean
    closeBtn?: Boolean
}

const Window = React.forwardRef((props: WindowProps, ref: React.ForwardedRef<unknown>) => {
    const { children, width, height, left, top, title, icon, onActive, fullscreen } = props
    let { hideBtn, maximizeBtn, helpBtn, closeBtn } = props
    if (hideBtn === null || hideBtn === undefined) { hideBtn = true }
    if (maximizeBtn === null || maximizeBtn === undefined) { maximizeBtn = true }
    if (helpBtn === null || helpBtn === undefined) { helpBtn = false }
    if (closeBtn === null || closeBtn === undefined) { closeBtn = true }
    const { windows, openWindow, closeWindow, hideWindow, updateWindowStyle, removeClass, styles } = useSettingsStore()
    const initialMount = useRef<Boolean>(true)
    const thisWindow = useRef<HTMLDivElement | null>(null)
    // const [toolbar, setToolbar] = useState<React.ReactElement | null>(null)
    // const [otherChildren, setOtherChildren] = useState<React.ReactElement[]>([])
    let toolbarElement: React.ReactElement | null = null
    let otherChildren: React.ReactElement[] = []

    const [isHeaderHeld, setIsHeaderHeld] = useState(false)
    const [isResizeHeld, setIsResizeHeld] = useState(false)
    const [resizeX, setResizeX] = useState<number>(0) // 0: false, -1: true inverse, 1: true
    const [resizeY, setResizeY] = useState<number>(0) // 0: false, -1: true inverse, 1: true
    const [prevMousePosition, setPrevMousePosition] = useState<{ x: number; y: number } | null>(null)

    const [isFullscreen, setIsFullscreen] = useState(fullscreen || false)
    const [thisTitle, setThisTitle] = useState<string>(generateTitle(title))
    function generateTitle(baseTitle: string): string {
        if (!windows.some(win => win.getAttribute('data-title') === baseTitle)) {
            return baseTitle
        }

        let counter = 1
        let newTitle = `${baseTitle} ${counter}`
        while (windows.some(win => win.getAttribute('data-title') === newTitle)) {
            counter++
            newTitle = `${baseTitle} ${counter}`
        }
        return newTitle
    }

    React.Children.forEach(children, child => {
        if (React.isValidElement(child)) {
            if (child.type === Toolbar) {
                toolbarElement = child
            } else {
                otherChildren.push(child)
            }
        }
    })


    React.useImperativeHandle(ref, () => ({
        close: () => {
            closeThis()
        },
        // expose more functions or values here if needed
    }))

    const closeThis = () => {
        if (thisWindow.current) {
            closeWindow(thisWindow.current!.getAttribute('data-title') as string)
        }
    }
    const hideThis = () => {
        if (thisWindow.current) {
            hideWindow(thisWindow.current!.getAttribute('data-title') as string)
        }
    }

    useEffect(() => {
        if (thisWindow.current) {
            if (initialMount.current) {
                initialMount.current = false

                if (isFullscreen) {
                    goFullscreen()
                }
                else {
                    positionMiddle()
                }

                // Here we should remove hidden class
                removeClass(thisTitle, styles.hidden)

                if (onActive) {
                    onActive()
                }
            }
        }
    }, [thisWindow])


    useEffect(() => { // Move Listeners
        if (isHeaderHeld) {
            if (!isTouch()) {
                window.addEventListener("mousemove", move)
            }
            else {
                window.addEventListener("touchmove", move)
            }
        }
        else {
            window.removeEventListener('mousemove', move)
            window.removeEventListener('touchmove', move)
        }
        return () => {
            window.removeEventListener('mousemove', move)
            window.removeEventListener('touchmove', move)
        }
    }, [thisWindow, isHeaderHeld, prevMousePosition])

    useEffect(() => { // Resize Listeners
        if (isResizeHeld) {
            if (!isTouch()) {
                window.addEventListener("mousemove", resize)
            }
            else {
                window.addEventListener("touchmove", resize)
            }
        }
        else {
            window.removeEventListener('mousemove', resize)
            window.removeEventListener('touchmove', resize)
        }
        return () => {
            window.removeEventListener('mousemove', resize)
            window.removeEventListener('touchmove', resize)
        }
    }, [thisWindow, isResizeHeld, prevMousePosition])




    const goFullscreen = () => {
        if (thisWindow.current) {
            setIsFullscreen(true)
            const computedStyles = getComputedStyle(thisWindow.current)
            const currentWidth = parseInt(computedStyles.width, 10) || 0 // Default to 0
            const currentHeight = parseInt(computedStyles.height, 10) || 0 // Default to 0
            const currentLeft = parseInt(computedStyles.left, 10) || 0 // Default to 0 if left is not set
            const currentTop = parseInt(computedStyles.top, 10) || 0 // Default to 0 if top is not set
            // Save these values in windows data attributes
            thisWindow.current.setAttribute('data-width', currentWidth.toString())
            thisWindow.current.setAttribute('data-height', currentHeight.toString())
            thisWindow.current.setAttribute('data-left', currentLeft.toString())
            thisWindow.current.setAttribute('data-top', currentTop.toString())

            const screenWidth = window.innerWidth
            const screenHeight = window.innerHeight - 30
            const screenMiddleHor = (screenWidth - currentWidth) / 2
            const screenMiddleVer = ((screenHeight - currentHeight) / 2)

            updateWindowStyle(thisTitle, {
                left: `0px`,
                top: `0px`,
                width: `${screenWidth}px`,
                height: `${screenHeight}px`
            })
        }
    }
    const goWindowMode = () => {
        if (thisWindow.current) {
            setIsFullscreen(false)
            const oldWidth = thisWindow.current.getAttribute('data-width')
            const oldHeight = thisWindow.current.getAttribute('data-height')
            const oldLeft = thisWindow.current.getAttribute('data-left')
            const oldTop = thisWindow.current.getAttribute('data-top')


            updateWindowStyle(thisTitle, {
                left: `${oldLeft}px`,
                top: `${oldTop}px`,
                width: `${oldWidth}px`,
                height: `${oldHeight}px`
            })
        }
    }
    const positionMiddle = () => {
        // Position at given coords or default to middle:
        const styleObject: { left?: string, top?: string, width?: string, height?: string } = {}
        if (width !== undefined) {
            styleObject.width = `${width}px`
        }
        if (height !== undefined) {
            styleObject.height = `${height}px`
        }
        if (left !== undefined) {
            styleObject.left = `${left}px`
        }
        if (top !== undefined) {
            styleObject.top = `${top}px`
        }

        const screenWidth = window.innerWidth
        const screenHeight = window.innerHeight - 30

        const computedStyles = getComputedStyle(thisWindow.current!)
        const widthString: string = styleObject.width ?? computedStyles.width ?? '0' // Default to 0
        const heightString: string = styleObject.height ?? computedStyles.height ?? '0' // Default to 0
        const currentWidth: number = parseInt(widthString.match(/\d+/)?.[0] ?? '0', 10)
        const currentHeight: number = parseInt(heightString.match(/\d+/)?.[0] ?? '0', 10);

        const screenMiddleHor = (screenWidth - currentWidth) / 2
        const screenMiddleVer = (screenHeight - currentHeight) / 2

        if (styleObject.left === undefined) {
            styleObject.left = `${screenMiddleHor}px`
        }
        if (styleObject.top === undefined) {
            styleObject.top = `${screenMiddleVer}px`
        }

        updateWindowStyle(thisTitle, styleObject)
    }

    const move = (event: MouseEvent | TouchEvent) => {
        if ('button' in event && event.button !== 0) { return }
        if (!isHeaderHeld) { return }

        if (isFullscreen) {
            // setIsFullscreen(false)
            goWindowMode()
        }

        const { clientX, clientY } = getClientCoordinates(event)

        if (prevMousePosition && thisWindow.current !== null) {
            const deltaX = clientX - prevMousePosition.x
            const deltaY = clientY - prevMousePosition.y

            const computedStyles = getComputedStyle(thisWindow.current)
            const currentLeft = parseInt(computedStyles.left, 10) || 0 // Default to 0 if left is not set
            const currentTop = parseInt(computedStyles.top, 10) || 0 // Default to 0 if top is not set
            const newLeft = currentLeft + deltaX
            const newTop = currentTop + deltaY
            updateWindowStyle(thisTitle, {
                left: `${newLeft}px`,
                top: `${newTop}px`,
            })
        }

        setPrevMousePosition({ x: clientX, y: clientY })
    }

    // TODO: Add Minimum height and width constraints
    const resize = (event: MouseEvent | TouchEvent) => {
        if ('button' in event && event.button !== 0) { return }
        if (!isResizeHeld) { return }

        if (isFullscreen) {
            setIsFullscreen(false)
        }

        const { clientX, clientY } = getClientCoordinates(event)

        if (prevMousePosition && thisWindow.current !== null) {
            const deltaX = clientX - prevMousePosition.x
            const deltaY = clientY - prevMousePosition.y

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

            updateWindowStyle(thisTitle, {
                left: `${newLeft}px`,
                top: `${newTop}px`,
                width: `${newWidth}px`,
                height: `${newHeight}px`
            })

        }

        setPrevMousePosition({ x: clientX, y: clientY })
    }

    const inputStartHeader = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }
        const target = event.target as HTMLElement
        if (target.classList.contains(styles.button)) { return }
        setIsHeaderHeld(true)
        if ('button' in event) {
            document.addEventListener("mouseup", inputEndHeader, { once: true })
        } else {
            document.addEventListener("touchend", inputEndHeader, { once: true })
        }
    }

    const inputEndHeader = () => {
        setIsHeaderHeld(false)
        setPrevMousePosition(null)
    }

    const inputStartResize = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return }
        setIsResizeHeld(true)

        if ('button' in event) {
            document.addEventListener("mouseup", inputEndResize, { once: true })
        } else {
            document.addEventListener("touchend", inputEndResize, { once: true })
        }

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
    const inputEndResize = () => {
        setIsResizeHeld(false)
        setPrevMousePosition(null)
    }

    const clickBtn = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button !== 0) { return }

        if (event.currentTarget.classList.contains(styles.max)) {
            goFullscreen()
        }
        else if (event.currentTarget.classList.contains(styles.min)) {
            goWindowMode()
        }
        else if (event.currentTarget.classList.contains(styles.hide)) {
            // setIsHidden(true)
            hideThis()
        }
        else if (event.currentTarget.classList.contains(styles.close)) {
            closeThis()
        }
        else if (event.currentTarget.classList.contains(styles.help)) {
            console.log('help?')
            // goFullscreen()
        }
    }

    const onEventWindow = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (onActive) {
            onActive(event)
        }
    }

    const windowMouseEvents = !isTouch() ? {
        onMouseDown: onEventWindow,
        onMouseUp: onEventWindow
    } : {}
    const windowTouchEvents = isTouch() ? {
        onTouchStart: onEventWindow,
        onTouchEnd: onEventWindow
    } : {}
    const headerMouseEvents = !isTouch() ? {
        onMouseDown: inputStartHeader
    } : {}
    const headerTouchEvents = isTouch() ? {
        onTouchStart: inputStartHeader
    } : {}
    const resizeMouseEvents = !isTouch() ? {
        onMouseDown: inputStartResize
    } : {}
    const resizeTouchEvents = isTouch() ? {
        onTouchStart: inputStartResize
    } : {}
    if (!styles.window) return <></>
    return <>
        <div ref={thisWindow} data-title={thisTitle} id={thisTitle} className={`${styles.window} ${styles.hidden}`}
            {...windowMouseEvents} {...windowTouchEvents}>

            <div className={styles.windowHeader} {...headerMouseEvents} {...headerTouchEvents}>
                <div className={styles.windowTitle}>
                    {icon !== null ? <Image className={styles.windowIcon} width={48} height={48} src={icon as string | StaticImport} alt={`icon`} data-icon={true} /> : <></>}
                    <p className={styles.windowTitleText}>{thisTitle}</p>

                </div>
                <div className={styles.windowButtons}>
                    {hideBtn ? <Button className={`${styles.button} ${styles.windowButton} ${styles.hide}`} onClick={clickBtn} /> : ''}
                    {maximizeBtn ? <Button className={`${styles.button} ${styles.windowButton} ${isFullscreen ? styles.min : styles.max}`} onClick={clickBtn} /> : ''}
                    {helpBtn ? <Button className={`${styles.button} ${styles.windowButton} ${styles.help}`} onClick={clickBtn} /> : ''}
                    {closeBtn ? <Button className={`${styles.button} ${styles.windowButton} ${styles.close}`} onClick={clickBtn} /> : ''}
                </div>
            </div>

            { toolbarElement }
            <div className={styles.windowContent}>
                {otherChildren}
            </div>

            <div className={`${styles.dragToResize} ${styles.topRight}`} {...resizeMouseEvents} {...resizeTouchEvents}></div>
            <div className={`${styles.dragToResize} ${styles.topLeft}`} {...resizeMouseEvents} {...resizeTouchEvents}></div>
            <div className={`${styles.dragToResize} ${styles.bottomRight}`} {...resizeMouseEvents} {...resizeTouchEvents}></div>
            <div className={`${styles.dragToResize} ${styles.bottomLeft}`} {...resizeMouseEvents} {...resizeTouchEvents}></div>
            <div className={`${styles.dragToResize} ${styles.top}`} {...resizeMouseEvents} {...resizeTouchEvents}></div>
            <div className={`${styles.dragToResize} ${styles.bottom}`} {...resizeMouseEvents} {...resizeTouchEvents}></div>
            <div className={`${styles.dragToResize} ${styles.left}`} {...resizeMouseEvents} {...resizeTouchEvents}></div>
            <div className={`${styles.dragToResize} ${styles.right}`} {...resizeMouseEvents} {...resizeTouchEvents}></div>
        </div>
    </>

})

Window.displayName = 'Window'
export default Window