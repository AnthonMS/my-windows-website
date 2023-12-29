import { create, StoreApi } from 'zustand'
import { createRoot } from 'react-dom/client'
import { MutableRefObject } from 'react'

interface WindowStore {
    windows: HTMLDivElement[]
    windowsContainer: MutableRefObject<HTMLDivElement> | null
    setWindowsContainer: (container: MutableRefObject<HTMLDivElement>) => void
    styles: any; // This is the new styles property
    setStyles: (newStyles: any) => void;
    openWindow: (
        window: JSX.Element
    ) => void
}


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
        portalContainer.classList.add(currentStyles.windowParent)
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
}))