'use client'

import { useEffect, useState, useRef, MutableRefObject } from 'react'

import Image from 'next/image'
import styles_win98 from './styles-win98.module.css'
import styles_winxp from './styles-winxp.module.css'

import Taskbar from './Taskbar'
import DesktopIcon from './DesktopIcon'
import computerExplorer from '@/assets/images/icons/computer_explorer.png'
import msieIcon from '@/assets/images/icons/msie.png'
import welcomeIcon from '@/assets/images/icons/welcome_icon.png'
import aboutMeIcon from '@/assets/images/icons/aboutme_icon.png'
import contactIcon from '@/assets/images/icons/contact_icon.png'
import userCardIcon from '@/assets/images/icons/user_card.png'
import cmdIcon from '@/assets/images/icons/console_prompt-0.png'
import _notepad from '@/assets/images/Windows98/notepad.png'
import _warning from '@/assets/images/Windows98/warning.png'

// import Window from './Window'
import WelcomeWindow from './Windows/Welcome'
import AboutMeWindow from './Windows/AboutMe'
import ContactWindow from './Windows/Contact'
import ErrorWindow from './Windows/Popup'
import CommandPrompt from './Windows/CommandPrompt'
import Notepad from './Windows/Notepad'
import Popup, {usePopupRef} from './Windows/Popup'

import { isElementInClass, findParentWithClass } from '@/lib/util_DOM'

import { useSettingsStore } from '@/stores/SettingsStore'
import { isTouch } from '@/lib/utils'

