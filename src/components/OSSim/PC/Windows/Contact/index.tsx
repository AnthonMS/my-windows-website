import { useState } from 'react'

import Window from '@/components/OSSim/PC/Window'

import contactIcon from '@/assets/images/icons/contact_icon.png'
import sendmailIcon from '@/assets/images/icons/sendmail_icon.png'

import Popup from '../Popup'
import Button from '../../UI/Button'

import { useSettingsStore } from '@/stores/SettingsStore'

import axios from 'axios'

import { isMobile, isTouch } from '@/lib/utils'

export interface ContactWindowProps {
}
const ContactWindow = (props: ContactWindowProps) => {
    const { } = props
    const { openWindow, styles } = useSettingsStore()

    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [subject, setSubject] = useState<string>('')
    const [content, setContent] = useState<string>('')

    // console.log('ContactMe isMobile:', isMobile())
    // console.log('ContactMe isTouch:', isTouch())

    const click = async (event: React.MouseEvent<HTMLDivElement>) => {
        if (name === '') {
            openWindow(<Popup error={true} title='Name missing'>Your name is required.</Popup>)
            return
        }
        if (email === '') {
            openWindow(<Popup error={true} title='Email missing'>Your email is required.</Popup>)
            return
        }
        if (phone === '') {
            openWindow(<Popup error={true} title='Phone missing'>Your phone is required.</Popup>)
            return
        }
        if (subject === '') {
            openWindow(<Popup error={true} title='Subject missing'>Subject is required.</Popup>)
            return
        }
        if (content === '') {
            openWindow(<Popup error={true} title='Content missing'>Content is required.</Popup>)
            return
        }

        const res = await axios.post('/api/sendEmail', {
            nameFrom: name,
            emailFrom: email,
            phoneFrom: phone,
            subject: subject,
            content: content
        })
        const data = await res.data
        if (res.status === 200) {
            openWindow(<Popup title='Message sent!'>Message was succesfully sent!</Popup>)
        }
        else {
            openWindow(<Popup error={true} title='Failed sending message...'>There was an error when trying to send your message.</Popup>)
            console.error(data)
        }
    }

    // TODO: Create logic to see if mobile or not and set width/height based on that.
    if (!styles.window) return <></>
    return <Window title='Contact' icon={contactIcon} fullscreen={isTouch() || isMobile()}
        width={Math.min(window.innerWidth - 25, 600)} height={Math.min(window.innerHeight - 25, 820)}>

        <div className={styles.contactContainer}>
            <p className={styles.mainTitle}>
                <span className={styles.small}>Contact</span> Anthon Mølgaard Steiness
            </p>

            <div className={`${styles.border} ${styles.content}`}>
                <div className={styles.centerDiv}>
                    <p className={styles.label}>Your name:</p>
                    <input type='text' className={`${styles.inverseBoxShadow} ${styles.input} ${styles.input}`} onChange={e => setName(e.target.value)} />
                    <p className={styles.label}>Your e-mail:</p>
                    <input type='email' className={`${styles.inverseBoxShadow} ${styles.input} ${styles.input}`} onChange={e => setEmail(e.target.value)} />
                    <p className={styles.label}>Your phone number:</p>
                    <input type='tel' className={`${styles.inverseBoxShadow} ${styles.input} ${styles.input}`} onChange={e => setPhone(e.target.value)} />

                    <p className={styles.label}>Subject:</p>
                    <input type='text' className={`${styles.inverseBoxShadow} ${styles.input} ${styles.input}`} onChange={e => setSubject(e.target.value)} />
                    <p className={styles.label}>What&apos;s it all about?</p>
                    <textarea className={`${styles.inverseBoxShadow} ${styles.textarea} ${styles.textarea}`} onChange={e => setContent(e.target.value)} />

                    <div className={styles.divider} />
                    <Button className={styles.button} icon={sendmailIcon} text='Send!' onClick={click} />
                    <div className={styles.divider} />
                </div>
                <div className={styles.divider}></div>
            </div>
        </div>

    </Window>
}

export default ContactWindow