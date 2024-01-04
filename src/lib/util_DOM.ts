

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


export const isMouseEvent = (event: React.MouseEvent<HTMLLIElement> | React.TouchEvent<HTMLLIElement>): event is React.MouseEvent<HTMLLIElement> => {
    return 'clientX' in event;
}
export const getClientCoordinates = (event: MouseEvent | TouchEvent) => {
    let clientX: number, clientY: number;
    if ('clientX' in event) {
        clientX = event.clientX;
        clientY = event.clientY;
    } else {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    }

    return { clientX, clientY };
}