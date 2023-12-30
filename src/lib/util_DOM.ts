

export const isElementInClass = (element: Element | null, classname: string | string[]) => {
    const classArray = Array.isArray(classname) ? classname : [classname]
    let el = element

    while (el !== null) {
        if (classArray.every(className => el!.classList.contains(className))) {
            return true
        }
        el = el.parentElement
    }

    return false
}
export const findParentWithClass = (element: Element | null, classname: string | string[]): Element | null => {
    const classArray = Array.isArray(classname) ? classname : [classname]
    let el = element
    while (el !== null) {
        if (classArray.every(className => el!.classList.contains(className))) {
            return el!
        }
        el = el.parentElement
    }
    return null
}