const PCSim = () => {
    const { windows, openWindow, showWindow, removeClass, setWindowsContainer, setStyles, styles } = useSettingsStore()
    const initialMount = useRef<Boolean>(true)
    const windowsContainer = useRef<HTMLDivElement | null>(null)

    const [isHighlighting, setIsHighlighting] = useState(false)
    const [highlightBox, setHighlightBox] = useState({ startX: 0, startY: 0, width: 0, height: 0 })
    const [highlightBoxRendered, setHighlightBoxRendered] = useState({ startX: 0, startY: 0, width: 0, height: 0 })



    useEffect(() => {
        if (initialMount.current) {
            // TODO: save windowStore variables in localstorage and get it next time we render initially
            setStyles(styles_win98)
        }

        if (initialMount.current) {
            // openWindow(<Notepad />)
            // openWindow(<CommandPrompt />)
            openWindow(<WelcomeWindow />)
            // openWindow(<AboutMeWindow />)
            // openWindow(<ContactWindow />)
            // openWindow(<ErrorWindow text='This is an error message. Wubba lubba dub dub!' />)
        }
        if (initialMount.current) {
            initialMount.current = false
        }
        return () => {
        }
    }, [])

    useEffect(() => {
        if (windowsContainer.current) {
            setWindowsContainer(windowsContainer as MutableRefObject<HTMLDivElement>)
        }
    }, [windowsContainer, setWindowsContainer])



    // parse highlight box coordinates (handle negatives)
    useEffect(() => {
        let highlightBoxCopy = JSON.parse(JSON.stringify(highlightBox))
        if (highlightBox.width < 0) {
            highlightBoxCopy.width = Math.abs(highlightBoxCopy.width)
            highlightBoxCopy.startX = highlightBoxCopy.startX - Math.abs(highlightBoxCopy.width)
        }
        if (highlightBox.height < 0) {
            highlightBoxCopy.height = Math.abs(highlightBoxCopy.height)
            highlightBoxCopy.startY = highlightBoxCopy.startY - Math.abs(highlightBoxCopy.height)
        }

        setHighlightBoxRendered(highlightBoxCopy)
    }, [highlightBox])


    const onClickDesktopIcon = (event: React.MouseEvent<HTMLDivElement>) => {
        const target: HTMLElement = event.target as HTMLElement
    }

    // TODO: Move this logic to Window Component
    const handleActiveWindowsOnClick = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        if (!isElementInClass(target, [styles.window, styles.active])) {
            // If click is not in the bottomBar -> remove active class from all windows
            if (!isElementInClass(target, styles.windowBtn)) {
                windows.forEach((window: HTMLDivElement) => {
                    removeClass(window.getAttribute('data-title') as string, styles.active)
                })

                // if click is inside a window, add active to that one
                if (isElementInClass(target, styles.window)) {
                    const clickedWindow: Element = findParentWithClass(target, styles.window) as Element
                    showWindow(clickedWindow.getAttribute('data-title') as string)
                }
            }
        }
    }
    const handleSelectedIconsOnClick = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        const isCtrlKeyHeld = event.ctrlKey || event.metaKey || false
        if ((event.type === 'mousedown' || event.type === 'touchstart') &&
            !target.classList.contains(styles.desktopIcon) &&
            !isCtrlKeyHeld) {

            const selectedIcons = document.querySelectorAll(`.${styles.desktopIcon}.${styles.selected}`)
            selectedIcons.forEach((icon: Element) => {
                icon.classList.remove(styles.selected)
            })
        }
    }
    const handleSelectedIconsWhileHighlighting = () => {
        const desktopIcons = document.querySelectorAll(`.${styles.desktopIcon}`)

        const highlightBoxRect = {
            left: highlightBoxRendered.startX,
            top: highlightBoxRendered.startY,
            right: highlightBoxRendered.startX + highlightBoxRendered.width,
            bottom: highlightBoxRendered.startY + highlightBoxRendered.height,
        }

        desktopIcons.forEach((desktopIcon: Element) => {
            const iconRect = desktopIcon.getBoundingClientRect()

            // Check if the icon's rectangle overlaps with the highlight box
            const overlaps = !(
                highlightBoxRect.right < iconRect.left ||
                highlightBoxRect.left > iconRect.right ||
                highlightBoxRect.bottom < iconRect.top ||
                highlightBoxRect.top > iconRect.bottom
            )

            if (overlaps) {
                if (!desktopIcon.classList.contains(styles.selected)) {
                    desktopIcon.classList.add(styles.selected)
                }
            }
            else {
                if (desktopIcon.classList.contains(styles.selected)) {
                    desktopIcon.classList.remove(styles.selected)
                }
            }
        })
    }

    const handleHighlight = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        if (target.classList.contains(styles.main)) {
            setIsHighlighting(true)
            let offsetX: number, offsetY: number;

            if ('offsetX' in event.nativeEvent) {
                offsetX = event.nativeEvent.offsetX;
                offsetY = event.nativeEvent.offsetY;
            } else {
                const rect = target.getBoundingClientRect();
                offsetX = event.nativeEvent.touches[0].clientX - rect.left;
                offsetY = event.nativeEvent.touches[0].clientY - rect.top;
            }

            setHighlightBox({
                startX: offsetX,
                startY: offsetY,
                width: 0,
                height: 0,
            })
        }
    }
    const highlight = (event: MouseEvent | TouchEvent) => {
        handleSelectedIconsWhileHighlighting()
        let clientX: number, clientY: number;

        if ('clientX' in event) {
            clientX = event.clientX;
            clientY = event.clientY;
        } else {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }

        setHighlightBox((prevBox) => ({
            ...prevBox,
            width: clientX - prevBox.startX,
            height: clientY - prevBox.startY,
        }))
    }

    const inputStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target
        if (target instanceof HTMLElement) {
            if ('button' in event && event.button !== 0) {
                return;
            }
            handleActiveWindowsOnClick(event)
            handleSelectedIconsOnClick(event)
            handleHighlight(event)
        }
    }
    const inputEnd = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target
        if (target instanceof HTMLElement) {
            if ('button' in event && event.button !== 0) {
                return;
            }
            handleSelectedIconsOnClick(event)
        }

        if (isHighlighting) {
            handleSelectedIconsWhileHighlighting()

            setIsHighlighting(false)
            let clientX: number, clientY: number;

            if ('clientX' in event) {
                clientX = event.clientX;
                clientY = event.clientY;
            } else {
                clientX = event.changedTouches[0].clientX;
                clientY = event.changedTouches[0].clientY;
            }

            setHighlightBox({
                startX: clientX,
                startY: clientY,
                width: 0,
                height: 0,
            })
        }
    }
    const inputMove = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (isHighlighting) {
            const nativeEvent = event.nativeEvent as MouseEvent | TouchEvent
            highlight(nativeEvent)
        }
    }

    const mainMouseEvents = isTouch() ? {} : {
        onMouseDown: inputStart,
        onMouseUp: inputEnd,
        onMouseMove: inputMove
    }
    const mainTouchEvents = !isTouch() ? {} : {
        onTouchStart: inputStart,
        onTouchEnd: inputEnd,
        onTouchMove: inputMove
    }

    return <>
        <div className={styles.main || styles_win98.main} {...mainMouseEvents} {...mainTouchEvents}>
            <DesktopIcon left='0px' top='0px' id='Computer'
                text='Computer' icon={computerExplorer} />

            <DesktopIcon left='0px' top='100px' id='CommandPrompt'
                text='Command Prompt' icon={cmdIcon} />

            <DesktopIcon left='0px' top='200px' id='MicrosoftIE'
                text='Microsoft IE' icon={msieIcon} />

            <DesktopIcon left='0px' top='300px' id='Notepad'
                text='Notepad' icon={_notepad} />

            <DesktopIcon left='100px' top='0px' id='Welcome'
                text='Welcome' icon={welcomeIcon} />

            <DesktopIcon left='100px' top='100px' id='AboutMe'
                text='About Me' icon={userCardIcon} />

            <DesktopIcon left='200px' top='0px' id='Contact'
                text='Contact' icon={contactIcon} />



            <div ref={windowsContainer}>
                {/* <WelcomeWindow /> */}
            </div>

            <Taskbar />

            {isHighlighting && (
                <div
                    className={styles.highlightBox || styles_win98.highlightBox}
                    style={{
                        left: `${highlightBoxRendered.startX}px`,
                        top: `${highlightBoxRendered.startY}px`,
                        width: `${highlightBoxRendered.width}px`,
                        height: `${highlightBoxRendered.height}px`,
                    }}
                />
            )}

        </div>
    </>
}

export default PCSim