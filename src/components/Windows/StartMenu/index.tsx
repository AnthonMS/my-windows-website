import styles from './../styles.module.css'
import Image from 'next/image'

import aboutMeIcon from '@/assets/images/icons/user_card.png'
import helpIcon from '@/assets/images/icons/help_book_big-0.png'
import settingsIcon from '@/assets/images/icons/gears-0.png'
import gamesIcon from '@/assets/images/icons/joystick-2.png'
import shutdownIcon from '@/assets/images/icons/shut_down_cool-4.png'
import searchIcon from '@/assets/images/icons/search_file-1.png'

import minesGameIcon from '@/assets/images/icons/game_mine_1-0.png'

const StartMenu = () => {
    return (
        <div className={styles.startMenu}>
            <div className={styles.blueBar}></div>
            <div className={styles.headline}>Anthon <span>Mølgaard Steiness</span></div>

            <ul className={styles.menuContent}>

                <li className={`${styles.item} ${styles.more}`}>
                    <Image className={styles.itemIcon} src={gamesIcon} alt={`projects-icon`} />
                    <p className={styles.itemText}>Projects</p>

                    <ul className={styles.dropdownContent}>
                        <li className={styles.dropdownItem}>
                            <Image className={styles.dropdownItemIcon} src={minesGameIcon} alt={`game-icon`} />
                            <p className={styles.dropdownItemText}>Project 1</p>
                        </li>
                        <li className={styles.dropdownItem}>
                            <Image className={styles.dropdownItemIcon} src={minesGameIcon} alt={`game-icon`} />
                            <p className={styles.dropdownItemText}>Project 2</p>
                        </li>
                        <li className={styles.dropdownItem}>
                            <Image className={styles.dropdownItemIcon} src={minesGameIcon} alt={`game-icon`} />
                            <p className={styles.dropdownItemText}>Project 3</p>
                        </li>
                    </ul>
                </li>

                <li className={`${styles.item} ${styles.more}`}>
                    <Image className={styles.itemIcon} src={gamesIcon} alt='icon' />
                    <p className={styles.itemText}>Games</p>

                    <ul className={styles.dropdownContent}>
                        <li className={styles.dropdownItem}>
                            <Image className={styles.dropdownItemIcon} src={minesGameIcon} alt='icon' />
                            <p className={styles.dropdownItemText}>Minesweeper</p>
                        </li>
                    </ul>
                </li>


                <li className={styles.item}>
                    <Image className={styles.itemIcon} src={aboutMeIcon} alt='icon' />
                    <p className={styles.itemText}>About</p>
                </li>
                
                <li className={styles.item}>
                    <Image className={styles.itemIcon} src={searchIcon} alt='icon' />
                    <p className={styles.itemText}>Find</p>
                </li>

                <li className={styles.item}>
                    <Image className={styles.itemIcon} src={settingsIcon} alt='icon' />
                    <p className={styles.itemText}>Settings</p>
                </li>

                <li className={styles.item}>
                    <Image className={styles.itemIcon} src={helpIcon} alt='icon' />
                    <p className={styles.itemText}>Help</p>
                </li>

                <li className={styles.item}>
                    <Image className={styles.itemIcon} src={shutdownIcon} alt='icon' />
                    <p className={styles.itemText}>Shutdown</p>
                </li>
            </ul>

        </div>
    )
}

export default StartMenu