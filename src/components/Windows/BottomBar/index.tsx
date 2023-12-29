// import styles from './../styles.module.css'
import Image, { StaticImageData } from 'next/image'
import { useState, useEffect, useRef } from 'react'


import windowsLogo from '@/assets/images/windows92-logo.png'

import Button from '../UI/Button'
import StartMenu from '../StartMenu'

import { useWindowStore } from '@/stores/windowStore'

// TODO: Update to use new windowStore: openWindow, windows, styles
export interface BottomBarProps {
}
const BottomBar = (props: BottomBarProps) => {
    const {  } = props
    const { windows, openWindow, closeWindow, hideWindow, showWindow, styles } = useWindowStore()
    const [showStart, setShowStart] = useState<Boolean>(false)
    const toggleStartMenu = () => { setShowStart(prev => !prev) }

    const startBtn = useRef<HTMLDivElement>(null)

    useEffect(() => {
        console.log('Windows Updated in BottomBar:', windows)
    }, [windows])
    

    useEffect(() => {
        const handleWindowClick = (event: any) => {
            if (!showStart) return // Dont handle close if it's not open
            closeStart(event)
        }

        window.addEventListener('mousedown', handleWindowClick)
        return () => {
            window.removeEventListener('mousedown', handleWindowClick)
        }
    }, [showStart])

    const closeStart = (event: any) => {
        let currentElement = event.target
        // Traverse the DOM hierarchy manually
        while (currentElement !== null && !currentElement.classList.contains(styles.startMenu) && !currentElement.classList.contains(styles.bottomButtonStart)) {
            currentElement = currentElement.parentElement
        }

        if (currentElement === null) {
            // The click is outside 'startMenu'
            setShowStart(false)
        }
    }

    const click = async (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.currentTarget
        if (target.classList.contains(styles.bottomButton)) {

            if (!target.classList.contains(styles.selected)) {
                target.classList.add(styles.selected)
                setShowStart(true)
            }
            else {
                target.classList.remove(styles.selected)
                setShowStart(false)
            }

            if (target.classList.contains(styles.bottomButtonStart)) {
                setShowStart(target.classList.contains(styles.selected)) // If start is selected, its true.
            }
            else if (target.classList.contains(styles.bottomButtonWindow)) {
                // remove active class from active window(s) (there should only be 1)
                const foundWindows = document.querySelectorAll(`.${styles.window}.${styles.active}`)
                const activeWindows = windows.filter((win: HTMLDivElement) => win.classList.contains(styles.active))
                foundWindows.forEach((window: Element) => {
                    window.classList.remove(styles.active)
                })

                let btnTitle: string = target.getAttribute('data-title') as string
                const elementOld: Element | null = document.querySelector(`[data-title="${btnTitle}"]`)
                const element: HTMLDivElement|undefined = windows.find((win: HTMLDivElement) => win.getAttribute('data-title') === btnTitle)
                if (element !== undefined) {
                    if (target.classList.contains(styles.selected)) {
                        // Hide
                        console.log('HIDE')
                        hideWindow(btnTitle)
                        // if (!element.classList.contains(styles.hidden)) {
                        //     element.classList.add(styles.hidden)
                        // }
                        // if (element.classList.contains(styles.active)) {
                        //     element.classList.remove(styles.active)
                        // }
                    }
                    else {
                        // Show
                        console.log('SHOW')
                        showWindow(btnTitle)
                        // if (element.classList.contains(styles.hidden)) {
                        //     element.classList.remove(styles.hidden)
                        // }
                        // if (!element.classList.contains(styles.active)) {
                        //     element.classList.add(styles.active)
                        // }
                    }
                }
            }
        }
    }

    const clickWindow = async (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.currentTarget

        // remove active class from active window(s) (there should only be 1)
        const activeWindows = windows.filter((win: HTMLDivElement) => win.classList.contains(styles.active))
        const foundWindows = document.querySelectorAll(`.${styles.window}.${styles.active}`)
        foundWindows.forEach((window: Element) => {
            window.classList.remove(styles.active)
        })

        let btnTitle: string = target.getAttribute('data-window') as string
        const elementOld: Element | null = document.querySelector(`[data-title="${btnTitle}"]`)
        const element: HTMLDivElement|undefined = windows.find((win: HTMLDivElement) => win.getAttribute('data-title') === btnTitle)
        if (element !== undefined) {
            if (target.classList.contains(styles.selected)) {
                // Hide
                console.log('HIDE')
                hideWindow(btnTitle)
                // if (!element.classList.contains(styles.hidden)) {
                //     element.classList.add(styles.hidden)
                // }
                // if (element.classList.contains(styles.active)) {
                //     element.classList.remove(styles.active)
                // }
            }
            else {
                // Show
                console.log('SHOW')
                showWindow(btnTitle)
                // if (element.classList.contains(styles.hidden)) {
                //     element.classList.remove(styles.hidden)
                // }
                // if (!element.classList.contains(styles.active)) {
                //     element.classList.add(styles.active)
                // }
            }
        }
    }


    if (!styles.bottomBar) return <></>
    return <>
        <div className={styles.bottomBar}>
            <div className={styles.leftContainer}>
                <div ref={startBtn} className={`${styles.button} ${styles.bottomButton} ${styles.bottomButtonStart} ${showStart ? styles.selected : ''}`}
                    onClick={click}>
                    <div className={styles.buttonContent}>
                        <Image className={styles.image} src={windowsLogo} width={48} height={48} alt={`windows-logo`} />
                        <p className={styles.text}>Start</p>
                    </div>
                </div>
            </div>

            <div className={styles.middleContainer}>

                {
                    windows.map((window: Element, index: number) => {
                        
                        const iconElement = window.querySelector('[data-icon="true"]')
                        const iconSrc = iconElement ? iconElement.getAttribute('src') : null

                        return (
                            <div key={`window-${index}`} data-window={window.getAttribute('data-title')} 
                                className={`${styles.button} ${styles.bottomButton} ${styles.bottomButtonWindow} ${window.classList.contains(styles.active) ? styles.selected : ''}`}
                                onClick={clickWindow}>
                                <div className={styles.buttonContent}>
                                    <Image className={styles.image} width={48} height={48} src={iconSrc ? iconSrc : windowsLogo} alt={`window-icon`} />
                                    <p className={styles.text}>{window.getAttribute('data-title')}</p>
                                </div>
                            </div>
                        )
                    })
                }

            </div>

            <div className={styles.rightContainer}>
                <p className={styles.clock}>18:11</p>
            </div>

        </div>

        {
            showStart ? <StartMenu toggleStartMenu={toggleStartMenu} /> : <></>
        }

    </>

}

export default BottomBar