// import styles from './../../styles-win98.module.css'
import Image from 'next/image'
import { useRef } from 'react'

import styles_win98 from '@/components/OSEmulator/PC/styles-win98.module.css'
import styles_winxp from '@/components/OSEmulator/PC/styles-winxp.module.css'

import images from './imageAssets'

import { useSettingsStore } from '@/stores/SettingsStore'

import WelcomeWindow from '../../Windows/Welcome'
import AboutMeWindow from '../../Windows/AboutMe'
import ContactWindow from '../../Windows/Contact'
import { isTouch } from '@/lib/utils'
import { findParentWithClass, isMouseEvent } from '@/lib/util_DOM'

export interface StartMenuProps {
    toggleStartMenu: Function
}
const StartMenu = (props: StartMenuProps) => {
    const { toggleStartMenu } = props
    const { openWindow, setStyles, styles } = useSettingsStore()
    const thisStartMenu = useRef<HTMLDivElement|null>(null)

    const click = (event: React.MouseEvent<HTMLLIElement> | React.TouchEvent<HTMLLIElement>) => {
        const target = event.target
        if (target instanceof HTMLLIElement) {
            const btnItem: string = target.getAttribute('data-item') as string

            switch (btnItem) {
                case 'welcome':
                    openWindow(<WelcomeWindow />)
                    break
                case 'about':
                    openWindow(<AboutMeWindow />)
                    break
                case 'contact':
                    openWindow(<ContactWindow />)
                    break
                case 'computer':
                    console.log('computer clicked!')
                    break
                case 'shutdown':
                    location.reload()
                    break
                case 'project-ha-cards':
                    window.open('https://github.com/AnthonMS/my-cards', '_blank')
                    break
                case 'this':
                    window.open('https://github.com/AnthonMS/my-windows-website', '_blank')
                    break
                case 'settings-styles-win98':
                    setStyles(styles_win98)
                    break
                case 'settings-styles-winxp':
                    setStyles(styles_winxp)
                    break
                default:
                    console.error('Start Menu click unhandled:', btnItem, target)
                    break;
            }


            toggleStartMenu()
        }
    }

    const handleStartMenuInput = (event: React.MouseEvent<HTMLLIElement> | React.TouchEvent<HTMLLIElement>) => {
        if ('button' in event && event.button !== 0) { return } // Dont react on right click
        if (!thisStartMenu.current) { return }

        const target = event.target
        if (target instanceof HTMLLIElement) {
            const clickedMenuItem: Element = findParentWithClass(target, styles.item) as Element
            const clickedDropdownItem: Element = findParentWithClass(target, styles.dropdownItem) as Element
            const activeBtns = thisStartMenu.current.querySelectorAll(`.${styles.item}.${styles.active}, .${styles.dropdownItem}.${styles.active}`)
            activeBtns.forEach(element => {
                if (element !== clickedMenuItem &&
                    element !== clickedDropdownItem) {
                    element.classList.remove(styles.active)
                }
            })

            if (!target.classList.contains(styles.active)) {
                target.classList.add(styles.active)
                const dropdownContent = target.querySelector(`.${styles.dropdownContent}`) as HTMLElement
                if (dropdownContent) {
                    // Calculate the bottom position of the dropdownContent relative to the viewport
                    const targetBottom = target.getBoundingClientRect().bottom
                    const targetBottomDiff = (targetBottom - window.innerHeight) + 5
                    const dropdownBottom = dropdownContent.getBoundingClientRect().bottom
                    // If the dropdownContent is extending beyond the window
                    if (dropdownBottom > window.innerHeight) {
                        // Position the bottom of the dropdownContent at the bottom of the window
                        dropdownContent.style.bottom = `${targetBottomDiff}px`;
                        dropdownContent.style.top = 'auto';
                        dropdownContent.style.transform = 'translateY(0)';
                    }
                }

            }
            else {
                target.classList.remove(styles.active)
            }

            if (!target.classList.contains(styles.more)) {
                click(event)
            }
        }
    }

    const mouseOver = (event: React.MouseEvent<HTMLLIElement>) => {
        if (!thisStartMenu.current) { return }

        const target = event.target
        if (target instanceof HTMLLIElement) {
            const menuItem: Element = findParentWithClass(target, styles.item) as Element
            const dropdownItem: Element = findParentWithClass(target, styles.dropdownItem) as Element
            const activeBtns = thisStartMenu.current.querySelectorAll(`.${styles.item}.${styles.active}, .${styles.dropdownItem}.${styles.active}`)
            activeBtns.forEach(element => {
                if (element !== menuItem &&
                    (dropdownItem === null || !element.contains(dropdownItem))) {
                    element.classList.remove(styles.active)
                }
            })

            if (!target.classList.contains(styles.active)) {
                target.classList.add(styles.active)
                const dropdownContent = target.querySelector(`.${styles.dropdownContent}`) as HTMLElement
                if (dropdownContent) {
                    // Calculate the bottom position of the dropdownContent relative to the viewport
                    const targetBottom = target.getBoundingClientRect().bottom
                    const targetBottomDiff = (targetBottom - window.innerHeight) + 5
                    const dropdownBottom = dropdownContent.getBoundingClientRect().bottom
                    // If the dropdownContent is extending beyond the window
                    if (dropdownBottom > window.innerHeight) {
                        // Position the bottom of the dropdownContent at the bottom of the window
                        dropdownContent.style.bottom = `${targetBottomDiff}px`;
                        dropdownContent.style.top = 'auto';
                        dropdownContent.style.transform = 'translateY(0)';
                    }
                }

            }
        }
    }


    const startmenuMouseEvents = !isTouch() ? {
        onMouseDown: handleStartMenuInput,
        onMouseOver: mouseOver
    } : {}
    const mouseOverEvents = !isTouch() ? {
    } : {}
    const startmenuTouchEvents = isTouch() ? {
        onTouchStart: handleStartMenuInput
    } : {}

    if (!styles.startMenu) return <></>
    return (
        <div ref={thisStartMenu} className={styles.startMenu}>
            <div className={styles.blueBar}></div>
            <div className={styles.headline}>
                <div className={styles.accountImage}></div>
                Anthon<span>Mølgaard Steiness</span>
            </div>

            <section className={styles.menu}>
                <hr className={styles.orange} />
                <ul className={`${styles.menuContent} ${styles.left}`}>

                    <li className={`${styles.item} ${styles.more}`} data-item='projects' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.gamesIcon} alt={`projects-icon`} />
                        <p className={styles.itemText}>Projects</p>

                        <ul className={styles.dropdownContent}>
                            <li className={styles.dropdownItem} data-item='this'>
                                <Image className={styles.dropdownItemIcon} src={images.windowsLogo} alt={`game-icon`} />
                                <p className={styles.dropdownItemText}>This (Repo)</p>
                            </li>
                            <li className={styles.dropdownItem} data-item='project-ha-cards'>
                                <Image className={styles.dropdownItemIcon} src={images.haIcon} alt={`game-icon`} />
                                <p className={styles.dropdownItemText}>Home Assistant UI Bundle (Repo)</p>
                            </li>
                        </ul>
                    </li>

                    <li className={`${styles.item} ${styles.more}`} data-item='games' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.gamesIcon} alt='icon' />
                        <p className={styles.itemText}>Games</p>

                        <ul className={styles.dropdownContent}>
                            <li className={styles.dropdownItem} data-item='minesweeper'>
                                <Image className={styles.dropdownItemIcon} src={images.minesweeper} alt='icon' />
                                <p className={styles.dropdownItemText}>Minesweeper</p>
                            </li>
                        </ul>
                    </li>

                    <div className={styles.separator}></div>

                    <li className={styles.item} data-item='about' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.aboutMeIcon} alt='icon' />
                        <p className={styles.itemText}>About</p>
                    </li>

                    <li className={styles.item} data-item='contact' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.contactIcon} alt='icon' />
                        <p className={styles.itemText}>Contact</p>
                    </li>

                    <li className={styles.item} data-item='welcome' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.welcomeIcon} alt='icon' />
                        <p className={styles.itemText}>Welcome</p>
                    </li>

                    {/* <li className={styles.item} onClick={click} data-item='find'>
                        <Image className={styles.itemIcon} src={searchIcon} alt='icon' />
                        <p className={styles.itemText}>Find</p>
                    </li> */}

                    {/* <li className={styles.item} onClick={click} data-item='settings'>
                        <Image className={styles.itemIcon} src={settingsIcon} alt='icon' />
                        <p className={styles.itemText}>Settings</p>
                    </li> */}

                    {/* <li className={styles.item} onClick={click} data-item='help'>
                        <Image className={styles.itemIcon} src={helpIcon} alt='icon' />
                        <p className={styles.itemText}>Help</p>
                    </li> */}

                    <li className={`${styles.item} ${styles.more}`} data-item='settings' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.monitorGear} alt={`settings-icon`} />
                        <p className={styles.itemText}>Settings</p>

                        <ul className={styles.dropdownContent}>
                            <li className={`${styles.dropdownItem} ${styles.more}`} data-item='settings-styles'>
                                <Image className={styles.itemIcon} src={images.kodakIcon} alt={`settings-styles-icon`} />
                                <p className={styles.itemText}>Style</p>

                                <ul className={styles.dropdownContent}>
                                    <li className={styles.dropdownItem} data-item='settings-styles-win98'>
                                        <Image className={styles.dropdownItemIcon} src={images.windowsLogo} alt={`settings-styles-win98-icon`} />
                                        <p className={styles.dropdownItemText}>Windows 98/95</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='settings-styles-winxp'>
                                        <Image className={styles.dropdownItemIcon} src={images.winxpLogo} alt={`settings-styles-winxp-icon`} />
                                        <p className={styles.dropdownItemText}>Windows XP</p>
                                    </li>
                                </ul>
                            </li>
                        </ul>

                    </li>


                    <li className={`${styles.item} ${styles.nodisplay_xp}`} data-item='shutdown' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.shutdownIcon} alt='icon' />
                        <p className={styles.itemText}>Shutdown</p>
                    </li>

                    <div className={styles.filler}></div>
                    <div className={styles.separator}></div>

                    <li className={`${styles.item} ${styles.more} ${styles.nodisplay_98}`} data-item='all-programs' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.gamesIcon} alt='icon' />
                        <p className={styles.itemText}>All Programs</p>

                        <ul className={styles.dropdownContent}>
                            <li className={styles.dropdownItem} data-item='program-access'>
                                <Image className={styles.dropdownItemIcon} src={images.program_access} alt='icon' />
                                <p className={styles.dropdownItemText}>Set Program Access and Defaults</p>
                            </li>
                            <li className={styles.dropdownItem} data-item='windows-catalog'>
                                <Image className={styles.dropdownItemIcon} src={images.windows_catalog} alt='icon' />
                                <p className={styles.dropdownItemText}>Windows Catalog</p>
                            </li>
                            <li className={styles.dropdownItem} data-item='windows-update'>
                                <Image className={styles.dropdownItemIcon} src={images.windows_update} alt='icon' />
                                <p className={styles.dropdownItemText}>Windows Update</p>
                            </li>
                            <div className={styles.separator}></div>




                            <li className={`${styles.dropdownItem} ${styles.more}`} data-item='accessories'>
                                <Image className={styles.itemIcon} src={images.folder_program} alt={`accessories-icon`} />
                                <p className={styles.itemText}>Accessories</p>

                                <ul className={styles.dropdownContent}>

                                    <li className={`${styles.dropdownItem} ${styles.more}`} data-item='accessories-accessibility'>
                                        <Image className={styles.itemIcon} src={images.folder_program} alt={`accessibility-icon`} />
                                        <p className={styles.itemText}>Accessibility</p>

                                        <ul className={styles.dropdownContent}>
                                            <li className={styles.dropdownItem} data-item='accessibility-wizard'>
                                                <Image className={styles.dropdownItemIcon} src={images.access_wizard} alt={`accessibility-wizard-icon`} />
                                                <p className={styles.dropdownItemText}>Accessibility Wizard</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='magnifier'>
                                                <Image className={styles.dropdownItemIcon} src={images.program_search} alt={`magnifier-icon`} />
                                                <p className={styles.dropdownItemText}>Magnifier</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='narrator'>
                                                <Image className={styles.dropdownItemIcon} src={images.narrator} alt={`narrator-icon`} />
                                                <p className={styles.dropdownItemText}>Narrator</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='onscreen-keyboard'>
                                                <Image className={styles.dropdownItemIcon} src={images.keyboard} alt={`onscreen-keyboard-icon`} />
                                                <p className={styles.dropdownItemText}>On-Screen Keyboard</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='utility-manager'>
                                                <Image className={styles.dropdownItemIcon} src={images.program_settings} alt={`utility-manager-icon`} />
                                                <p className={styles.dropdownItemText}>Utility Manager</p>
                                            </li>
                                        </ul>
                                    </li>

                                    <li className={`${styles.dropdownItem} ${styles.more}`} data-item='accessories-communications'>
                                        <Image className={styles.itemIcon} src={images.folder_program} alt={`communications-icon`} />
                                        <p className={styles.itemText}>Communications</p>

                                        <ul className={styles.dropdownContent}>
                                            <li className={styles.dropdownItem} data-item='hyperterminal'>
                                                <Image className={styles.dropdownItemIcon} src={images.hyperterminal} alt={`hyperterminal-icon`} />
                                                <p className={styles.dropdownItemText}>HyperTerminal</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='network-connections'>
                                                <Image className={styles.dropdownItemIcon} src={images.network_connections} alt={`connections-icon`} />
                                                <p className={styles.dropdownItemText}>Network Connections</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='network-setup-wizard'>
                                                <Image className={styles.dropdownItemIcon} src={images.network_setup_wizard} alt={`network-setup-wizard-icon`} />
                                                <p className={styles.dropdownItemText}>Network Setup Wizard</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='new-connection-wizard'>
                                                <Image className={styles.dropdownItemIcon} src={images.new_connection_wizard} alt={`new-connection-wizard-icon`} />
                                                <p className={styles.dropdownItemText}>New Connection Wizard</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='wireless-network-setup-wizard'>
                                                <Image className={styles.dropdownItemIcon} src={images.wireless_network} alt={`wireless-icon`} />
                                                <p className={styles.dropdownItemText}>Wireless Network Setup Wizard</p>
                                            </li>
                                        </ul>
                                    </li>

                                    <li className={`${styles.dropdownItem} ${styles.more}`} data-item='accessories-entertainment'>
                                        <Image className={styles.itemIcon} src={images.folder_program} alt={`entertainment-icon`} />
                                        <p className={styles.itemText}>Entertainment</p>

                                        <ul className={styles.dropdownContent}>
                                            <li className={styles.dropdownItem} data-item='sound-recorder'>
                                                <Image className={styles.dropdownItemIcon} src={images.sound} alt={`sound-icon`} />
                                                <p className={styles.dropdownItemText}>Sound Recorder</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='volume-control'>
                                                <Image className={styles.dropdownItemIcon} src={images.volume} alt={`volume-icon`} />
                                                <p className={styles.dropdownItemText}>Volume Control</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='windows-media-player'>
                                                <Image className={styles.dropdownItemIcon} src={images.windows_media_player} alt={`windows-media-player-icon`} />
                                                <p className={styles.dropdownItemText}>Windows Media Player</p>
                                            </li>
                                        </ul>
                                    </li>

                                    <li className={`${styles.dropdownItem} ${styles.more}`} data-item='accessories-system-tools'>
                                        <Image className={styles.itemIcon} src={images.folder_program} alt={`system-tools-icon`} />
                                        <p className={styles.itemText}>System Tools</p>

                                        <ul className={styles.dropdownContent}>
                                            <li className={styles.dropdownItem} data-item='backup'>
                                                <Image className={styles.dropdownItemIcon} src={images.backup} alt={`backup-icon`} />
                                                <p className={styles.dropdownItemText}>Backup</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='character-map'>
                                                <Image className={styles.dropdownItemIcon} src={images.character_map} alt={`keycap-icon`} />
                                                <p className={styles.dropdownItemText}>Character Map</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='disk-cleanup'>
                                                <Image className={styles.dropdownItemIcon} src={images.disk_cleanup} alt={`disk-cleanup-icon`} />
                                                <p className={styles.dropdownItemText}>Disk Cleanup</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='disk-defragmenter'>
                                                <Image className={styles.dropdownItemIcon} src={images.disk_defragmenter} alt={`disk-defragmenter-icon`} />
                                                <p className={styles.dropdownItemText}>Disk Defragmenter</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='files-wizard'>
                                                <Image className={styles.dropdownItemIcon} src={images.folder_transfer} alt={`folder-transfer-icon`} />
                                                <p className={styles.dropdownItemText}>Files and Settings Transfer Wizard</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='scheduled-tasks'>
                                                <Image className={styles.dropdownItemIcon} src={images.scheduled_tasks} alt={`scheduled-tasks-icon`} />
                                                <p className={styles.dropdownItemText}>Scheduled Tasks</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='security-center'>
                                                <Image className={styles.dropdownItemIcon} src={images.security} alt={`security-icon`} />
                                                <p className={styles.dropdownItemText}>Securit Center</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='system-information'>
                                                <Image className={styles.dropdownItemIcon} src={images.system_info} alt={`system-info-icon`} />
                                                <p className={styles.dropdownItemText}>System Information</p>
                                            </li>
                                            <li className={styles.dropdownItem} data-item='system-restore'>
                                                <Image className={styles.dropdownItemIcon} src={images.system_restore} alt={`system-restore-icon`} />
                                                <p className={styles.dropdownItemText}>System Restore</p>
                                            </li>
                                        </ul>
                                    </li>

                                    <li className={styles.dropdownItem} data-item='accessories-address-book'>
                                        <Image className={styles.dropdownItemIcon} src={images.address_book} alt={`address-book-icon`} />
                                        <p className={styles.dropdownItemText}>Address Book</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-command-prompt'>
                                        <Image className={styles.dropdownItemIcon} src={images.command_prompt} alt={`command-prompt-icon`} />
                                        <p className={styles.dropdownItemText}>Command Prompt</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-notepad'>
                                        <Image className={styles.dropdownItemIcon} src={images.notepad} alt={`notepad-icon`} />
                                        <p className={styles.dropdownItemText}>Notepad</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-paint'>
                                        <Image className={styles.dropdownItemIcon} src={images.paint} alt={`paint-icon`} />
                                        <p className={styles.dropdownItemText}>Paint</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-calculator'>
                                        <Image className={styles.dropdownItemIcon} src={images.calculator} alt={`calculator-icon`} />
                                        <p className={styles.dropdownItemText}>Calculator</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-compatibility'>
                                        <Image className={styles.dropdownItemIcon} src={images.help_support} alt={`compatibility-icon`} />
                                        <p className={styles.dropdownItemText}>Program Compatibility Wizard</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-remote-desktop'>
                                        <Image className={styles.dropdownItemIcon} src={images.remote_desktop} alt={`remote-desktop-icon`} />
                                        <p className={styles.dropdownItemText}>Remote Desktop Connection</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-synchronize'>
                                        <Image className={styles.dropdownItemIcon} src={images.synchronize} alt={`synchronize-icon`} />
                                        <p className={styles.dropdownItemText}>Synchronize</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-tour'>
                                        <Image className={styles.dropdownItemIcon} src={images.tour} alt={`tour-icon`} />
                                        <p className={styles.dropdownItemText}>Tour Windows XP</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-explorer'>
                                        <Image className={styles.dropdownItemIcon} src={images.folder_search} alt={`explorer-icon`} />
                                        <p className={styles.dropdownItemText}>Windows Explorer</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='accessories-wordpad'>
                                        <Image className={styles.dropdownItemIcon} src={images.wordpad} alt={`wordpad-icon`} />
                                        <p className={styles.dropdownItemText}>Wordpad</p>
                                    </li>
                                </ul>
                            </li>

                            <li className={`${styles.dropdownItem} ${styles.more}`} data-item='games'>
                                <Image className={styles.itemIcon} src={images.folder_program} alt={`games-icon`} />
                                <p className={styles.itemText}>Games</p>

                                <ul className={styles.dropdownContent}>
                                    <li className={styles.dropdownItem} data-item='games-freecell'>
                                        <Image className={styles.dropdownItemIcon} src={images.freecell} alt={`games-freecell-icon`} />
                                        <p className={styles.dropdownItemText}>FreeCell</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-hearts'>
                                        <Image className={styles.dropdownItemIcon} src={images.hearts} alt={`games-hearts-icon`} />
                                        <p className={styles.dropdownItemText}>Hearts</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-internet-backgammon'>
                                        <Image className={styles.dropdownItemIcon} src={images.internet_backgammon} alt={`games-internet-backgammon-icon`} />
                                        <p className={styles.dropdownItemText}>Internet Backgammon</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-internet-checkers'>
                                        <Image className={styles.dropdownItemIcon} src={images.internet_checkers} alt={`games-internet-checkers-icon`} />
                                        <p className={styles.dropdownItemText}>Internet Checkers</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-internet-hearts'>
                                        <Image className={styles.dropdownItemIcon} src={images.internet_hearts} alt={`games-internet-hearts-icon`} />
                                        <p className={styles.dropdownItemText}>Internet Hearts</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-internet-reversi'>
                                        <Image className={styles.dropdownItemIcon} src={images.internet_reversi} alt={`games-internet-reversi-icon`} />
                                        <p className={styles.dropdownItemText}>Internet Reversi</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-internet-spades'>
                                        <Image className={styles.dropdownItemIcon} src={images.internet_spades} alt={`games-internet-spades-icon`} />
                                        <p className={styles.dropdownItemText}>Internet Spades</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-minesweeper'>
                                        <Image className={styles.dropdownItemIcon} src={images.minesweeper} alt={`games-minesweeper-icon`} />
                                        <p className={styles.dropdownItemText}>Minesweeper</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-pinball'>
                                        <Image className={styles.dropdownItemIcon} src={images.pinball} alt={`games-pinball-icon`} />
                                        <p className={styles.dropdownItemText}>Pinball</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-solitare'>
                                        <Image className={styles.dropdownItemIcon} src={images.solitare} alt={`games-solitare-icon`} />
                                        <p className={styles.dropdownItemText}>Solitare</p>
                                    </li>
                                    <li className={styles.dropdownItem} data-item='games-spider-solitare'>
                                        <Image className={styles.dropdownItemIcon} src={images.spider_solitare} alt={`games-spider-solitare-icon`} />
                                        <p className={styles.dropdownItemText}>Spider Solitare</p>
                                    </li>
                                </ul>
                            </li>

                            <li className={`${styles.dropdownItem} ${styles.more}`} data-item='startup'>
                                <Image className={styles.itemIcon} src={images.folder_program} alt={`startup-icon`} />
                                <p className={styles.itemText}>Startup</p>

                                <ul className={`${styles.dropdownContent} ${styles.empty}`}>
                                    <li className={styles.dropdownItem} data-item='startup-empty'>
                                        {/* <Image className={styles.dropdownItemIcon} src={windowsLogo} alt={`accessories-win98-icon`} /> */}
                                        <p className={`${styles.dropdownItemText} ${styles.empty}`}>(Empty)</p>
                                    </li>
                                </ul>
                            </li>



                            <li className={styles.dropdownItem} data-item='internet-explorer'>
                                <Image className={styles.dropdownItemIcon} src={images.internet_explorer} alt='icon' />
                                <p className={styles.dropdownItemText}>Internet Explorer</p>
                            </li>
                            <li className={styles.dropdownItem} data-item='outlook-express'>
                                <Image className={styles.dropdownItemIcon} src={images.email} alt='icon' />
                                <p className={styles.dropdownItemText}>Outlook Express</p>
                            </li>
                            <li className={styles.dropdownItem} data-item='remote-assistance'>
                                <Image className={styles.dropdownItemIcon} src={images.remote_assistance} alt='icon' />
                                <p className={styles.dropdownItemText}>Remote Assistance</p>
                            </li>
                            <li className={styles.dropdownItem} data-item='windows-media-player'>
                                <Image className={styles.dropdownItemIcon} src={images.windows_media_player} alt='icon' />
                                <p className={styles.dropdownItemText}>Windows Media Player</p>
                            </li>
                            <li className={styles.dropdownItem} data-item='windows-messenger'>
                                <Image className={styles.dropdownItemIcon} src={images.windows_messenger} alt='icon' />
                                <p className={styles.dropdownItemText}>Windows Messenger</p>
                            </li>
                            <li className={styles.dropdownItem} data-item='windows-movie-maker'>
                                <Image className={styles.dropdownItemIcon} src={images.windows_movie_maker} alt='icon' />
                                <p className={styles.dropdownItemText}>Windows Movie Maker</p>
                            </li>
                        </ul>
                    </li>

                </ul>


                <ul className={`${styles.menuContent} ${styles.right} ${styles.nodisplay_98}`}>

                    <li className={styles.item} data-item='my-documents' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.my_documents} alt='icon' />
                        <p className={`${styles.itemText} ${styles.bold}`}>My Documents</p>
                    </li>

                    <li className={`${styles.item} ${styles.more}`} data-item='my-recent-documents' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.my_recent_documents} alt='icon' />
                        <p className={`${styles.itemText} ${styles.bold}`}>My Recent Documents</p>

                        <ul className={`${styles.dropdownContent} ${styles.empty}`}>
                            <li className={styles.dropdownItem} data-item='my-recent-documents-empty'>
                                {/* <Image className={styles.dropdownItemIcon} src={images.minesweeper} alt='icon' /> */}
                                <p className={`${styles.dropdownItemText} ${styles.empty}`}>(Empty)</p>
                            </li>
                        </ul>
                    </li>

                    <li className={styles.item} data-item='my-pictures' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.my_pictures} alt='icon' />
                        <p className={`${styles.itemText} ${styles.bold}`}>My Pictures</p>
                    </li>

                    <li className={styles.item} data-item='my-music' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.my_music} alt='icon' />
                        <p className={`${styles.itemText} ${styles.bold}`}>My Music</p>
                    </li>

                    <li className={styles.item} data-item='my-computer' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.my_computer} alt='icon' />
                        <p className={`${styles.itemText} ${styles.bold}`}>My Computer</p>
                    </li>

                    <div className={styles.separator}></div>

                    <li className={styles.item} data-item='control-panel' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.control_panel} alt='icon' />
                        <p className={styles.itemText}>Control Panel</p>
                    </li>

                    <li className={styles.item} data-item='program-access' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.program_access} alt='icon' />
                        <p className={styles.itemText}>Set Program Access and Defaults</p>
                    </li>

                    <li className={styles.item} data-item='connect-to' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.connect_to} alt='icon' />
                        <p className={styles.itemText}>Connect To</p>
                    </li>

                    <li className={styles.item} data-item='printers-faxes' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.printers_faxes} alt='icon' />
                        <p className={styles.itemText}>Printers and Faxes</p>
                    </li>

                    <div className={styles.separator}></div>

                    <li className={styles.item} data-item='help-support' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.help_support} alt='icon' />
                        <p className={styles.itemText}>Help and Support</p>
                    </li>

                    <li className={styles.item} data-item='search' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.search} alt='icon' />
                        <p className={styles.itemText}>Search</p>
                    </li>

                    <li className={styles.item} data-item='run' {...startmenuMouseEvents} {...startmenuTouchEvents}>
                        <Image className={styles.itemIcon} src={images.run} alt='icon' />
                        <p className={styles.itemText}>Run...</p>
                    </li>




                </ul>

            </section>

            <div className={`${styles.footer} ${styles.nodisplay_98}`}>
                <div className={styles.item}>
                    <Image className={styles.icon} src={images.log_off} alt='icon' />
                    <span className={styles.text}>Log Off</span>
                </div>
                <div className={styles.item}>
                    <Image className={styles.icon} src={images.turn_off} alt='icon' />
                    <span className={styles.text}>Turn Off Computer</span>
                </div>
            </div>

        </div>
    )
}

export default StartMenu