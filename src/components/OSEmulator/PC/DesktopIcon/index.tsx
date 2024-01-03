import styles from './../styles.module.css'
import Image, { StaticImageData } from 'next/image'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'

import { useWindowStore } from '@/stores/windowStore'

// import AboutMeWindow from '@/components/OSEmulator/PC/Windows/AboutMe'
import AboutMeWindow from '../Windows/AboutMe'
import { findParentWithClass, getClientCoordinates } from '@/lib/util_DOM'
import PopupWindow from '../Windows/Popup'
import { isTouch } from '@/lib/utils'

interface DesktopIconProps {
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
    const { windows, openWindow } = useWindowStore()
    const thisIcon = useRef<HTMLDivElement | null>(null)
    // const [isSelected, setIsSelected] = useState(false)
    const [lastMouseClick, setLastMouseClick] = useState<number | null>(null)

    const [isMouseDown, setIsMouseDown] = useState(false)
    const [prevMousePosition, setPrevMousePosition] = useState<{ x: number; y: number } | null>(null)

    useEffect(() => { // Move Listeners
        if (!isTouch()) {
            if (isMouseDown) {
                window.addEventListener("mousemove", move)
            }
            else {
                window.removeEventListener('mousemove', move)
            }
        }
        else {
            if (isMouseDown) {
                window.addEventListener("touchmove", move)
            }
            else {
                window.removeEventListener('touchmove', move)
            }
        }
        return () => {
            if (!isTouch()) {
                window.removeEventListener('mousemove', move)
            }
            else {
                window.removeEventListener('touchmove', move)
            }
        }
    }, [thisIcon, isMouseDown, prevMousePosition])



    const loadWindow = async () => {
        try {
            const moduleExists = await import(`../Windows/${id}`)
                .then(() => true)
                .catch(() => false)

            if (moduleExists) {
                const WindowComponent = dynamic(() => import(`../Windows/${id}`), {
                    ssr: false,
                })
                const windowEl = <WindowComponent />
                openWindow(windowEl)
            }
            else {
                openWindow(<PopupWindow width={300} height={150} error={true} title='Program not found' text='The requested program could not be found.' />)
            }
        }
        catch (err) {
            openWindow(<PopupWindow error={true} title='Error' text='An error occurred while loading the program.' />)
            console.warn(err)
        }
    }

    const inputStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target
        if (target instanceof HTMLElement) {
            if ('button' in event && event.button !== 0) {
                return;
            }

            const isCtrlKeyHeld = event.ctrlKey || event.metaKey || false
            setIsMouseDown(true)

            const clickedDesktopIcon: Element = findParentWithClass(target, styles.desktopIcon) as Element
            if (!clickedDesktopIcon.classList.contains(styles.selected)) {
                clickedDesktopIcon.classList.add(styles.selected)
            }

            if (!isCtrlKeyHeld) {
                Array.from(document.querySelectorAll(`.${styles.desktopIcon}.${styles.selected}`))
                    .filter(icon => clickedDesktopIcon && icon.id !== clickedDesktopIcon.id)
                    .forEach(icon => icon.classList.remove(styles.selected))
            }

            const { clientX, clientY } = getClientCoordinates(event.nativeEvent)
            setPrevMousePosition({ x: clientX, y: clientY })
            click(event)

            if ('button' in event) {
                document.addEventListener("mouseup", inputEnd, { once: true })
            }
            else {
                document.addEventListener("touchend", inputEnd, { once: true })
            }
        }
    }
    const inputEnd = () => {
        setIsMouseDown(false)
        setPrevMousePosition(null)
    }
    const move = (event: MouseEvent | TouchEvent) => {
        if ('button' in event && event.button !== 0) { return }
        if (!isMouseDown) { return }

        const { clientX, clientY } = getClientCoordinates(event)
        if (prevMousePosition && thisIcon.current !== null) {
            const deltaX = clientX - prevMousePosition.x
            const deltaY = clientY - prevMousePosition.y

            const computedStyles = getComputedStyle(thisIcon.current)
            const currentLeft = parseInt(computedStyles.left, 10) || 0 // Default to 0 if left is not set
            const currentTop = parseInt(computedStyles.top, 10) || 0 // Default to 0 if top is not set
            const newLeft = currentLeft + deltaX
            const newTop = currentTop + deltaY
            thisIcon.current.style.left = `${newLeft}px`
            thisIcon.current.style.top = `${newTop}px`

            moveOtherSelectedIcons(deltaX, deltaY)
        }

        setPrevMousePosition({ x: clientX, y: clientY })
    }

    const moveOtherSelectedIcons = (deltaX: number, deltaY: number) => {
        const selectedIcons = document.querySelectorAll(`.${styles.desktopIcon}.${styles.selected}`)
        selectedIcons.forEach((icon: Element) => {
            if (icon.id !== id) {
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

    const click = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) {
            return;
        }

        const now: number = Date.now()
        if (lastMouseClick !== null) {
            const diff: number = now - lastMouseClick
            if (diff < 200) {
                loadWindow()

                if (primaryAction !== undefined && primaryAction !== null) {
                    primaryAction(event)
                }
            }
        }
        setLastMouseClick(now)
    }

    return (
        <div ref={thisIcon} id={id} data-id={id}
            className={`${styles.desktopIcon}`}
            style={{ left: left, top: top }}
            onMouseDown={!isTouch() ? inputStart : undefined} onTouchStart={isTouch() ? inputStart : undefined}>

            <div className={styles.imgWrapper}>
                <Image className={styles.desktopIconImage}
                    src={icon} alt={`Icon: ${text}`} />
                <svg>
                    <filter id="blueoverlay" type="matrix" colorInterpolationFilters="sRGB">
                        {/* <!-- change last value of first row to r/255 -->
                        <!-- change last value of second row to g/255 -->
                        <!-- change last value of third row to b/255 --> */}
                        <feColorMatrix type="matrix"
                            values="0 0 0.5 0 0
                                    0 0 0.5 0 0
                                    0 0 1 0.75 0
                                    0 0 0 1 0" />
                    </filter>
                </svg>
            </div>

            <p className={styles.desktopIconText}>{text}</p>

        </div>
    )
}

export default DesktopIcon