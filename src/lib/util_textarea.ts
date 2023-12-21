export const getNumberOfLinesInTextArea = (textarea: HTMLTextAreaElement) => {
    const textareaStyles:CSSStyleDeclaration = window.getComputedStyle(textarea)
    const font:string = `${textareaStyles.fontSize} ${textareaStyles.fontFamily}`
    const canvas:HTMLCanvasElement = document.createElement('canvas')
    const context:CanvasRenderingContext2D|null = canvas.getContext('2d')
    context!.font = font

    const text: string = textarea.value
    let lineCount:number = 0
    let currentLine:string = ''
    if (textareaStyles.wordBreak === 'break-word') {
        const words:string[] = text.split(' ')
        for (let i = 0; i < words.length; i++) {
            const wordWidth:number = context!.measureText(words[i] + ' ').width
            const lineWidth:number = context!.measureText(currentLine).width
            if (lineWidth + wordWidth > getTextAreaWidth(textarea)) {
                lineCount++
                currentLine = words[i] + ' '
            } else {
                currentLine += words[i] + ' '
            }
        }
    }
    else {
        const characters:string[] = text.split('')
        for (let i = 0; i < characters.length; i++) {
            const characterWidth:number = context!.measureText(characters[i]).width;
            const lineWidth:number = context!.measureText(currentLine).width;

            if (lineWidth + characterWidth > getTextAreaWidth(textarea)) {
                lineCount++;
                currentLine = characters[i]
            } else {
                currentLine += characters[i]
            }
        }
    }

    return lineCount
}

export const getTextAreaWidth = (textarea: HTMLTextAreaElement) => {
    const parseValue = (v: any) => v.endsWith('px')
        ? parseInt(v.slice(0, -2), 10)
        : 0;

    const textareaStyles = window.getComputedStyle(textarea);
    const paddingLeft = parseValue(textareaStyles.paddingLeft);
    const paddingRight = parseValue(textareaStyles.paddingRight);
    const textareaWidth = textarea.getBoundingClientRect().width
        - paddingLeft
        - paddingRight;

    return textareaWidth
}