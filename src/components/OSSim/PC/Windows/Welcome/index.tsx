import Window from '@/components/OSSim/PC/Window'

import welcomeIcon from '@/assets/images/icons/welcome_icon.png'
import AboutMeWindow from '../AboutMe'
import ContactWindow from '../Contact'

import { useSettingsStore } from '@/stores/SettingsStore'
import { isMobile, isTouch } from '@/lib/utils'
import Notepad from '../Notepad'

export interface WelcomeWindowProps {
}
const WelcomeWindow = (props: WelcomeWindowProps) => {
    const { } = props
    const { openWindow, styles } = useSettingsStore()

    const click = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const target = event.target
        if (event.button === 0 && target instanceof HTMLAnchorElement) {
            // console.log('On Click', target)
            if (target.id === 'about') {
                // openWindow(<AboutMeWindow />)
                openWindow(<Notepad file='/Assets/txt/About.txt' />)
            }
            if (target.id === 'contact') {
                openWindow(<ContactWindow />)
            }
        }
    }
    if (!styles.window) return <></>
    return <Window title='Welcome' icon={welcomeIcon} fullscreen={isTouch() || isMobile()}
        width={Math.min(window.innerWidth - 25, 1000)} height={Math.min(window.innerHeight - 25, 800)}>

        <div className={styles.windowContainer}>
            <p className={styles.welcomeTitle}>
                Welcome<span className={styles.smaller}>to the 90s</span><span className={styles.small}>to my site!</span>
            </p>

            <div className={`${styles.border} ${styles.content}`}>
                <p className={styles.title}>Welcome to my Retro Desktop Experience!</p>
                <p className={styles.text}>
                    Hey there, digital time traveler!
                </p>

                {
                    (isTouch() || isMobile()) && <>
                        <p className={styles.title}>Mobile device detected!</p>
                        <p className={styles.text}>
                            I see you are visiting from a mobile device. I welcome all visitors. But the state of the website means that it is best experienced on a desktop computer.
                        </p>
                        <p className={styles.text}>
                            You&apos;re welcome to continue exploring. But I recommend coming back on a desktop computer to get the full experience.
                        </p>
                    </>
                }

                <p className={styles.title}>What is this?</p>
                <p className={styles.text}>
                    Welcome to a nostalgic journey back to the &apos;90s with a virtual twist! Dive into my digital playground, meticulously designed to resemble the iconic Windows 98 desktop. Here, pixels meet nostalgia, and every click unleashes a wave of memories.
                </p>

                <p className={styles.title}>How to navigate?</p>
                <p className={styles.text}>
                    Wondering where to find more about the mind behind this digital throwback? <a id='about' className={styles.link} onClick={click}>Look no further!</a> Close this window like you would on any other computer and find the About icon on the Desktop and double click it or head to the Start Menu and navigate around the site.
                </p>
                <p className={styles.text}>
                    Got questions, feedback, or just want to say hello? The <a id='contact' className={styles.link} onClick={click}>Contact page</a> is your gateway to connecting directly. Click here to jump straight to it or locate it within the Start Menu or the Desktop.
                </p>

                <p className={styles.title}>Why did I make this?</p>
                <p className={styles.text}>
                    In a world racing towards the future, I wanted to create a cozy corner where the past meets the present. This homage to Windows 98 is my ode to the simpler days of computing – a reminder of where we&apos;ve been and how far we&apos;ve come..
                </p>
                <p className={styles.title}>Let the exploration continue!</p>
                <div className={styles.divider}></div>
                <p className={styles.text}>
                    Start Here: Click on the Start Menu to explore the array of &quot;programs&quot; and unveil the magic within each window.
                </p>
                <p className={styles.text}>
                    Click & Explore: Open windows, interact with icons, and discover hidden gems. Each element has a story waiting to unfold.
                </p>
                <p className={styles.text}>
                    Ctrl + Alt + Experience: Immerse yourself in the user-friendly chaos. The more you explore, the more you&apos;ll uncover.
                </p>
            </div>
        </div>

    </Window>

}

export default WelcomeWindow