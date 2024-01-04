export interface Command {
    command: string
    usage?: string
    help?: string
    helpExtra?: string
    options?: Option[]
    arguments?: Argument[]
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
            }
            else {
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
                        error: 'MISSING_ARG',
                    })
                } else {
                    const existingArg = commandArgs.find(arg => arg.name === argConfig.name)

                    if (!existingArg) {
                        commandArgs.push({
                            name: argConfig.name,
                            value: argValue,
                            required: argConfig.required || false,
                            description: argConfig.description || '',
                        })
                    }
                    else {
                        // Duplicate argument found, handle accordingly
                        commandArgs.push({
                            name: '',
                            value: argValue,
                            error: 'UNKNOWN_ARG',
                        });
                    }
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
        usage: commandConfig.usage || '', // use commandConfig.usage if it's present
        help: commandConfig.help || '', // use commandConfig.help if it's present
        options: parsedOptions,
        arguments: commandArgs,
    }
}

export function findOptionConfig(optionName: string, options: Option[] = []): Option | undefined {
    return options.find((opt) => opt.option === optionName) || undefined
}

export function parseNestedOptions(parts: string[], parentOptionConfig: Option): Option[] {
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


export function parseArguments(parts: string[], optionConfig: Option): Argument[] {
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

export function countParsedParts(options: Option[]): number {
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


export const extractErrors = (obj: Command): string[] => {
    const errors: string[] = []

    const traverseObject = (innerObj: any) => {
        if (innerObj && typeof innerObj === 'object') {
            if ('error' in innerObj && typeof innerObj.error === 'string') {
                errors.push(innerObj.error)
            }

            for (const key in innerObj) {
                if (Array.isArray(innerObj[key])) {
                    for (const item of innerObj[key]) {
                        traverseObject(item)
                    }
                } else if (typeof innerObj[key] === 'object') {
                    traverseObject(innerObj[key])
                }
            }
        }
    };

    traverseObject(obj)

    return errors
}
export const extractErrorObjects = (obj: Command): { errors: any[], errorOptions: Option[], errorArguments: Argument[] } => {
    const errors: (Option | Argument)[] = [];
    const errorOptions: Option[] = []
    const errorArguments: Argument[] = []

    const traverseObject = (innerObj: any) => {
        if (innerObj && typeof innerObj === 'object') {
            if ('error' in innerObj && typeof innerObj.error === 'string') {
                errors.push(innerObj)

                if ('option' in innerObj) {
                    errorOptions.push(innerObj)
                } else if ('name' in innerObj) {
                    errorArguments.push(innerObj)
                }
            }

            for (const key in innerObj) {
                if (Array.isArray(innerObj[key])) {
                    for (const item of innerObj[key]) {
                        traverseObject(item)
                    }
                } else if (typeof innerObj[key] === 'object') {
                    traverseObject(innerObj[key])
                }
            }
        }
    };

    traverseObject(obj)

    return { errors, errorOptions, errorArguments }
}

export const processOptions = (options: Option[]): string => {
    let optionOutputMsg = '';
    options.forEach((option) => {
        optionOutputMsg += `\t\t` + `${option.usage} \t ${option.description}\n`;

        if (option.options) {
            optionOutputMsg += processOptions(option.options);
        }
    });
    return optionOutputMsg;
};

export const processArguments = (args: Argument[], options: Option[] = []): string => {
    let argOutputMsg = '';

    args.forEach((arg: Argument) => {
        const argName = arg.required ? arg.name : `[${arg.name}]`;
        argOutputMsg += `\t\t` + `${argName} \t ${arg.description}\n`;
    });

    options.forEach((option) => {
        if (option.arguments) {
            argOutputMsg += processArguments(option.arguments, option.options);
        }
    });

    return argOutputMsg;
};

export const errorsToOutputString = (commandConfig: Command, command: Command, err: string
): string => {

    const errors = extractErrorObjects(command)

    let outputMsg: string = ``

    switch (err) {
        case 'UNKNOWN_OPTION':
            outputMsg += `Unknown option(s)\n`
            outputMsg += `Usage: ${commandConfig.usage}\n\n`

            outputMsg += `\tProblem option(s):\n`
            errors.errorOptions.map((errObj: Option) => {
                outputMsg += `\t\t` + `${errObj.option} \t ${errObj.error}\n`;
            })
            outputMsg += `\n`

            if (commandConfig.options) {
                outputMsg += `\tOptions:\n`
                outputMsg += processOptions(commandConfig.options)
            }
            outputMsg += `\n`
            
            if (commandConfig.arguments) {
                outputMsg += `\tArguments:\n`
                outputMsg += processArguments(commandConfig.arguments, commandConfig.options);
            }

            break;
        case 'MISSING_ARG':
            outputMsg += `Missing argument(s)\n`
            outputMsg += `Usage: ${commandConfig.usage}\n\n`

            outputMsg += `\tProblem argument(s):\n`
            errors.errorArguments.map((errArg: Argument) => {
                outputMsg += `\t\t` + `${errArg.name} \t ${errArg.error}\n`;
            })
            outputMsg += `\n`

            if (commandConfig.arguments) {
                outputMsg += `\tArguments:\n`
                outputMsg += processArguments(commandConfig.arguments, commandConfig.options);
            }
            outputMsg += `\n`

            if (commandConfig.options) {
                outputMsg += `\tOptions:\n`
                outputMsg += processOptions(commandConfig.options)
            }

            break
        case 'UNKNOWN_ARG':
            outputMsg += `Unknown argument(s)\n`
            outputMsg += `Usage: ${commandConfig.usage}\n\n`

            outputMsg += `\tProblem argument(s):\n`
            errors.errorArguments.map((errArg: Argument) => {
                outputMsg += `\t\t` + `${errArg.value} \t ${errArg.error}\n`;
            })
            outputMsg += `\n`

            if (commandConfig.arguments) {
                outputMsg += `\tArguments:\n`
                outputMsg += processArguments(commandConfig.arguments, commandConfig.options);
            }
            outputMsg += `\n`
            
            if (commandConfig.options) {
                outputMsg += `\tOptions:\n`
                outputMsg += processOptions(commandConfig.options)
            }

            break
        case 'HELP':
            outputMsg += `Usage: ${commandConfig.usage}\n\n`
            outputMsg += `${commandConfig.help}\n\n`

            if (commandConfig.options) {
                outputMsg += `\tOptions:\n`
                outputMsg += processOptions(commandConfig.options)
            }
            outputMsg += `\n`

            if (commandConfig.arguments) {
                outputMsg += `\tArguments:\n`
                outputMsg += processArguments(commandConfig.arguments, commandConfig.options);
            }

            break
        default:
            break
    }

    outputMsg += '\n'
    return outputMsg
}