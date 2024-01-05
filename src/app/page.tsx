// import styles from './page.module.css'
import type { Metadata } from 'next'

// import Windows from '@/components/Windows/Base'
// import Windows from '../components/Windows'
import PCEmulator from '@/components/OSEmulator/PC'

export const metadata:Metadata = {
    title: "Anthon's OS Simulation",
    description: "Embark on a nostalgic digital journey through the different versions of Windows and possibly other operating systems. Explore the interactive Windows 98-inspired desktop and embrace the stories woven into every part of the site. Discover easter eggs and enjoy the nostalgia!",
    authors: [{ name: 'Anthon', url: 'https://AnthonMS.dk' }],
    creator: 'Anthon Mølgaard Steiness',
    icons: [
        '/Assets/Images/Icons/windows98.png'
    ]
}

export default function Home() {
    return <>
        <PCEmulator />
    </>

}
