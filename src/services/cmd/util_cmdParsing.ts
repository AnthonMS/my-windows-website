export interface Command {
    command: string;
    usage: string;
    help?: string;
    options?: Option[];
    arguments?: Argument[];
}
export interface Option {
    option: string;
    usage: string;
    arguments?: Argument[];
}
export interface Argument {
    name: string;
    required: boolean;
    description: string;
}

export interface ParsedCommand {
    command: string
    options: ParsedOption[]
    arguments: string[]
}
export interface ParsedOption {
    option: string
    usage: string
    arguments: string[]
    error?: string
}
export function parseCommand(command: string, commandConfig: Command): ParsedCommand {
    const parts = command.split(' ')
    const commandPart = parts.shift() // Extract the command
    const parsedOptions: ParsedOption[] = []
    const argumentsList: string[] = []

    for (let i = 0; i < parts.length; i++) {
        const part = parts[i]

        if (part.startsWith('-')) {
            const optionName = part
            const optionConfig = commandConfig.options?.find((opt) => opt.option === optionName)

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