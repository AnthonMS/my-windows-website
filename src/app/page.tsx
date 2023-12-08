// import styles from './page.module.css'
import type { Metadata } from 'next'

// import Windows from '@/components/Windows/Base'
import Windows from '../components/Windows/Base'

export const metadata:Metadata = {
    title: "Anthon's Windows98",
    description: "Embark on a nostalgic digital journey. Explore the interactive Windows 98-inspired desktop and embrace the stories woven into every part of the site. Discover easter eggs and enjoy the nostalgia!",
    authors: [{ name: 'Anthon', url: 'https://AnthonMS.dk' }],
    creator: 'Anthon Mølgaard Steiness',
    icons: [
        '/assets/images/icons/windows98.png'
    ]
}

export default function Home() {
    return <>
        <Windows />
    </>

}
