'use client'

import { useEffect, useState, useRef, MutableRefObject } from 'react'
import ReactDOM from 'react-dom'
import { Root, createRoot } from 'react-dom/client'
import Head from 'next/head'

import styles from './../styles.module.css'

import BottomBar from '../BottomBar'
import DesktopIcon from '../DesktopIcon'
import computerExplorer from '@/assets/images/icons/computer_explorer.png'
import msieIcon from '@/assets/images/icons/msie.png'
import welcomeIcon from '@/assets/images/icons/welcome_icon.png'
import aboutMeIcon from '@/assets/images/icons/aboutme_icon.png'
import contactIcon from '@/assets/images/icons/contact_icon.png'
import userCardIcon from '@/assets/images/icons/user_card.png'

import Window from '../Window'
import WelcomeWindow from '../Windows/Welcome'
import AboutMeWindow from '../Windows/AboutMe'
import ContactWindow from '../Windows/Contact'
import ErrorWindow from '../Windows/Popup'
import CMDWindow from '../Windows/CMD'

import { isElementInClass, findParentWithClass } from '@/lib/util_DOM'


import { useWindowStore } from '@/stores/windowStore'

const Windows = () => {
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
            openWindow(<WelcomeWindow />)
            // openWindow(<AboutMeWindow />)
            // openWindow(<ContactWindow />)
            // openWindow(<ErrorWindow text='This is an error message. Wubba lubba dub dub!' />)
        }

        return () => {
        }
    }, [])

    useEffect(() => {
    //   console.log('Windows Updated in base:', windows)
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


    const onClickDesktopIcon = (event: React.MouseEvent<HTMLDivElement>) => {
        const target: HTMLElement = event.target as HTMLElement
        const iconId = target.getAttribute('data-id')
        switch (iconId) {
            case 'test':
                console.log('TEST CLICKED!')
                openWindow(<Window title='Test' icon={welcomeIcon}><p style={{ color: 'black' }}>FUCKING HELL MAN!</p></Window>)
                break;
            case 'welcome':
                openWindow(<WelcomeWindow />)
                break;
            case 'about-me':
                openWindow(<AboutMeWindow />)
                break;
            case 'contact':
                openWindow(<ContactWindow />)
                break;
            case 'computer':
                console.log('computer clicked!')
                break;
            // openWindow(<AboutMeWindow />)
            default:
                console.error('Desktop icon click unhandled:', target)

                break;
        }
    }

    const mouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        // console.log('MOUSE DOWN?')
        const target = event.target
        if (event.button === 0 && target instanceof HTMLElement) {
            // Check if click is inside active window. If so, we dont need to do the rest.
            if (isElementInClass(target, [styles.window, styles.active])) {
                return
            }

            // If click is not in the bottomBar -> remove active class from all windows
            if (!isElementInClass(target, styles.bottomBar)) {
                windows.forEach((window:HTMLDivElement) => {
                    removeClass(window.getAttribute('data-title') as string, styles.active)
                })

                // if click is inside a window, add active to that one
                if (isElementInClass(target, styles.window)) {
                    const clickedWindow: Element = findParentWithClass(target, styles.window) as Element
                    addClass(clickedWindow.getAttribute('data-title') as string, styles.active)
                }
            }


            if (target.classList.contains(styles.main)) {
                setIsHighlighting(true)
                setHighlightBox({
                    startX: event.nativeEvent.offsetX,
                    startY: event.nativeEvent.offsetY,
                    width: 0,
                    height: 0,
                })
            }
        }
    }
    const mouseUp = (event: React.MouseEvent<HTMLDivElement>) => {
        if (event.button === 0 && isHighlighting) { // left
            setIsHighlighting(false)
            // Here we check all elements that are within the highlight box' position and dimensions
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
                    desktopIcon.classList.add(styles.selected)
                }
            })

            setHighlightBoxRendered({ startX: 0, startY: 0, width: 0, height: 0 })
        }
    }
    const mouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
        if (isHighlighting) {
            const { clientX, clientY } = event
            setHighlightBox((prevBox) => ({
                ...prevBox,
                width: clientX - prevBox.startX,
                height: clientY - prevBox.startY,
            }))
        }
    }



    return <>
        <Head>
            <title>Your Custom Title</title>
            <meta name="description" content="Your custom description" />
            {/* Add more meta tags as needed */}
        </Head>

        <div className={styles.main} onMouseDown={mouseDown} onMouseUp={mouseUp} onMouseMove={mouseMove}>
            {/* TODO: Add data-window to DesktopIcon, it should equal the name of the window's folder*/}
            {/* So if we set data-window='AboutMe' it should try to import that window, so it can call openWindow directly. */}
            <DesktopIcon left='0px' top='0px' id='computer'
                text='Computer' icon={computerExplorer}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='0px' top='100px' id='microsoft-ie'
                text='Microsoft IE' icon={msieIcon}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='100px' top='0px' id='welcome'
                text='Welcome' icon={welcomeIcon}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='100px' top='100px' id='about-me'
                text='About Me' icon={userCardIcon}
                primaryAction={onClickDesktopIcon} />

            <DesktopIcon left='200px' top='0px' id='contact'
                text='Contact' icon={contactIcon}
                primaryAction={onClickDesktopIcon} />



            <div ref={windowsContainer}>
                {/* <WelcomeWindow /> */}
            </div>

            <BottomBar />

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

export default Windows