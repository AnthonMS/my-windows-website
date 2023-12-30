import { create, StoreApi } from 'zustand'
import { createRoot } from 'react-dom/client'
import { MutableRefObject } from 'react'

interface WindowStore {
    windows: HTMLDivElement[]
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

// TODO: Create a closeWindow function that takes in the title:string that is used in attribute "data-title" for the div element
export const useWindowStore = create<WindowStore>((set: StoreApi<WindowStore>['setState'], get: StoreApi<WindowStore>['getState']) => ({
    windows: [],
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
        rootPortal.render(window) // root.unmount() to remove from DOM

        // wait for render to see if window we want to create is already created.
        setTimeout(function waitForRender() {
            const windowDiv = portalContainer.firstChild as HTMLDivElement
            if (windowDiv === null) {
                // retry after short delay
                setTimeout(waitForRender, 10)
                return
            }

            let windowOpen: Boolean = false
            currentWindows.forEach((win: Element) => {
                if (win.getAttribute('data-title') === windowDiv.getAttribute('data-title')) {
                    windowOpen = true
                    get().showWindow(win.getAttribute('data-title') as string)
                }
            })
            set({ windows: [...currentWindows] })

            if (!windowOpen) {
                windowDiv.classList.add(currentStyles.active)
                const currentWindowsContainer = get().windowsContainer
                if (currentWindowsContainer) {
                    currentWindowsContainer.current.appendChild(portalContainer)
                }
                set((state) => ({ windows: [...state.windows, windowDiv] }))
                get().addClass(windowDiv.getAttribute('data-title') as string, currentStyles.active)
            }
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
                // Remove the window from the list
                const updatedWindows = currentWindows.filter((win: HTMLDivElement) => win !== windowToUpdate)
                set({ windows: updatedWindows })

                // Remove the window from the DOM
                const parent = windowToUpdate.parentElement
                if (parent && parent.classList.contains('window')) {
                    parent.remove()
                } else {
                    windowToUpdate.remove()
                }
            }
            else if (attempts < maxAttempts) {
                console.warn('Retry removeClass:', windowTitle)
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

                set({ windows: [...currentWindows] })
            }
            else if (attempts < maxAttempts) {
                console.warn('Retry removeClass:', windowTitle)
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

                set({ windows: [...currentWindows] })
            }
            else if (attempts < maxAttempts) {
                console.warn('Retry removeClass:', windowTitle)
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

                set({ windows: [...currentWindows] })
            }
            else if (attempts < maxAttempts) {
                console.warn('Retry removeClass:', windowTitle)
                setTimeout(() => tryToUpdate(attempts + 1), retryInterval)
            }
            else {
                console.error(`Window with title ${windowTitle} not found after ${maxAttempts} attempts`)
            }
        }
        tryToUpdate(0)
    },
    addClass: (windowTitle, classes) => {
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

                set({ windows: [...currentWindows] })
            }
            else if (attempts < maxAttempts) {
                console.warn('Retry addClass:', windowTitle)
                setTimeout(() => tryToUpdate(attempts + 1), retryInterval)
            }
            else {
                console.error(`Window with title ${windowTitle} not found after ${maxAttempts} attempts`)
            }
        }
        tryToUpdate(0)
    },
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

                set({ windows: [...currentWindows] })
            }
            else if (attempts < maxAttempts) {
                // console.warn('Retry updateWindowStyle:', windowTitle)
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