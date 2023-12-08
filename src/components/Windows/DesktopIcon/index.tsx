import styles from './../styles.module.css'
import Image, { StaticImageData } from 'next/image'
import { useState, useEffect, useRef } from 'react'

export interface DesktopIconProps {
    update?: Boolean
    triggerUpdate?: Function
    id: string
    text: string
    icon: StaticImageData
    primaryAction?: Function
    left: string
    top: string
    // click: React.MouseEventHandler<HTMLDivElement>
}

const DesktopIcon = (props: DesktopIconProps) => {
    const { update, triggerUpdate, id, text, icon, primaryAction, left, top } = props
    const thisIcon = useRef<HTMLDivElement | null>(null)
    const [isSelected, setIsSelected] = useState(false)
    const [lastMouseClick, setLastMouseClick] = useState<number | null>(null)

    const [isMouseDown, setIsMouseDown] = useState(false)
    const [prevMousePosition, setPrevMousePosition] = useState<{ x: number; y: number } | null>(null)

    useEffect(() => {
        if (thisIcon.current !== null && update !== null) {
            setIsSelected(thisIcon.current.classList.contains(styles.selected))
        }
    }, [update])


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

    const mouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button === 0) { // left
            setIsMouseDown(true)
            select(event)
        }
    }
    const mouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button === 0) { // left
            setIsMouseDown(false)
            setPrevMousePosition(null)
        }
    }
    const mouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!isMouseDown) { return }
        if (prevMousePosition) {
            const deltaX = event.clientX - prevMousePosition.x
            const deltaY = event.clientY - prevMousePosition.y
            // Move this Icon
            const newLeft = parseInt(event.currentTarget.style.left, 10) + deltaX;
            const newTop = parseInt(event.currentTarget.style.top, 10) + deltaY;
            event.currentTarget.style.left = `${newLeft}px`
            event.currentTarget.style.top = `${newTop}px`
            // Now move other icons
            moveOtherSelectedIcons(deltaX, deltaY)
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

    const deselect = (event: any) => {
        let currentElement = event.target
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
            onClick={click} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={mouseMove}>
            <Image className={styles.desktopIconImage}
                src={icon} alt={`Icon: ${text}`} />
            <p className={styles.desktopIconText}>{text}</p>
        </div>
    )
}

export default DesktopIcon