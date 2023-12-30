import { useState } from 'react'

import globalStyles from './../../styles.module.css'
import styles from './styles.module.css'

import Window from '@/components/Windows/Window'

import contactIcon from '@/assets/images/icons/contact_icon.png'
import sendmailIcon from '@/assets/images/icons/sendmail_icon.png'

import PopupWindow from '../Popup'
import Button from '../../UI/Button'

import { useWindowStore } from '@/stores/windowStore'

import axios from 'axios'

export interface ContactWindowProps {
}
const ContactWindow = (props: ContactWindowProps) => {
    const { } = props
    const { openWindow } = useWindowStore()

    const [name, setName] = useState<string>('')
    const [email, setEmail] = useState<string>('')
    const [phone, setPhone] = useState<string>('')
    const [subject, setSubject] = useState<string>('')
    const [content, setContent] = useState<string>('')

    const click = async (event: React.MouseEvent<HTMLDivElement>) => {
        console.log('SEND EMAIL!')
        if (name === '') {
            openWindow(<PopupWindow error={true} title='Name missing' text='Your name is required.' />)
            return
        }
        if (email === '') {
            openWindow(<PopupWindow error={true} title='Email missing' text='Your email is required.' />)
            return
        }
        if (phone === '') {
            openWindow(<PopupWindow error={true} title='Phone missing' text='Your phone is required.' />)
            return
        }
        if (subject === '') {
            openWindow(<PopupWindow error={true} title='Subject missing' text='Subject is required.' />)
            return
        }
        if (content === '') {
            openWindow(<PopupWindow error={true} title='Content missing' text='Content is required.' />)
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
            openWindow(<PopupWindow title='Message sent!' text='Message was succesfully sent!' />)
        }
        else {
            openWindow(<PopupWindow error={true} title='Failed sending message...' text='There was an error when trying to send your message.' />)
            console.error(data)
        }
    }

    return <Window title='Contact' icon={contactIcon}
        width={window.innerWidth - 25} height={window.innerHeight - 30 - 25}>

        <div className={styles.windowContainer}>
            <p className={styles.mainTitle}>
                <span className={styles.small}>Contact</span> Anthon Mølgaard Steiness
            </p>

            <div className={`${globalStyles.border} ${styles.content}`}>
                <div className={styles.centerDiv}>
                    <p className={styles.label}>Your name:</p>
                    <input type='text' className={`${globalStyles.inverseBoxShadow} ${globalStyles.input} ${styles.input}`} onChange={e => setName(e.target.value)} />
                    <p className={styles.label}>Your e-mail:</p>
                    <input type='email' className={`${globalStyles.inverseBoxShadow} ${globalStyles.input} ${styles.input}`} onChange={e => setEmail(e.target.value)} />
                    <p className={styles.label}>Your phone number:</p>
                    <input type='tel' className={`${globalStyles.inverseBoxShadow} ${globalStyles.input} ${styles.input}`} onChange={e => setPhone(e.target.value)} />

                    <p className={styles.label}>Subject:</p>
                    <input type='text' className={`${globalStyles.inverseBoxShadow} ${globalStyles.input} ${styles.input}`} onChange={e => setSubject(e.target.value)} />
                    <p className={styles.label}>What&apos;s it all about?</p>
                    <textarea className={`${globalStyles.inverseBoxShadow} ${globalStyles.textarea} ${styles.textarea}`} onChange={e => setContent(e.target.value)} />

                    <div className={globalStyles.divider} />
                    <Button className={styles.button} icon={sendmailIcon} text='Send!' onClick={click} />
                    <div className={globalStyles.divider} />
                </div>
                <div className={globalStyles.divider}></div>
            </div>
        </div>

    </Window>
}

export default ContactWindow