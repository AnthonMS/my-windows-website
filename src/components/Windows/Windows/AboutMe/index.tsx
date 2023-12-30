import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/Windows/Window'

import userCardIcon from '@/assets/images/icons/user_card.png'

export interface AboutMeWindowProps {
}
const AboutMeWindow = (props: AboutMeWindowProps) => {
    const {  } = props

    return <Window
        width={window.innerWidth - 25} height={window.innerHeight - 30 - 25}
        title='About Me' icon={userCardIcon}>

        <div className={styles.aboutMeContainer}>
            <p className={styles.mainTitle}>
                <span className={styles.small}>Meet</span> Anthon Mølgaard Steiness
            </p>

            <div className={`${globalStyles.border} ${styles.content}`}>
                <p className={styles.title}>Greetings, fellow explorer of the digital realm!</p>
                <p className={styles.text}>
                    I&apos;m Anthon, a craftsman of both the physical and virtual world, currently residing in the charming town of Næstved with my wonderful wife.
                </p>
                <p className={styles.text}>
                    Born on August 27, 1995, I share this journey with my three siblings—two wise elder brothers and a delightful little sister. Beyond the confines of the digital landscape, I find solace in transforming our home into a haven. Whether it&apos;s meticulously working on our house or tending to the garden, my mission is to add a touch of beauty and functionality to our space.
                </p>
                <p className={styles.text}>
                    Family holds the compass to my heart, and my most cherished moments are spent in their company. When I&apos;m not immersed in the art of renovation or family affairs, you&apos;ll likely find me in my digital sanctuary — the computer. Here, my passion unfolds as I delve into the ever-evolving realm of technology, absorbing the latest breakthroughs and staying at the forefront of innovation.
                </p>
                <p className={styles.text}>
                    My fascination extends to crafting a smart home that dances to the rhythm of Home Assistant. I&apos;ve woven the fabric of my own Internet of Things universe, tinkering with the software to orchestrate a seamless symphony of interconnected devices. This passion isn&apos;t confined to the virtual space alone — I find joy in the realm of game development, crafting virtual worlds and interactive experiences.
                </p>
                <p className={styles.text}>
                    Now, let me share a bit more about the lens through which I view the world. I navigate the intricacies of life with the lens of Asperger&apos;s, a unique perspective that shapes my interactions. While social nuances might be a puzzle, I relish the occasional foray into the world beyond, always mindful of the need for rejuvenation afterward.
                </p>
                <p className={styles.text}>
                    In essence, my life is a tapestry of home improvement, familial bonds, digital odysseys, and the thrilling realm of game development. Welcome to my world, where every pixel tells a story, and every line of code weaves a narrative. Join me on this journey of creation and connection!
                </p>
                <div className={globalStyles.divider}></div>
                <div className={globalStyles.divider}></div>
                <div className={globalStyles.divider}></div>
                <p className={styles.text}>
                    Sincerely,
                </p>
                <p className={styles.name}>
                    Anthon Mølgaard Steiness
                </p>
            </div>
        </div>

    </Window>

}

export default AboutMeWindow