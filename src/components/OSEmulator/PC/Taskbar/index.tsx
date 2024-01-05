// import styles from './../styles-win98.module.css'
import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'

import windowsLogo from '@/assets/images/windows92-logo.png'
import StartMenu from './StartMenu'
import { useWindowStore } from '@/stores/windowStore'
import Time from '../UI/Time'
import { isTouch } from '@/lib/utils'

interface TaskbarProps { }
const Taskbar = (props: TaskbarProps) => {
    const { } = props
    const { windows, hideWindow, showWindow, removeClass, styles } = useWindowStore()
    const [showStart, setShowStart] = useState<Boolean>(false)
    const toggleStartMenu = () => { setShowStart(prev => !prev) }

    const startBtn = useRef<HTMLDivElement>(null)

    useEffect(() => {
        // console.log('Windows Updated in Taskbar:', windows)
    }, [windows])


    useEffect(() => {
        const handleWindowClick = (event: any) => {
            if (!showStart) return // Dont handle close if it's not open
            closeStart(event)
        }
        if (!isTouch()) {
            window.addEventListener('mousedown', handleWindowClick)
        }
        else {
            window.addEventListener('touchstart', handleWindowClick)
        }
        return () => {
            window.removeEventListener('mousedown', handleWindowClick)
            window.removeEventListener('touchstart', handleWindowClick)
        }
    }, [showStart])

    const closeStart = (event: any) => {
        let currentElement = event.target
        // Traverse the DOM hierarchy manually
        while (currentElement !== null && !currentElement.classList.contains(styles.startMenu) && !currentElement.classList.contains(styles.startBtn)) {
            currentElement = currentElement.parentElement
        }

        if (currentElement === null) {
            // The click is outside 'startMenu'
            setShowStart(false)
        }
    }

    const clickStart = async (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.currentTarget
        if (target.classList.contains(styles.taskbarButton)) {
            if (!target.classList.contains(styles.selected)) {
                target.classList.add(styles.selected)
                setShowStart(true)
            }
            else {
                target.classList.remove(styles.selected)
                setShowStart(false)
            }
        }
    }

    const clickWindow = async (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        const target = event.currentTarget

        // remove active class from active window(s) (there should only be 1)
        const activeWindows = windows.filter((win: HTMLDivElement) => win.classList.contains(styles.active))
        activeWindows.forEach((window: Element) => {
            removeClass(window.getAttribute('data-title') as string, styles.active)
        })

        let btnTitle: string = target.getAttribute('data-window') as string
        const element: HTMLDivElement | undefined = windows.find((win: HTMLDivElement) => win.getAttribute('data-title') === btnTitle)
        if (element !== undefined) {
            if (target.classList.contains(styles.selected)) {
                hideWindow(btnTitle)
            }
            else {
                showWindow(btnTitle)
            }
        }
    }


    if (!styles.taskbar) return <></>
    return <>
        <div className={styles.taskbar}>
            <div className={styles.leftContainer}>
                
                <div className={`${styles.taskbarButtonContainer}`}>
                    <div ref={startBtn} className={`${styles.button} ${styles.taskbarButton} ${styles.startBtn} ${showStart ? styles.selected : ''}`}
                        onClick={clickStart}>
                        <div className={styles.buttonContent}>
                            <Image className={styles.image} src={windowsLogo} width={48} height={48} alt={`windows-logo`} />
                            <p className={styles.text}>Start</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className={styles.middleContainer}>
                {
                    windows.map((window: Element, index: number) => {
                        const iconElement = window.querySelector('[data-icon="true"]')
                        const iconSrc = iconElement ? iconElement.getAttribute('src') : null

                        return (
                            <div key={`window-${index}`} className={`${styles.taskbarButtonContainer}`}>
                                <div data-window={window.getAttribute('data-title')}
                                    className={`${styles.button} ${styles.taskbarButton} ${styles.windowBtn} ${window.classList.contains(styles.active) ? styles.selected : ''}`}
                                    onClick={clickWindow}>
                                    <div className={styles.buttonContent}>
                                        <Image className={styles.image} width={48} height={48} src={iconSrc ? iconSrc : windowsLogo} alt={`window-icon`} />
                                        <p className={styles.text}>{window.getAttribute('data-title')}</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            <div className={styles.rightContainer}>
                <p className={styles.clock}><Time /></p>
            </div>

        </div>

        {
            showStart ? <StartMenu toggleStartMenu={toggleStartMenu} /> : <></>
        }

    </>

}

export default Taskbar