import React, { useEffect, useRef, useState } from 'react'

interface TimeProps {
    hours?: Boolean
    minutes?: Boolean
    seconds?: Boolean
}
const Time = React.forwardRef((props: TimeProps, ref: React.ForwardedRef<unknown>) => {
    const { hours = true, minutes = true, seconds = false } = props
    const initialMount = useRef<Boolean>(true)
    const [hour, setHour] = useState<number>(0)
    const [minute, setMinute] = useState<number>(0)
    const [second, setSecond] = useState<number>(0)
    const [lastUpdate, setLastUpdate] = useState<number>(0)

    useEffect(() => {
        if (initialMount.current) {
            initialMount.current = false

            const now = new Date()
            const h: number = now.getHours()
            const m: number = now.getMinutes()
            const s: number = now.getSeconds()
            setHour(h)
            setMinute(m)
            setSecond(s)
        }


        const onFocus = () => {
            const now = new Date()
            const h: number = now.getHours()
            const m: number = now.getMinutes()
            const s: number = now.getSeconds()
            setHour(h)
            setMinute(m)
            setSecond(s)
        }
        // const onBlur = () => {}

        window.addEventListener('focus', onFocus)
        // window.addEventListener('blur', onBlur)
        return () => {
            window.removeEventListener('focus', onFocus)
            // window.removeEventListener('blur', onBlur)
        }
    }, [])

    useEffect(() => {
        let animationFrameId: number

        const update = () => {
            const now = new Date()
            const currentTime = now.getTime()
            let updateInterval:number = 900
            if (seconds)      { updateInterval = 900 } // If seconds is true, update every 950ms
            else if (minutes) { updateInterval = (1000*60)-100 } // Else if minutes is true, update every (1000*60)-50
            else if (hours)   { updateInterval = ((1000*60)*60)-100 } // Else if hours is true, we want to update every ((1000*60)*60)-50
            // Check if enough time has passed since the last update
            if (currentTime - lastUpdate > updateInterval) {
                const h: number = now.getHours()
                const m: number = now.getMinutes()
                const s: number = now.getSeconds()

                if (h !== hour) {
                    setHour(h)
                }
                if (m !== minute) {
                    setMinute(m)
                }
                if (s !== second) {
                    setSecond(s)
                }

                setLastUpdate(currentTime)
            }
            animationFrameId = requestAnimationFrame(update)
        }

        if (hours || minutes || seconds) {
            update()
        }

        return () => {
            cancelAnimationFrame(animationFrameId)
        }
    }, [hour, minute, second, hours, minutes, seconds])

    return <>
        {hours ? hour.toString().padStart(2, '0') : ''}{minutes ? ':' + minute.toString().padStart(2, '0') : ''}{seconds ? ':' + second.toString().padStart(2, '0') : ''}
    </>
})

export default Time