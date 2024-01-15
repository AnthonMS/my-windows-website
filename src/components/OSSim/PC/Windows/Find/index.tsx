import React, { useRef, useState } from 'react'
import Window, { useWindowRef } from '../../Window'

import _search from '@/assets/images/Windows98/search-file.png'
import { useSettingsStore } from '@/stores/SettingsStore'

interface FindProps {
    text: string
 }
const Find = React.forwardRef<unknown, FindProps>((props: FindProps, ref: React.ForwardedRef<unknown>) => {
    // const Find = () => {
    const { styles } = useSettingsStore()
    const windowRef = useWindowRef()
    const [direction, setDirection] = useState<'down' | 'up'>('down')
    const [findText, setFindText] = useState<string>('')
    const [foundItems, setFoundItems] = useState<string[]>([])
    const [currentFoundIndex, setCurrentFoundIndex] = useState<number>(-1)

    const find = () => {
        const regex = new RegExp(findText, 'gi');
        const matches = props.text.match(regex);
        setFoundItems(matches || []);
        setCurrentFoundIndex(0);
    }

    const findNext = () => {
        // setCurrentFoundIndex(prevIndex => (prevIndex + 1) % foundItems.length);
        setCurrentFoundIndex(prevIndex => {
            if (direction === 'down') {
                return (prevIndex + 1) % foundItems.length;
            } else { // direction === 'up'
                return (prevIndex - 1 + foundItems.length) % foundItems.length;
            }
        });
    }


    React.useImperativeHandle(ref, () => ({
        window: windowRef.current,
        currentFoundIndex,
        foundItems
    }))
    return <Window ref={windowRef}
        width={300} height={150}
        title={'Find...'} icon={_search} helpBtn={true} maximizeBtn={false} hideBtn={false}>

        <div className={styles.findContainer}>

            <input type="text" value={findText} onChange={e => setFindText(e.target.value)} />
            <button onClick={find}>Find</button>
            <button onClick={findNext}>Find Next</button>
            <div>
                <input type="radio" id="up" name="direction" value="up" checked={direction === 'up'} onChange={() => setDirection('up')} />
                <label htmlFor="up">Up</label>
                <input type="radio" id="down" name="direction" value="down" checked={direction === 'down'} onChange={() => setDirection('down')} />
                <label htmlFor="down">Down</label>
            </div>

        </div>

    </Window>
})

Find.displayName = 'Find'
export function useFindRef() {
    return useRef<{
        window: ReturnType<typeof useWindowRef>['current'],
        currentFoundIndex: number,
        foundItems: string[]
    } | null>(null)
}
export default Find