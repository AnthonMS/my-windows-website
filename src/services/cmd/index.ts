import * as commandsJson from './commands.json'

interface Command {
    usage: string
    options?: Option[]
    help?: string
    arguments?: Argument[]
}
interface Option {
    option: string
    usage: string
    arguments?: Argument[]
}
interface Argument {
    name: string
    required: boolean
    description: string
}

type Commands = Record<string, Command>
const commands: Commands = commandsJson as Commands


interface ParsedCommand {
    command: string
    options: ParsedOption[]
    arguments: string[]
}
interface ParsedOption {
    option: string
    usage: string
    arguments: string[]
    error?: string
}

function parseCommand(command: string): ParsedCommand {
    const parts = command.split(' ')

    const commandPart = parts.shift() // Extract the command
    const parsedOptions: ParsedOption[] = []
    const argumentsList: string[] = []

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]

        if (part.startsWith('-')) {
            const optionName = part
            const optionConfig = findOptionConfig(commandPart, optionName)

            if (optionConfig === undefined) {
                const currentOption: ParsedOption = { option: optionName, error: "UNKNOWN_OPTION", usage: '', arguments: [] }
                parsedOptions.push(currentOption)
            }
            else {
                const currentOption: ParsedOption = { option: optionName, usage: optionConfig!.usage, arguments: [] }

                if (optionConfig?.arguments && optionConfig.arguments.length > 0) {
                    for (let j = 0; j < optionConfig.arguments.length; j++) {
                        const optionArg: string = parts[i + 1 + j] || ''
                        if ((optionArg === '' || optionArg.startsWith('-')) && optionConfig.arguments[j].required) { // If missing argument when it's required
                            currentOption.arguments.push("UNKNOWN_OPTION_ARG")
                            currentOption.error = 'UNKNOWN_OPTION_ARG'
                        }
                        else {
                            currentOption.arguments.push(optionArg)
                        }
                    }

                    i += optionConfig.arguments.length
                }

                parsedOptions.push(currentOption)
            }
        }
        else {
            argumentsList.push(part) // it's a command-level argument
        }
    }

    return {
        command: commandPart?.toLowerCase() || '',
        options: parsedOptions,
        arguments: argumentsList,
    };
}
function findOptionConfig(command: string | undefined, optionName: string): Option | undefined {
    const selectedCommand = commands[command || ''];
    return selectedCommand?.options?.find((opt) => opt.option === optionName);
}
function findOptions(command: string | undefined): Option[] | undefined {
    const selectedCommand = commands[command || ''];
    return selectedCommand?.options
}


