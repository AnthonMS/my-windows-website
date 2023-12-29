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
        window: string
    ) => void
    hideWindow: (
        window: string
    ) => void
    showWindow: (
        window: string
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
                    win.classList.remove(currentStyles.hidden)
                    if (!win.classList.contains(currentStyles.active)) win.classList.add(currentStyles.active)
                } else {
                    if (win.classList.contains(currentStyles.active)) win.classList.remove(currentStyles.active)
                }
            })

            if (!windowOpen) {
                windowDiv.classList.add(currentStyles.active)
                const currentWindowsContainer = get().windowsContainer
                if (currentWindowsContainer) {
                    currentWindowsContainer.current.appendChild(portalContainer)
                }
                set((state) => ({ windows: [...state.windows, windowDiv] }))
            }
        }, 10)
    },
    closeWindow: (dataTitle) => {
        const currentStyles = get().styles
        const currentWindows = get().windows

        const windowToClose = currentWindows.find((win: HTMLDivElement) => win.getAttribute('data-title') === dataTitle)
        
        if (windowToClose) {
            // Remove the window from the list
            const updatedWindows = currentWindows.filter((win: HTMLDivElement) => win !== windowToClose);
            set({ windows: updatedWindows });

            // Remove the window from the DOM
            const parent = windowToClose.parentElement;
            if (parent && parent.classList.contains('window')) {
                parent.remove();
            } else {
                windowToClose.remove();
            }
        }
    },
    hideWindow: (dataTitle) => {
        const currentStyles = get().styles
        const currentWindows = get().windows

        const windowToHide = currentWindows.find((win: HTMLDivElement) => win.getAttribute('data-title') === dataTitle)
        
        if (windowToHide && !windowToHide.classList.contains(currentStyles.hidden)) {
            const index = currentWindows.indexOf(windowToHide)
            windowToHide.classList.remove(currentStyles.active)
            windowToHide.classList.add(currentStyles.hidden)
            
            // Replace the window in the array with the updated class
            const updatedWindows = [...currentWindows]
            updatedWindows[index] = windowToHide
            set({ windows: updatedWindows })
        }
    },
    showWindow: (dataTitle) => {
        const currentStyles = get().styles
        const currentWindows = get().windows

        const windowToshow = currentWindows.find((win: HTMLDivElement) => win.getAttribute('data-title') === dataTitle)
        
        if (windowToshow && windowToshow.classList.contains(currentStyles.hidden)) {
            const index = currentWindows.indexOf(windowToshow)
            windowToshow.classList.remove(currentStyles.hidden)
            if (!windowToshow.classList.contains(currentStyles.active)) {
                windowToshow.classList.add(currentStyles.active)
            }
            
            // Replace the window in the array with the updated class
            const updatedWindows = [...currentWindows]
            updatedWindows[index] = windowToshow
            set({ windows: updatedWindows })
        }
    }
}))