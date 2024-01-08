import React, { useRef, useState, useEffect, cloneElement } from 'react'
import Image, { StaticImageData } from 'next/image'


import _notepad from '@/assets/images/Windows98/notepad.png'
import _folder from '@/assets/images/Windows98/folder.png'

import { useSettingsStore } from '@/stores/SettingsStore'
import { isTouch } from '@/lib/utils'
import { findParentWithClass } from '@/lib/util_DOM'
import { boolean } from 'zod'

interface ToolbarProps {
    windowTitle: string
    children?: React.ReactNode;
}
const Toolbar = (props: ToolbarProps) => {
    const { children } = props
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



    const addEventHandlers = (child: React.ReactNode): React.ReactNode => {
        if (React.isValidElement(child) && (child.type === Item || child.type === MenuItem)) {
            const existingMouseDown = child.props.onMouseDown
            const newMouseDown = startmenuMouseEvents.onMouseDown
            const combinedMouseDown = (e: React.MouseEvent) => {
                existingMouseDown && existingMouseDown(e)
                newMouseDown && newMouseDown(e as React.MouseEvent<HTMLDivElement>)
            }
    
            const childWithProps = cloneElement(child as React.ReactElement, { 
                ...(child.props || {}), 
                ...startmenuMouseEvents, 
                ...startmenuTouchEvents, 
                onMouseDown: combinedMouseDown 
            })
    
            if (child.props.children) {
                const childrenWithProps = React.Children.map(child.props.children, addEventHandlers)
                return cloneElement(childWithProps as React.ReactElement, { children: childrenWithProps })
            }
    
            return childWithProps
        }
    
        if (React.isValidElement(child) && (child as React.ReactElement<any>).props.children) {
            const childrenWithProps = React.Children.map((child as React.ReactElement<any>).props.children, addEventHandlers)
            return cloneElement(child as React.ReactElement<any>, { ...(child.props as any), children: childrenWithProps })
        }
    
        return child
    }

    const childrenWithProps = React.Children.map(children, addEventHandlers)

    if (!styles.window) return <></>
    return <div ref={thisToolbar} className={styles.toolbar}>
        {childrenWithProps}
    </div>
}
interface ItemProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string
    children?: React.ReactNode
}
const Item = React.forwardRef<HTMLDivElement, ItemProps>(
    ({ label, children, ...props }, ref) => {
        const { styles } = useSettingsStore()
        // console.log('Item Props:', { ...props })
        return (
            <div className={styles.item} ref={ref} {...props}>
                <span className={styles.label}>{label}</span>
                {children}
            </div>
        )
    }
)
Item.displayName = "Item"


interface MenuProps extends React.HTMLAttributes<HTMLDivElement> {
    children?: React.ReactNode
}
const Menu = React.forwardRef<HTMLDivElement, MenuProps>(
    ({ children, ...props }, ref) => {
        const { styles } = useSettingsStore()
        return (
            <div className={styles.menu} ref={ref} {...props}>
                {children}
            </div>
        );
    }
)
Menu.displayName = "Menu"

interface MenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    disabled?: boolean;
    more?: boolean;
    icon?: StaticImageData;
    children?: React.ReactNode;
}

const MenuItem = React.forwardRef<HTMLDivElement, MenuItemProps>(
    ({ label, disabled, more, icon, children, ...props }, ref) => {
        const { styles } = useSettingsStore()
        const classNames = [styles.menuItem];
        if (disabled) classNames.push(styles.disabled);
        if (more) classNames.push(styles.more);

        return (
            <div className={classNames.join(' ')} ref={ref} {...props}>
                <div className={styles.menuItemCheck}>
                    { icon && <Image className={styles.icon} src={icon} alt={`game-icon`} /> }
                </div>
                <span className={styles.menuItemLabel}>{label}</span>
                <div className={styles.menuItemHotkey}></div>
                <div className={styles.menuItemArrow}></div>
                {children}
            </div>
        );
    }
);
MenuItem.displayName = "MenuItem"

export default Toolbar
export { Item, Menu, MenuItem }