interface CommandResponse {
    message: string
    error: string | boolean
    success: string | boolean
    parsedCommand: string
    parsedOptions: ParsedOption[]
    parsedArgs: string[]
    usage?: string
    options?: Option[]
    arguments?: Argument[]
    help?: string
    invalidOptions?: string[]
}
export const executeCommand = (dir: string, cmd: string): CommandResponse => {
    const { command: parsedCommand, options: parsedOptions, arguments: parsedArgs }: {
        command: string;
        options: ParsedOption[];
        arguments: string[];
    } = parseCommand(cmd);

    // Find the command in the commands list
    const selectedCommand = commands[parsedCommand]

    if (selectedCommand) {
        const { usage, options, help, arguments: cmdArgs } = selectedCommand

        // Check for unknown Option
        const hasOptionError = parsedOptions.some((option: ParsedOption) => !!option.error)
        if (hasOptionError) {
            const unknownOptions = parsedOptions.filter((option) => option.error === "UNKNOWN_OPTION")
            if (unknownOptions.length > 0) {
                const optionsWithErrorNames = unknownOptions.map((option) => option.option)
                return {
                    message: "Unknown option(s)",
                    success: false,
                    error: "UNKNOWN_OPTION",
                    parsedCommand: parsedCommand,
                    parsedOptions: parsedOptions,
                    parsedArgs: parsedArgs,
                    usage: usage,
                    options: options,
                    arguments: selectedCommand.arguments,
                    invalidOptions: optionsWithErrorNames,
                }
            }
            const unknownOptionArgs = parsedOptions.filter((option) => option.error === "UNKNOWN_OPTION_ARG")
            console.log('missingOptionArgs:', unknownOptionArgs)
            if (unknownOptionArgs.length > 0) {
                const optionsWithErrorNames = unknownOptionArgs.map((option) => option.option)
                return {
                    message: "Unknown option args",
                    success: false,
                    error: "UNKNOWN_OPTION_ARG",
                    parsedCommand: parsedCommand,
                    parsedOptions: parsedOptions,
                    parsedArgs: parsedArgs,
                    usage: usage,
                    options: options,
                    arguments: selectedCommand.arguments,
                    invalidOptions: optionsWithErrorNames,
                }
            }
        }


        // Check if we have the required argument(s) for the command
        // First check if parsedArgs array is longer than selectedCommand.arguments, if so, we have an unknown argument passed to the command
        if (selectedCommand.arguments) {
            const requiredArguments = selectedCommand.arguments?.filter((arg) => arg.required) || []
            if (parsedArgs.length < requiredArguments.length) {
                // Handle case where there are missing required arguments
                return {
                    message: "Missing argument(s)",
                    error: "MISSING_ARG",
                    success: false,
                    parsedCommand: parsedCommand,
                    parsedOptions: parsedOptions,
                    parsedArgs: parsedArgs,
                    usage: usage,
                    options: options,
                    arguments: selectedCommand.arguments
                }
            }
            else {
                if (parsedArgs.length > selectedCommand.arguments.length) {
                    // Too many argument(s)
                    return {
                        message: "Too many arguments given",
                        error: "UNKNOWN_ARG",
                        success: false,
                        parsedCommand: parsedCommand,
                        parsedOptions: parsedOptions,
                        parsedArgs: parsedArgs,
                        usage: usage,
                        options: options,
                        arguments: selectedCommand.arguments,
                    }
                }

                
                return {
                    message: "Command validated successfully",
                    error: false,
                    success: "EXECUTE",
                    parsedCommand: parsedCommand,
                    parsedOptions: parsedOptions,
                    parsedArgs: parsedArgs,
                }
            }
        }
        else if (!selectedCommand.arguments &&
            parsedArgs.length > 0) {
            // selectedCommand accept no arguments but were given one or more
            return {
                message: "Too many arguments given",
                error: "UNKNOWN_ARG",
                success: false,
                parsedCommand: parsedCommand,
                parsedOptions: parsedOptions,
                parsedArgs: parsedArgs,
                usage: usage,
                options: options,
                arguments: selectedCommand.arguments,
            }
        }

        // if (parsedArgs.length > selectedCommand.arguments) {

        // }

        // Check if they are asking for help and return that if so. 
        // We know --help is a valid option since we are here
        const hasHelpOption = parsedOptions.some((obj: ParsedOption) => obj.option === "--help")
        if (hasHelpOption) {
            return {
                message: "Show help menu",
                success: "HELP",
                error: false,
                parsedCommand: parsedCommand,
                parsedOptions: parsedOptions,
                parsedArgs: parsedArgs,
                usage: usage,
                options: options,
                arguments: selectedCommand.arguments,
                help: help,
            }

        }

        return {
            message: "Execute command",
            error: false,
            success: "EXECUTE",
            parsedCommand: parsedCommand,
            parsedOptions: parsedOptions,
            parsedArgs: parsedArgs
        }
    }
    else {
        return {
            message: "Unkown command",
            error: "UNKNOWN_COMMAND",
            success: false,
            parsedCommand: parsedCommand,
            parsedOptions: parsedOptions,
            parsedArgs: parsedArgs
        }
    }
}
