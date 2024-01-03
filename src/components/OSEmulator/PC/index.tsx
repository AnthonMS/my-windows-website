'use client'

import { useEffect, useState, useRef, MutableRefObject } from 'react'
import Head from 'next/head'

import styles from './styles.module.css'

import Taskbar from './Taskbar'
import DesktopIcon from './DesktopIcon'
import computerExplorer from '@/assets/images/icons/computer_explorer.png'
import msieIcon from '@/assets/images/icons/msie.png'
import welcomeIcon from '@/assets/images/icons/welcome_icon.png'
import aboutMeIcon from '@/assets/images/icons/aboutme_icon.png'
import contactIcon from '@/assets/images/icons/contact_icon.png'
import userCardIcon from '@/assets/images/icons/user_card.png'
import cmdIcon from '@/assets/images/icons/console_prompt-0.png'

// import Window from './Window'
import WelcomeWindow from './Windows/Welcome'
// import AboutMeWindow from './Windows/AboutMe'
// import ContactWindow from './Windows/Contact'
// import ErrorWindow from './Windows/Popup'
// import CMDWindow from './Windows/CMD'

import { isElementInClass, findParentWithClass } from '@/lib/util_DOM'


import { useWindowStore } from '@/stores/windowStore'

const PCEmulator = () => {
    const { windows, openWindow, removeClass, addClass, setWindowsContainer, setStyles } = useWindowStore()
    const initialMount = useRef<Boolean>(true)
    const windowsContainer = useRef<HTMLDivElement | null>(null)

    const [isHighlighting, setIsHighlighting] = useState(false)
    const [highlightBox, setHighlightBox] = useState({ startX: 0, startY: 0, width: 0, height: 0 })
    const [highlightBoxRendered, setHighlightBoxRendered] = useState({ startX: 0, startY: 0, width: 0, height: 0 })


    useEffect(() => {
        if (initialMount.current) {
            initialMount.current = false
            setStyles(styles)
            // openWindow(<CMDWindow />)
            // openWindow(<WelcomeWindow />)
            // openWindow(<AboutMeWindow />)
            // openWindow(<ContactWindow />)
            // openWindow(<ErrorWindow text='This is an error message. Wubba lubba dub dub!' />)
        }

        return () => {
        }
    }, [])

    useEffect(() => {
        //   console.log('Windows Updated:', windows)
    }, [windows])



    useEffect(() => {
        if (windowsContainer.current) {
            setWindowsContainer(windowsContainer as MutableRefObject<HTMLDivElement>)
        }
    }, [windowsContainer, setWindowsContainer])

    useEffect(() => {
        setStyles(styles)
    }, [styles, setStyles])


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


    const handleActiveWindowsOnClick = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        let clientX, clientY;

        if ('clientX' in event) {
            clientX = event.clientX;
            clientY = event.clientY;
        } else {
            clientX = event.touches[0].clientX;
            clientY = event.touches[0].clientY;
        }

        if (!isElementInClass(target, [styles.window, styles.active])) {
            // If click is not in the bottomBar -> remove active class from all windows
            if (!isElementInClass(target, styles.windowBtn)) {
                windows.forEach((window: HTMLDivElement) => {
                    removeClass(window.getAttribute('data-title') as string, styles.active)
                })

                // if click is inside a window, add active to that one
                if (isElementInClass(target, styles.window)) {
                    const clickedWindow: Element = findParentWithClass(target, styles.window) as Element
                    addClass(clickedWindow.getAttribute('data-title') as string, styles.active)
                }
                else if (target.classList.contains(styles.main)) {
                    setIsHighlighting(true)
                    setHighlightBox({
                        startX: clientX,
                        startY: clientY,
                        width: 0,
                        height: 0,
                    })
                }
            }
        }
    }

    const handleSelectedIconsOnClick = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target as HTMLElement
        const isCtrlKeyHeld = 'ctrlKey' in event && (event.ctrlKey || event.metaKey)
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
                // The desktop icon is within the highlight box
                if (!desktopIcon.classList.contains(styles.selected)) {
                    desktopIcon.classList.add(styles.selected)
                }
            }
        })
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

    const inputMove = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if (isHighlighting) {
            const nativeEvent = event.nativeEvent as MouseEvent | TouchEvent
            highlight(nativeEvent)
        }
    }


    const inputStart = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.target
        if (target instanceof HTMLElement) {
            if ('button' in event && event.button !== 0) {
                return;
            }
            handleActiveWindowsOnClick(event)
            handleSelectedIconsOnClick(event)
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

    const onClickDesktopIcon = (event: React.MouseEvent<HTMLDivElement>) => {
        const target: HTMLElement = event.target as HTMLElement
    }
    return <>
        <Head>
            <title>Your Custom Title</title>
            <meta name="description" content="Your custom description" />
            {/* Add more meta tags as needed */}
        </Head>

        <div className={styles.main}
            onMouseDown={inputStart} onMouseUp={inputEnd} onMouseMove={inputMove}
            onTouchStart={inputStart} onTouchEnd={inputEnd} onTouchMove={inputMove}>
            <DesktopIcon left='0px' top='0px' id='Computer'
                text='Computer Program 123 (Testname)' icon={computerExplorer}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='0px' top='100px' id='CMD'
                text='Command Prompt' icon={cmdIcon}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='0px' top='200px' id='MicrosoftIE'
                text='Microsoft IE' icon={msieIcon}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='100px' top='0px' id='Welcome'
                text='Welcome' icon={welcomeIcon}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='100px' top='100px' id='AboutMe'
                text='About Me' icon={userCardIcon}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='200px' top='0px' id='Contact'
                text='Contact' icon={contactIcon}
                primaryAction={onClickDesktopIcon} />



            <div ref={windowsContainer}>
                {/* <WelcomeWindow /> */}
            </div>

            <Taskbar />

            {isHighlighting && (
                <div
                    className={styles.highlightBox}
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

export default PCEmulator