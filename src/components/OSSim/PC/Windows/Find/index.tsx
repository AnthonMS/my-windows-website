import React, { useEffect, useRef, useState } from 'react'
import Window, { useWindowRef } from '../../Window'
import Image from 'next/image'

import _search from '@/assets/images/Windows98/search-file.png'
import _checkmark from '@/assets/images/Windows98/checkmark_small.png'
import _warning from '@/assets/images/Windows98/warning.png'
import _info from '@/assets/images/Windows98/info.png'

import { useSettingsStore } from '@/stores/SettingsStore'
import Button from '../../UI/Button'
import Popup from '../Popup'

interface FoundItem {
    value: string
    startPosition: number
    endPosition: number
    line?: number
}
interface FindProps {
    text: string
    findNext: () => void
}
const Find = React.forwardRef<unknown, FindProps>((props: FindProps, ref: React.ForwardedRef<unknown>) => {
    const { styles, openWindow } = useSettingsStore()
    const windowRef = useWindowRef()
    const [direction, setDirection] = useState<'down' | 'up'>('down')
    const [findText, setFindText] = useState<string>('')
    const [foundItems, setFoundItems] = useState<FoundItem[]>([])
    const [currentFoundIndex, setCurrentFoundIndex] = useState<number>(-1)
    const [matchCase, setMatchCase] = useState(false)

    const find = () => {
        if (findText === '') return
        const regex = new RegExp(findText, matchCase ? 'g' : 'gi') // g = global, i = case insensitive
        let match
        const matches: FoundItem[] = []

        while ((match = regex.exec(props.text)) !== null) {
            const lineNumber = (props.text.substring(0, match.index).match(/\n/g) || []).length
            matches.push({
                value: match[0],
                startPosition: match.index,
                endPosition: match.index + match[0].length,
                line: lineNumber
            })
        }

        setFoundItems(matches)
        setCurrentFoundIndex(0)
        if (matches.length <= 0) {
            openWindow(notfoundPopup)
        }
        else {
            setTimeout(() => {
                props.findNext()
            }, 100)
        }
    }

    const findNext = () => {
        if (findText === '') return
        setCurrentFoundIndex(prevIndex => {
            if (direction === 'down') {
                return (prevIndex + 1) % foundItems.length;
            } else { // direction === 'up'
                return (prevIndex - 1 + foundItems.length) % foundItems.length;
            }
        })
        setTimeout(() => {
            props.findNext()
        }, 100);
    }

    const cancel = () => {
        windowRef.current!.close()
    }

    const toggleMatchCase = () => {
        setMatchCase(prev => !prev)
        setFoundItems([])
        setCurrentFoundIndex(-1)
    }



    const notfoundPopup = <>
        <Popup info={true} title='Find Error'>
            <div className={styles.notfoundWarning}>
                <Image className={styles.img} src={_info} width={32} height={32} alt='warning' />
                <p className={styles.text} >
                    Cannot find "{findText}"
                </p>
            </div>
        </Popup>
    </>
    React.useImperativeHandle(ref, () => ({
        currentFoundIndex,
        foundItems
    }))
    return <Window ref={windowRef}
        width={300} height={150}
        title={'Find'} icon={_search} helpBtn={true} maximizeBtn={false} hideBtn={false}>

        <div className={styles.findContainer}>
            <div className={styles.left}>
                <div className={styles.inputContainer}>
                    <label className={styles.label}>Find what: </label>
                    <input className={styles.input} type="text" value={findText} onChange={e => setFindText(e.target.value)} />
                </div>

                <div className={styles.configContainer}>
                    <div className={styles.left}>
                        <div className={styles.configColumn}>
                            <div className={styles.checkboxContainer}>
                                <input className={styles.checkbox} type="checkbox" id="case" name="case" value="shit" checked={matchCase} onChange={toggleMatchCase} />
                                <label className={styles.label} htmlFor="case">Match case</label>
                            </div>
                        </div>
                    </div>

                    <div className={styles.right}>
                        <div className={styles.radioContainer}>
                            <label className={styles.containerLabel}>Direction</label>
                            <input className={styles.radio} type="radio" id="up" name="direction" value="up" checked={direction === 'up'} onChange={() => setDirection('up')} />
                            <label className={styles.radioLabel} htmlFor="up">Up</label>
                            <input className={styles.radio} type="radio" id="down" name="direction" value="down" checked={direction === 'down'} onChange={() => setDirection('down')} />
                            <label className={styles.radioLabel} htmlFor="down">Down</label>
                        </div>

                    </div>
                </div>

            </div>

            <div className={styles.right}>
                <Button className={styles.button} text='Find' onClick={e => { foundItems.length <= 0 ? find() : findNext() }}></Button>
                <Button className={styles.button} text='Cancel' onClick={cancel}></Button>
            </div>

        </div>

    </Window>
})

Find.displayName = 'Find'
export function useFindRef() {
    return useRef<{
        currentFoundIndex: number,
        foundItems: FoundItem[]
    } | null>(null)
}
export default Find