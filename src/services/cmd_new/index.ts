export interface Command {
    command: string
    usage: string
    help: string
    options: Option[]
    arguments: Argument[]
    error?: boolean | string
}
export interface Option {
    option: string
    usage?: string
    description?: string
    options?: Option[]
    arguments?: Argument[]
    error?: boolean | string
}
export interface Argument {
    name: string
    value: string
    required?: boolean
    description?: string
    error?: boolean | string
}



export function parseCommand(command: string, commandConfig: Command): Command {
    const parts = command.split(' ')
    const commandPart = parts.shift()
    const parsedOptions: Option[] = []
    const commandArgs: Argument[] = []

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]

        if (part.startsWith('-')) {
            const optionName = part
            const optionConfig = findOptionConfig(optionName, commandConfig.options)

            if (optionConfig === undefined) {
                const currentOption: Option = { option: optionName, error: 'UNKNOWN_OPTION' }
                parsedOptions.push(currentOption)
            } else {
                const currentOption: Option = { option: optionName, usage: optionConfig.usage, description: optionConfig.description, options: optionConfig.options, arguments: optionConfig.arguments || [] }
                const remainingOptionArgsConfig = optionConfig.arguments || []
                const remainingOptionArgsValues = parts.slice(i + 1)

                if (optionConfig.options && optionConfig.options.length > 0) {
                    currentOption.options = parseNestedOptions(remainingOptionArgsValues, optionConfig)
                    i += countParsedParts(currentOption.options)
                }

                if (optionConfig.arguments && optionConfig.arguments.length > 0) {
                    currentOption.arguments = parseArguments(remainingOptionArgsValues, optionConfig)
                    i += currentOption.arguments.length
                }

                // Check for missing required arguments for the option
                if (remainingOptionArgsConfig.length > 0 && currentOption.arguments!.length === 0) {
                    for (let j = 0; j < remainingOptionArgsConfig.length; j++) {
                        const argConfig = remainingOptionArgsConfig[j]
                        currentOption.arguments!.push({
                            name: argConfig.name,
                            value: '',
                            required: argConfig.required,
                            description: argConfig.description || '',
                            error: 'MISSING_ARG',
                        })
                    }
                }

                parsedOptions.push(currentOption)
            }
        } 
        else {
            const remainingArgsConfig = commandConfig.arguments || []
            const remainingArgsValues = parts.slice(i)

            for (let j = 0; j < remainingArgsConfig.length; j++) {
                const argConfig = remainingArgsConfig[j]
                const argValue = remainingArgsValues[j] || ''

                if (argConfig.required && !argValue) {
                    commandArgs.push({
                        name: argConfig.name,
                        value: '',
                        required: argConfig.required,
                        description: argConfig.description || '',
                        error: 'MISSING_ARGUMENT',
                    })
                } else {
                    commandArgs.push({
                        name: argConfig.name,
                        value: argValue,
                        required: argConfig.required || false,
                        description: argConfig.description || '',
                    })
                }
            }

            i += remainingArgsConfig.length - 1 // Move the index accordingly
        }
    }


    // Check for missing required arguments at the command level
    commandConfig.arguments?.forEach(argConfig => {
        const argExists = commandArgs.some(arg => arg.name === argConfig.name)
        if (argConfig.required && !argExists) {
            commandArgs.push({
                name: argConfig.name,
                value: '',
                required: argConfig.required,
                description: argConfig.description || '',
                error: 'MISSING_ARG',
            })
        }
    })

    return {
        command: commandPart?.toLowerCase() || '',
        usage: '',
        help: '',
        options: parsedOptions,
        arguments: commandArgs,
    }
}

function findOptionConfig(optionName: string, options: Option[] = []): Option | undefined {
    return options.find((opt) => opt.option === optionName) || undefined
}

function parseNestedOptions(parts: string[], parentOptionConfig: Option): Option[] {
    const parsedOptions: Option[] = []

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]

        if (part.startsWith('-')) {
            const optionName = part
            const optionConfig = findOptionConfig(optionName, parentOptionConfig.options)

            if (optionConfig === undefined) {
                const isCommandOption = findOptionConfig(optionName, parentOptionConfig.options) === undefined
                if (isCommandOption) {
                    return parsedOptions
                }
                else {
                    const currentOption: Option = { option: optionName, error: 'UNKNOWN_OPTION' }
                    parsedOptions.push(currentOption)
                }

            } else {
                const currentOption: Option = { option: optionName, usage: optionConfig.usage, description: optionConfig.description, options: optionConfig.options, arguments: optionConfig.arguments }
                const remainingParts = parts.slice(i + 1)

                if (optionConfig.options && optionConfig.options.length > 0) {
                    currentOption.options = parseNestedOptions(remainingParts, optionConfig)
                    i += countParsedParts(currentOption.options)
                }

                if (optionConfig.arguments && optionConfig.arguments.length > 0) {
                    currentOption.arguments = parseArguments(remainingParts, optionConfig)
                    i += currentOption.arguments.length
                }

                parsedOptions.push(currentOption)
            }
        }
    }

    return parsedOptions
}


function parseArguments(parts: string[], optionConfig: Option): Argument[] {
    const parsedArgs: Argument[] = []
    const remainingArgsConfig = optionConfig.arguments || []
    const remainingArgsValues = parts

    for (let i = 0; i < remainingArgsConfig.length; i++) {
        const argConfig = remainingArgsConfig[i]
        const argValue = remainingArgsValues[i] || ''

        if (argConfig.required && !argValue) {
            // Missing required argument
            parsedArgs.push({
                name: argConfig.name,
                value: '',
                required: argConfig.required,
                description: argConfig.description || '',
                error: 'MISSING_ARG',
            })
        } else {
            // Valid argument
            parsedArgs.push({
                name: argConfig.name,
                value: argValue,
                required: argConfig.required || false,
                description: argConfig.description || '',
            })
        }
    }

    return parsedArgs
}

function countParsedParts(options: Option[]): number {
    return options.reduce((count, option) => {
        count++ // for the option itself

        if (option.options) {
            count += countParsedParts(option.options)
        }

        if (option.arguments) {
            count += option.arguments.length
        }

        return count
    }, 0)
}