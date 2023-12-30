import styles from './../styles.module.css'
import Image, { StaticImageData } from 'next/image'
import { useState, useEffect, useRef } from 'react'

export interface DesktopIconProps {
    id: string
    text: string
    icon: StaticImageData
    primaryAction?: Function
    left: string
    top: string
    // click: React.MouseEventHandler<HTMLDivElement>
}

const DesktopIcon = (props: DesktopIconProps) => {
    const { id, text, icon, primaryAction, left, top } = props
    const thisIcon = useRef<HTMLDivElement | null>(null)
    const [isSelected, setIsSelected] = useState(false)
    const [lastMouseClick, setLastMouseClick] = useState<number | null>(null)

    const [isMouseDown, setIsMouseDown] = useState(false)
    const [prevMousePosition, setPrevMousePosition] = useState<{ x: number; y: number } | null>(null)

    // --- Selection & Movement handling --- //
    useEffect(() => {
        const handleClick = (event: any) => {
            deselect(event)
        }
        window.addEventListener('mousedown', handleClick)

        return () => {
            window.removeEventListener('mousedown', handleClick)
        }
    }, [isSelected])
    

    useEffect(() => { // Move Listeners
        if (isMouseDown) {
            window.addEventListener("mousemove", move)
        }
        else {
            window.removeEventListener('mousemove', move)
        }
        return () => {
            window.removeEventListener('mousemove', move)
        }
    }, [thisIcon, isMouseDown, prevMousePosition])

    const mouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button === 0) { // left
            setIsMouseDown(true)
            select(event)
            document.addEventListener("mouseup", mouseUp, { once: true })
        }
    }
    const mouseUp = () => {
        setIsMouseDown(false)
        setPrevMousePosition(null)
    }
    const move = (event: MouseEvent) => {
        if (event.button !== 0) { return }
        if (!isMouseDown) { return }
        console.log('MOVE?')

        if (prevMousePosition && thisIcon.current !== null) {
            const deltaX = event.clientX - prevMousePosition.x
            const deltaY = event.clientY - prevMousePosition.y

            const computedStyles = getComputedStyle(thisIcon.current)
            const currentLeft = parseInt(computedStyles.left, 10) || 0 // Default to 0 if left is not set
            const currentTop = parseInt(computedStyles.top, 10) || 0 // Default to 0 if top is not set
            const newLeft = currentLeft + deltaX
            const newTop = currentTop + deltaY
            thisIcon.current.style.left = `${newLeft}px`
            thisIcon.current.style.top = `${newTop}px`
            
            moveOtherSelectedIcons(deltaX, deltaY)
            // setThisLeft(newLeft)
            // setThisTop(newTop)
        }

        setPrevMousePosition({ x: event.clientX, y: event.clientY })
    }

    const moveOtherSelectedIcons = (deltaX: number, deltaY: number) => {
        const selectedIcons = document.querySelectorAll(`.${styles.desktopIcon}.${styles.selected}`)
        // console.log('Selected icons:', selectedIcons)
        selectedIcons.forEach((icon: Element) => {
            if (icon.id !== text) {
                const iconElement = icon as HTMLElement

                const iconStyles = getComputedStyle(iconElement)

                const currentLeft = parseInt(iconStyles.left, 10) || 0 // Default to 0 if left is not set
                const currentTop = parseInt(iconStyles.top, 10) || 0 // Default to 0 if top is not set
                const newLeft = currentLeft + deltaX
                const newTop = currentTop + deltaY
                iconElement.style.left = `${newLeft}px`
                iconElement.style.top = `${newTop}px`
            }
        })
    }

    const select = (event: any) => {
        setIsSelected(true)
    }

    // TODO: Move deselect logic to base 
    //          It should not deselect any icons on mouseDown (or mouseUp) if there are multiple selected
    const deselect = (event: any) => {
        let currentElement = event.target
        // console.log('DESELECT???')
        // Check Ctrl (Command on Mac) is held down
        const isCtrlKeyHeld = event.ctrlKey || event.metaKey;

        if (isCtrlKeyHeld) {
            while (currentElement !== null && !currentElement.classList.contains(styles.desktopIcon)) {
                currentElement = currentElement.parentElement
            }
            if (currentElement === null) {
                setIsSelected(false)
            }
        }
        else {
            while (currentElement !== null && currentElement.id !== text) {
                currentElement = currentElement.parentElement
            }
            if (currentElement === null) {
                setIsSelected(false)
                if (thisIcon.current !== null &&
                    thisIcon.current.classList.contains(styles.selected)) {
                    thisIcon.current.classList.remove(styles.selected)
                }
            }
        }

    }
    // --- End --- //


    const click = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button === 0) { // left
            const now: number = Date.now()
            if (lastMouseClick !== null) {
                const diff: number = now - lastMouseClick
                if (diff < 200) {
                    if (primaryAction !== undefined && primaryAction !== null) {
                        primaryAction(event)
                    }
                }
            }
            setLastMouseClick(now)
        }
    }

    return (
        <div ref={thisIcon} id={text} data-id={id}
            className={`${styles.desktopIcon} ${isSelected ? styles.selected : ''}`} 
            style={{ left: left, top: top }}
            onClick={click} onMouseDown={mouseDown}>
            <Image className={styles.desktopIconImage}
                src={icon} alt={`Icon: ${text}`} />
            <p className={styles.desktopIconText}>{text}</p>
        </div>
    )
}

export default DesktopIcon