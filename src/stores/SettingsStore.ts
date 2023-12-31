import { create, StoreApi } from 'zustand'
import { createRoot } from 'react-dom/client'
import { MutableRefObject } from 'react'

// TODO: Update store to be named SettingsStore.

interface SettingsStore {
    windows: HTMLDivElement[]
    setWindows: (newWindows: HTMLDivElement[]) => void
    windowsContainer: MutableRefObject<HTMLDivElement> | null
    setWindowsContainer: (container: MutableRefObject<HTMLDivElement>) => void
    styles: any; // This is the new styles property
    setStyles: (newStyles: any) => void
    openWindow: (
        window: JSX.Element
    ) => void
    closeWindow: (
        windowTitle: string
    ) => void
    hideWindow: (
        windowTitle: string
    ) => void
    showWindow: (
        windowTitle: string
    ) => void
    removeClass: (
        windowTitle: string,
        classes: string | string[]
    ) => void
    addClass: (
        windowTitle: string,
        classes: string | string[]
    ) => void
    updateWindowStyle: (
        windowTitle: string,
        newStyles: any
    ) => void
}

export const useSettingsStore = create<SettingsStore>((set: StoreApi<SettingsStore>['setState'], get: StoreApi<SettingsStore>['getState']) => ({
    windows: [],
    setWindows: (newWindows) => { set({ windows: newWindows }) },
    windowsContainer: null,
    setWindowsContainer: (container) => { set({ windowsContainer: container }) },
    styles: {},
    setStyles: (newStyles) => set({ styles: newStyles }),
    openWindow: (window) => {
        const currentStyles = get().styles
        const currentWindows = get().windows

        const portalContainer = document.createElement('div')
        portalContainer.classList.add('window')
        const rootPortal = createRoot(portalContainer)
        rootPortal.render(window)

        // wait for render to see if window we want to create is already created.
        setTimeout(function waitForRender() {
            const windowDiv = portalContainer.firstChild as HTMLDivElement
            if (windowDiv === null) {
                // retry after short delay
                setTimeout(waitForRender, 10)
                return
            }

            let highestZIndex = 10
            currentWindows.forEach((win: HTMLDivElement) => {
                const zIndex = parseInt(win.style.zIndex || '0');
                if (zIndex > highestZIndex) {
                    highestZIndex = zIndex
                }
            })
            highestZIndex++
            windowDiv.style.zIndex = `${highestZIndex}`
            windowDiv.classList.add(currentStyles.active)

            let zIndex = 10
            let sortedWindows = [...currentWindows, windowDiv].slice().sort((a: HTMLDivElement, b: HTMLDivElement) => {
                const zIndexA = parseInt(a.style.zIndex || '0')
                const zIndexB = parseInt(b.style.zIndex || '0')
                return zIndexA - zIndexB
            })
            let updatedWindows = [...currentWindows, windowDiv].map((win: HTMLDivElement) => {
                const sortedIndex = sortedWindows.indexOf(win)
                zIndex = sortedIndex + 10
                win.style.zIndex = `${zIndex}`
                return win
            })

            const currentWindowsContainer = get().windowsContainer
            if (currentWindowsContainer) {
                currentWindowsContainer.current.appendChild(portalContainer)
            }
            get().setWindows(updatedWindows)
        }, 10)
    },
    closeWindow: (windowTitle) => {
        const maxAttempts = 20
        const retryInterval = 100

        const tryToUpdate = (attempts: number) => {
            const currentStyles = get().styles
            const currentWindows = get().windows
            const windowToUpdate = currentWindows.find((win) => win.getAttribute('data-title') === windowTitle)

            if (windowToUpdate) {
                const updatedWindows = currentWindows.filter((win: HTMLDivElement) => win !== windowToUpdate)
                get().setWindows(updatedWindows)

                // Remove the window from the DOM
                const parent = windowToUpdate.parentElement
                if (parent && parent.classList.contains('window')) {
                    parent.remove()
                } else {
                    windowToUpdate.remove()
                }
            }
            else if (attempts < maxAttempts) {
                if (attempts > 5) {
                    console.warn('Retry closeWindow:', windowTitle)
                }
                setTimeout(() => tryToUpdate(attempts + 1), retryInterval)
            }
            else {
                console.error(`Window with title ${windowTitle} not found after ${maxAttempts} attempts`)
            }
        }
        tryToUpdate(0)
    },
    hideWindow: (windowTitle) => {
        const maxAttempts = 20
        const retryInterval = 100

        const tryToUpdate = (attempts: number) => {
            const currentStyles = get().styles
            const currentWindows = get().windows
            const windowToUpdate = currentWindows.find((win) => win.getAttribute('data-title') === windowTitle)

            if (windowToUpdate) {
                if (!windowToUpdate.classList.contains(currentStyles.hidden)) {
                    windowToUpdate.classList.add(currentStyles.hidden)
                }
                if (windowToUpdate.classList.contains(currentStyles.active)) {
                    windowToUpdate.classList.remove(currentStyles.active)
                }

                windowToUpdate.style.zIndex = ''

                // set({ windows: [...currentWindows] })
                get().setWindows([...currentWindows])
            }
            else if (attempts < maxAttempts) {
                if (attempts > 5) {
                    console.warn('Retry hideWindow:', windowTitle)
                }
                setTimeout(() => tryToUpdate(attempts + 1), retryInterval)
            }
            else {
                console.error(`Window with title ${windowTitle} not found after ${maxAttempts} attempts`)
            }
        }
        tryToUpdate(0)
    },
    showWindow: (windowTitle) => {
        const maxAttempts = 20
        const retryInterval = 100

        const tryToUpdate = (attempts: number) => {
            const currentStyles = get().styles
            const currentWindows = get().windows
            const windowToUpdate = currentWindows.find((win) => win.getAttribute('data-title') === windowTitle)

            if (windowToUpdate) {
                if (windowToUpdate.classList.contains(currentStyles.hidden)) {
                    windowToUpdate.classList.remove(currentStyles.hidden)
                }
                if (!windowToUpdate.classList.contains(currentStyles.active)) {
                    windowToUpdate.classList.add(currentStyles.active)
                }

                let highestZIndex = 10
                currentWindows.forEach((win: HTMLDivElement) => {
                    const zIndex = parseInt(win.style.zIndex || '0');
                    if (zIndex > highestZIndex) {
                        highestZIndex = zIndex
                    }
                })
                windowToUpdate.style.zIndex = `${highestZIndex + 1}`

                // set({ windows: [...currentWindows] })
                get().setWindows([...currentWindows])
            }
            else if (attempts < maxAttempts) {
                if (attempts > 5) {
                    console.warn('Retry showWindow:', windowTitle)
                }
                setTimeout(() => tryToUpdate(attempts + 1), retryInterval)
            }
            else {
                console.error(`Window with title ${windowTitle} not found after ${maxAttempts} attempts`)
            }
        }
        tryToUpdate(0)
    },
    removeClass: (windowTitle, classes) => {
        const maxAttempts = 20
        const retryInterval = 100

        const tryToUpdate = (attempts: number) => {
            const currentWindows = get().windows
            const windowToUpdate = currentWindows.find((win) => win.getAttribute('data-title') === windowTitle)

            if (windowToUpdate) {
                if (typeof classes === 'string') {
                    classes = [classes] // convert to array for consistency
                }

                classes.forEach((cls) => {
                    if (windowToUpdate.classList.contains(cls)) {
                        windowToUpdate.classList.remove(cls)
                    }
                })

                // set({ windows: [...currentWindows] })
                get().setWindows([...currentWindows])
            }
            else if (attempts < maxAttempts) {
                if (attempts > 5) {
                    console.warn('Retry removeClass:', windowTitle)
                }
                setTimeout(() => tryToUpdate(attempts + 1), retryInterval)
            }
            else {
                console.error(`Window with title ${windowTitle} not found after ${maxAttempts} attempts`)
            }
        }
        tryToUpdate(0)
    },
    addClass: (windowTitle, classes) => {
        if (!classes) {
            console.warn('addClass called with undefined classes.', windowTitle)
            return
        }
        const maxAttempts = 20
        const retryInterval = 100

        const tryToUpdate = (attempts: number) => {
            const currentWindows = get().windows
            const windowToUpdate = currentWindows.find((win) => win.getAttribute('data-title') === windowTitle)

            if (windowToUpdate) {
                if (typeof classes === 'string') {
                    classes = [classes] // convert to array for consistency
                }

                classes.forEach((cls) => {
                    if (!windowToUpdate.classList.contains(cls)) {
                        windowToUpdate.classList.add(cls)
                    }
                })

                // set({ windows: [...currentWindows] })
                get().setWindows([...currentWindows])
            }
            else if (attempts < maxAttempts) {
                if (attempts > 5) {
                    console.warn('Retry addClass:', windowTitle)
                }
                setTimeout(() => tryToUpdate(attempts + 1), retryInterval)
            }
            else {
                console.error(`Window with title ${windowTitle} not found after ${maxAttempts} attempts`)
            }
        }
        tryToUpdate(0)
    },
    // TODO: Create function to setWindowStyle instead of just updating it, it should overwrite the whole style object of the window
    updateWindowStyle: (windowTitle, newStyles) => {
        const maxAttempts = 20
        const retryInterval = 100

        const tryToUpdate = (attempts: number) => {
            const currentWindows = get().windows
            const windowToUpdate = currentWindows.find((win) => win.getAttribute('data-title') === windowTitle)


            if (windowToUpdate) {
                // Iterate over the properties in newStyles and update each property
                for (const property in newStyles) {
                    windowToUpdate.style.setProperty(property, newStyles[property])
                }

                // set({ windows: [...currentWindows] })
                get().setWindows([...currentWindows])
            }
            else if (attempts < maxAttempts) {
                // console.warn('Retry updateWindowStyle:', windowTitle)
                if (attempts > 5) {
                    console.warn('Retry updateWindowStyle:', windowTitle)
                }
                setTimeout(() => tryToUpdate(attempts + 1), retryInterval)
            }
            else {
                console.error(`Window with title ${windowTitle} not found after ${maxAttempts} attempts`)
            }
        }
        // Start the update attempt
        tryToUpdate(0)
    }
}))