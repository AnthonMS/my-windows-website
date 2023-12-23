import { parseCommand, Command, Option, Argument, ParsedOption } from './util_cmdParsing'

import * as commandsJson from './commands.json'
type Commands = Record<string, Command>
const commands: Commands = commandsJson as Commands

interface CommandResponse {
    message: string
    error: boolean | "UNKNOWN_COMMAND" | "MISSING_ARG" | "UNKNOWN_OPTION" | "UNKNOWN_OPTION_ARG" | "UNKNOWN_ARG"
    success: boolean | "EXECUTE" | "HELP"
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
    const commandParts = cmd.split(' ')
    const commandPart = commandParts.shift() || ''
    const commandConfig = commands[commandPart]
    if (!commandConfig) {
        return {
            message: "Unkown command TESTER",
            error: "UNKNOWN_COMMAND",
            success: false,
            parsedCommand: commandPart,
            parsedOptions: [],
            parsedArgs: []
        }
    }
    else {


        const { command: parsedCommand, options: parsedOptions, arguments: parsedArgs }: {
            command: string;
            options: ParsedOption[];
            arguments: string[];
        } = parseCommand(cmd, commandConfig)

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
}
