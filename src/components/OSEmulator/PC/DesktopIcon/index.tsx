import styles from './../styles.module.css'
import Image, { StaticImageData } from 'next/image'
import dynamic from 'next/dynamic'
import { useState, useEffect, useRef } from 'react'

import { useWindowStore } from '@/stores/windowStore'

// import AboutMeWindow from '@/components/OSEmulator/PC/Windows/AboutMe'
import AboutMeWindow from '../Windows/AboutMe'
import { findParentWithClass } from '@/lib/util_DOM'
import PopupWindow from '../Windows/Popup'

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

    // // --- Selection & Movement handling --- //
    // useEffect(() => {
    //     const handleClick = (event: any) => {
    //         deselect(event)
    //     }
    //     window.addEventListener('mousedown', handleClick)

    //     return () => {
    //         window.removeEventListener('mousedown', handleClick)
    //     }
    // }, [isSelected])


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

    const mouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button === 0) { // left
            const target = event.target as HTMLElement
            const isCtrlKeyHeld = event.ctrlKey || event.metaKey
            setIsMouseDown(true)
            // If ctrl is held down
            //      if desktopIcon has selected class
            //          remove it
            // If ctrl is not held down
            //      remove selected class from all desktopIcons in DOM except the one we are clicking. 
            //          UNLESS WE WANT TO MOVE THEM????????
            // 

            const clickedDesktopIcon: Element = findParentWithClass(target, styles.desktopIcon) as Element
            if (!clickedDesktopIcon.classList.contains(styles.selected)) {
                clickedDesktopIcon.classList.add(styles.selected)
            }

            if (!isCtrlKeyHeld) {
                Array.from(document.querySelectorAll(`.${styles.desktopIcon}.${styles.selected}`))
                    .filter(icon => clickedDesktopIcon && icon.id !== clickedDesktopIcon.id)
                    .forEach(icon => icon.classList.remove(styles.selected))
            }

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

            // Check if ctrl is held, otherwise remove selected from other icons
            moveOtherSelectedIcons(deltaX, deltaY)
        }

        setPrevMousePosition({ x: event.clientX, y: event.clientY })
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

    const click = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button === 0) { // left
            const now: number = Date.now()
            if (lastMouseClick !== null) {
                const diff: number = now - lastMouseClick
                if (diff < 200) {
                    loadWindow()

                    if (primaryAction !== undefined && primaryAction !== null) {
                        // primaryAction(event)
                    }
                }
            }
            setLastMouseClick(now)
        }
    }

    return (
        <div ref={thisIcon} id={id} data-id={id}
            className={`${styles.desktopIcon}`}
            style={{ left: left, top: top }}
            onClick={click} onMouseDown={mouseDown}>

            <div className={styles.imgWrapper}>
                <Image className={styles.desktopIconImage}
                    src={icon} alt={`Icon: ${text}`} />
                <svg>
                    <filter id="blueoverlay" type="matrix" color-interpolation-filters="sRGB">
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