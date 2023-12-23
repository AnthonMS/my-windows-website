import styles from './../styles.module.css'
import Image from 'next/image'

import aboutMeIcon from '@/assets/images/icons/user_card.png'
import helpIcon from '@/assets/images/icons/help_book_big-0.png'
import settingsIcon from '@/assets/images/icons/gears-0.png'
import gamesIcon from '@/assets/images/icons/joystick-2.png'
import shutdownIcon from '@/assets/images/icons/shut_down_cool-4.png'
import searchIcon from '@/assets/images/icons/search_file-1.png'
import contactIcon from '@/assets/images/icons/contact_icon.png'
import welcomeIcon from '@/assets/images/icons/welcome_icon.png'
import haIcon from '@/assets/images/icons/ha_icon.png'
import windowsLogo from '@/assets/images/windows92-logo.png'

import minesGameIcon from '@/assets/images/icons/game_mine_1-0.png'


import WelcomeWindow from '../Windows/Welcome'
import AboutMeWindow from '../Windows/AboutMe'
import ContactWindow from '../Windows/Contact'

export interface StartMenuProps {
    update?: Boolean
    triggerUpdate?: Function
    openWindow: Function
    toggleStartMenu: Function
}
const StartMenu = (props: StartMenuProps) => {
    const { update, triggerUpdate, openWindow, toggleStartMenu } = props

    function isMouseEvent(event: React.MouseEvent<HTMLLIElement> | React.TouchEvent<HTMLLIElement>): event is React.MouseEvent<HTMLLIElement> {
        return 'clientX' in event;
    }
    const click = (event: React.MouseEvent<HTMLLIElement> | React.TouchEvent<HTMLLIElement>) => {
        const target = event.target
        console.log('CLICK', target)
        if (target instanceof HTMLLIElement) {
            const btnItem: string = target.getAttribute('data-item') as string

            if (isMouseEvent(event) && event.button === 0) {
                console.log('Left click!', btnItem)
            }
            else {
                console.log('Touch event!')
            }

            switch (btnItem) {
                case 'welcome':
                    openWindow(<WelcomeWindow openWindow={openWindow} update={update} triggerUpdate={triggerUpdate} />)
                    toggleStartMenu()
                    break
                case 'about':
                    openWindow(<AboutMeWindow update={update} triggerUpdate={triggerUpdate} />)
                    toggleStartMenu()
                    break
                case 'contact':
                    openWindow(<ContactWindow openWindow={openWindow} update={update} triggerUpdate={triggerUpdate} />)
                    toggleStartMenu()
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
                // openWindow(<AboutMeWindow update={update} triggerUpdate={triggerUpdate} />)
                default:
                    console.error('Start Menu click unhandled:', target)
                    break;
            }
        }
    }

    return (
        <div className={styles.startMenu}>
            <div className={styles.blueBar}></div>
            <div className={styles.headline}>Anthon <span>Mølgaard Steiness</span></div>

            <ul className={styles.menuContent}>

                <li className={`${styles.item} ${styles.more}`} onClick={click} data-item='projects'>
                    <Image className={styles.itemIcon} src={gamesIcon} alt={`projects-icon`} />
                    <p className={styles.itemText}>Projects</p>

                    <ul className={styles.dropdownContent}>
                        <li className={styles.dropdownItem} data-item='this'>
                            <Image className={styles.dropdownItemIcon} src={windowsLogo} alt={`game-icon`} />
                            <p className={styles.dropdownItemText}>This</p>
                        </li>
                        <li className={styles.dropdownItem} data-item='project-ha-cards'>
                            <Image className={styles.dropdownItemIcon} src={haIcon} alt={`game-icon`} />
                            <p className={styles.dropdownItemText}>Home Assistant UI Bundle</p>
                        </li>
                    </ul>
                </li>

                <li className={`${styles.item} ${styles.more}`} onClick={click} data-item='games'>
                    <Image className={styles.itemIcon} src={gamesIcon} alt='icon' />
                    <p className={styles.itemText}>Games</p>

                    <ul className={styles.dropdownContent}>
                        <li className={styles.dropdownItem} data-item='minesweeper'>
                            <Image className={styles.dropdownItemIcon} src={minesGameIcon} alt='icon' />
                            <p className={styles.dropdownItemText}>Minesweeper</p>
                        </li>
                    </ul>
                </li>


                <li className={styles.item} onClick={click} data-item='about'>
                    <Image className={styles.itemIcon} src={aboutMeIcon} alt='icon' />
                    <p className={styles.itemText}>About</p>
                </li>

                <li className={styles.item} onClick={click} data-item='contact'>
                    <Image className={styles.itemIcon} src={contactIcon} alt='icon' />
                    <p className={styles.itemText}>Contact</p>
                </li>

                <li className={styles.item} onClick={click} data-item='welcome'>
                    <Image className={styles.itemIcon} src={welcomeIcon} alt='icon' />
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

                <li className={styles.item} onClick={click} data-item='shutdown'>
                    <Image className={styles.itemIcon} src={shutdownIcon} alt='icon' />
                    <p className={styles.itemText}>Shutdown</p>
                </li>
            </ul>

        </div>
    )
}

export default StartMenu