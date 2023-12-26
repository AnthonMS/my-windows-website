export function isDirectorySyntax(input: string): boolean | string  {
    // Directory syntax: should either start and end with a slash, or be an empty string, or be a relative path
    const directoryRegex = /^(\/[^\0]+\/|\/|[^\0]+)$/
    // Reserved names in Windows
    const reservedNames = /^(con|prn|aux|nul|com[1-9]|lpt[1-9]|com0|lpt0)$/i
    // Special characters not allowed in Windows
    const illegalCharacters = /[<>:"\\|?*]/

    if (!directoryRegex.test(input)) {
        return false
    }

    // Split the path by "/"
    const pathSegments = input.split("/");

    // Check each segment for illegal characters and reserved names
    const isValid = pathSegments.every(segment => !reservedNames.test(segment) && !illegalCharacters.test(segment))
    if (!isValid) {
        return false
    }
    
    // Check for consecutive slashes
    const hasConsecutiveSlashes = /\/{2,}/.test(input)
    if (hasConsecutiveSlashes) {
        // Remove consecutive slashes
        const cleanedPath = input.replace(/\/{2,}/g, '/')
    
        return cleanedPath
    }

    return true
}