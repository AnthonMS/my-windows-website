// import globalStyles from './../../styles.module.css'
import myStyles from './styles.module.css'

// import Window from '@/components/Windows/Window'
import Window from '@/components/OSEmulator/PC/Window'

import welcomeIcon from '@/assets/images/icons/welcome_icon.png'
import AboutMeWindow from '../AboutMe'
import ContactWindow from '../Contact'

import { useWindowStore } from '@/stores/windowStore'
import { isMobile, isTouch } from '@/lib/utils'

export interface WelcomeWindowProps {
}
const WelcomeWindow = (props: WelcomeWindowProps) => {
    const { } = props
    const { openWindow, styles } = useWindowStore()

    const click = (event: React.MouseEvent<HTMLAnchorElement>) => {
        const target = event.target
        if (event.button === 0 && target instanceof HTMLAnchorElement) {
            // console.log('On Click', target)
            if (target.id === 'about') {
                openWindow(<AboutMeWindow />)
            }
            if (target.id === 'contact') {
                openWindow(<ContactWindow />)
            }
        }
    }
    if (!styles.window) return <></>
    return <Window title='Welcome' icon={welcomeIcon} fullscreen={isTouch() || isMobile()}
        width={Math.min(window.innerWidth - 25, 1000)} height={Math.min(window.innerHeight - 25, 800)}>

        <div className={myStyles.windowContainer}>
            <p className={myStyles.welcomeTitle}>
                Welcome<span className={myStyles.smaller}>to the 90s</span><span className={myStyles.small}>to my site!</span>
            </p>

            <div className={`${styles.border} ${myStyles.content}`}>
                <p className={myStyles.title}>Welcome to my Retro Desktop Experience!</p>
                <p className={myStyles.text}>
                    Hey there, digital time traveler!
                </p>

                {
                    (isTouch() || isMobile()) && <>
                        <p className={myStyles.title}>Mobile device detected!</p>
                        <p className={myStyles.text}>
                            I see you are visiting from a mobile device. I welcome all visitors. But the state of the website means that it is best experienced on a desktop computer.
                        </p>
                        <p className={myStyles.text}>
                            You&apos;re welcome to continue exploring. But I recommend coming back on a desktop computer to get the full experience.
                        </p>
                    </>
                }

                <p className={myStyles.title}>What is this?</p>
                <p className={myStyles.text}>
                    Welcome to a nostalgic journey back to the &apos;90s with a virtual twist! Dive into my digital playground, meticulously designed to resemble the iconic Windows 98 desktop. Here, pixels meet nostalgia, and every click unleashes a wave of memories.
                </p>

                <p className={myStyles.title}>How to navigate?</p>
                <p className={myStyles.text}>
                    Wondering where to find more about the mind behind this digital throwback? <a id='about' className={myStyles.link} onClick={click}>Look no further!</a> Close this window like you would on any other computer and find the About icon on the Desktop and double click it or head to the Start Menu and navigate around the site.
                </p>
                <p className={myStyles.text}>
                    Got questions, feedback, or just want to say hello? The <a id='contact' className={myStyles.link} onClick={click}>Contact page</a> is your gateway to connecting directly. Click here to jump straight to it or locate it within the Start Menu or the Desktop.
                </p>

                <p className={myStyles.title}>Why did I make this?</p>
                <p className={myStyles.text}>
                    In a world racing towards the future, I wanted to create a cozy corner where the past meets the present. This homage to Windows 98 is my ode to the simpler days of computing – a reminder of where we&apos;ve been and how far we&apos;ve come..
                </p>
                <p className={myStyles.title}>Let the exploration continue!</p>
                <div className={styles.divider}></div>
                <p className={myStyles.text}>
                    Start Here: Click on the Start Menu to explore the array of &quot;programs&quot; and unveil the magic within each window.
                </p>
                <p className={myStyles.text}>
                    Click & Explore: Open windows, interact with icons, and discover hidden gems. Each element has a story waiting to unfold. (Tip: CTRL to move multiple icons)
                </p>
                <p className={myStyles.text}>
                    Ctrl + Alt + Experience: Immerse yourself in the user-friendly chaos. The more you explore, the more you&apos;ll uncover.
                </p>
            </div>
        </div>

    </Window>

}

export default WelcomeWindow