import { useRef, useState, useEffect } from 'react'
import Image from 'next/image'


import _notepad from '@/assets/images/Windows98/notepad.png'
import _folder from '@/assets/images/Windows98/folder.png'

import { useSettingsStore } from '@/stores/SettingsStore'
import { isTouch } from '@/lib/utils'
import { findParentWithClass } from '@/lib/util_DOM'
import { boolean } from 'zod'

interface ToolbarProps {
    windowTitle: string
}
const Toolbar = (props: ToolbarProps) => {
    const { } = props
    const { styles } = useSettingsStore()
    const thisToolbar = useRef<HTMLDivElement | null>(null)
    const [menuOpen, setMenuOpen] = useState<boolean>(false)

    useEffect(() => {
        if (!menuOpen) return
        
        if (!isTouch()) {
            window.addEventListener('mousedown', closeMenus)
        }
        else {
            window.addEventListener('touchstart', closeMenus)
        }
        return () => {
            window.removeEventListener('mousedown', closeMenus)
            window.removeEventListener('touchstart', closeMenus)
        }
    }, [menuOpen])

    const closeMenus = (event: any) => {
        if (!thisToolbar.current) { return }
        let target = event.target
        const item: Element = findParentWithClass(target, styles.item) as Element
        const menuItem: Element = findParentWithClass(target, styles.menuItem) as Element
        
        if (!item && !menuItem) {
            const activeBtns = thisToolbar.current.querySelectorAll(`.${styles.item}.${styles.active}, .${styles.menuItem}.${styles.active}`)
            activeBtns.forEach(element => {
                element.classList.remove(styles.active)
            })
            setMenuOpen(false)
        }
    }

    const handleInput = (event: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
        if ('button' in event && event.button !== 0) { return } // Dont react on right click
        if (!thisToolbar.current) { return }

        const target = event.target
        if (target instanceof HTMLDivElement) {
            const item: Element = findParentWithClass(target, styles.item) as Element
            const menuItem: Element = findParentWithClass(target, styles.menuItem) as Element
            const menu = target.querySelector(`.${styles.menu}`) as HTMLElement

            const activeBtns = thisToolbar.current.querySelectorAll(`.${styles.item}.${styles.active}, .${styles.menuItem}.${styles.active}`)
            activeBtns.forEach(element => {
                if (element !== item &&
                    element !== menuItem &&
                    (menuItem === null || !element.contains(menuItem))) {
                    element.classList.remove(styles.active)
                }
            })

            if (!target.classList.contains(styles.active)) {
                target.classList.add(styles.active)
                setMenuOpen(true)
            }
            else if (!target.classList.contains(styles.menuItem)) {
                target.classList.remove(styles.active)
            }
        }
    }


    const mouseOver = (event: React.MouseEvent<HTMLDivElement>) => {
        if (!thisToolbar.current) { return }
        const target = event.target
        // console.log('HOVER!')
        if (target instanceof HTMLDivElement) {
            const activeBtns = thisToolbar.current.querySelectorAll(`.${styles.item}.${styles.active}, .${styles.menuItem}.${styles.active}`)
            // if any of the items in toolbar already has an active class, we should add & remove active classes while hovering
            if (activeBtns.length > 0) {
                const item: Element = findParentWithClass(target, styles.item) as Element
                const menuItem: Element = findParentWithClass(target, styles.menuItem) as Element
                
                activeBtns.forEach(element => {
                    if (element !== item &&
                        element !== menuItem &&
                        (menuItem === null || !element.contains(menuItem))) {
                        element.classList.remove(styles.active)
                    }
                })

                if (!target.classList.contains(styles.active)) {
                    target.classList.add(styles.active)
                }
            }
        }
    }


    const startmenuMouseEvents = !isTouch() ? {
        onMouseDown: handleInput,
        onMouseOver: mouseOver
    } : {}
    const startmenuTouchEvents = isTouch() ? {
        onTouchStart: handleInput
    } : {}
    if (!styles.window) return <></>
    return <div ref={thisToolbar} className={styles.toolbar}>
        <div className={`${styles.item} ${styles.active}`} {...startmenuMouseEvents} {...startmenuTouchEvents}>
            <span className={styles.label}>File</span>

            <div className={styles.menu}>
                <div className={`${styles.menuItem}`}>
                    <div className={styles.menuItemCheck}>
                        <Image className={styles.icon} src={_folder} alt={`game-icon`} />
                    </div>
                    <span className={styles.menuItemLabel}>New</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
                <div className={`${styles.menuItem} ${styles.more}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Open..</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>

                    <div className={styles.menu}>
                        <div className={`${styles.menuItem} ${styles.disabled}`}>
                            <div className={styles.menuItemCheck}></div>
                            <span className={styles.menuItemLabel}>Open this...</span>
                            <div className={styles.menuItemHotkey}></div>
                            <div className={styles.menuItemArrow}></div>
                        </div>
                        <div className={`${styles.menuItem} ${styles.disabled} ${styles.more}`}>
                            <div className={styles.menuItemCheck}></div>
                            <span className={styles.menuItemLabel}>Open that...</span>
                            <div className={styles.menuItemHotkey}></div>
                            <div className={styles.menuItemArrow}></div>
                            <div className={styles.menu}>
                                <div className={`${styles.menuItem} ${styles.disabled}`}>
                                    <div className={styles.menuItemCheck}></div>
                                    <span className={styles.menuItemLabel}>Open that there...</span>
                                    <div className={styles.menuItemHotkey}></div>
                                    <div className={styles.menuItemArrow}></div>
                                </div>
                                <div className={`${styles.menuItem} ${styles.disabled} ${styles.more}`}>
                                    <div className={styles.menuItemCheck}></div>
                                    <span className={styles.menuItemLabel}>Open that here...</span>
                                    <div className={styles.menuItemHotkey}></div>
                                    <div className={styles.menuItemArrow}></div>
                                    <div className={styles.menu}>
                                        <div className={`${styles.menuItem} ${styles.disabled}`}>
                                            <div className={styles.menuItemCheck}></div>
                                            <span className={styles.menuItemLabel}>Edit this?</span>
                                            <div className={styles.menuItemHotkey}></div>
                                            <div className={styles.menuItemArrow}></div>
                                        </div>
                                        <div className={`${styles.menuItem} ${styles.disabled}`}>
                                            <div className={styles.menuItemCheck}></div>
                                            <span className={styles.menuItemLabel}>Edit that?</span>
                                            <div className={styles.menuItemHotkey}></div>
                                            <div className={styles.menuItemArrow}></div>
                                        </div>
                                    </div>
                                </div>
                                <div className={`${styles.menuItem} ${styles.disabled}`}>
                                    <div className={styles.menuItemCheck}></div>
                                    <span className={styles.menuItemLabel}>Open that now...</span>
                                    <div className={styles.menuItemHotkey}></div>
                                    <div className={styles.menuItemArrow}></div>
                                </div>
                                <div className={`${styles.menuItem} ${styles.disabled}`}>
                                    <div className={styles.menuItemCheck}></div>
                                    <span className={styles.menuItemLabel}>Open that later...</span>
                                    <div className={styles.menuItemHotkey}></div>
                                    <div className={styles.menuItemArrow}></div>
                                </div>
                                <div className={`${styles.menuItem} ${styles.disabled}`}>
                                    <div className={styles.menuItemCheck}></div>
                                    <span className={styles.menuItemLabel}>Open that later...</span>
                                    <div className={styles.menuItemHotkey}></div>
                                    <div className={styles.menuItemArrow}></div>
                                </div>
                                <div className={`${styles.menuItem} ${styles.disabled}`}>
                                    <div className={styles.menuItemCheck}></div>
                                    <span className={styles.menuItemLabel}>Open that later...</span>
                                    <div className={styles.menuItemHotkey}></div>
                                    <div className={styles.menuItemArrow}></div>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Save</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Save As...</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Page Setup...</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Print...</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
                <div className={styles.menuItem}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Exit</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
            </div>
        </div>
        <div className={styles.item} {...startmenuMouseEvents} {...startmenuTouchEvents}>
            <span className={styles.label}>Edit</span>

            <div className={styles.menu}>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Edit this?</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Edit that?</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
            </div>
        </div>
        <div className={styles.item} {...startmenuMouseEvents} {...startmenuTouchEvents}>
            <span className={styles.label}>Search</span>

            <div className={styles.menu}>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Search this</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Search That</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
            </div>
        </div>
        <div className={styles.item} {...startmenuMouseEvents} {...startmenuTouchEvents}>
            <span className={styles.label}>Help</span>

            <div className={styles.menu}>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Help You</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
                <div className={`${styles.menuItem} ${styles.disabled}`}>
                    <div className={styles.menuItemCheck}></div>
                    <span className={styles.menuItemLabel}>Help Me</span>
                    <div className={styles.menuItemHotkey}></div>
                    <div className={styles.menuItemArrow}></div>
                </div>
            </div>
        </div>
    </div>
}

export default Toolbar