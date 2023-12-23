export interface ValidationResult {
    isValid: boolean;
    parsedCommand?: ParsedCommand;
    error?: string;
}

export interface ParsedCommand {
    command: string;
    options: string[];
    arguments: { [key: string]: string };
}

export function validateAndParseCommand(command: string, usageExample: string): ValidationResult {
    const pattern = /\[.*?\]|[^\s]+/g;
    const expectedTokens = usageExample.match(pattern) || [];

    const commandTokens = command.split(/\s+/);
    const parsedCommand: ParsedCommand = {
        command: "",
        options: [],
        arguments: {},
    };

    let currentArgument: string | null = null;

    for (let i = 0; i < commandTokens.length; i++) {
        const cmdToken = commandTokens[i];
        const expectedToken = expectedTokens[i];

        if (expectedToken.startsWith('[') && expectedToken.endsWith(']')) {
            // If the expected token is optional, skip validation
            continue;
        }

        if (cmdToken !== expectedToken) {
            // If the tokens don't match, determine the reason for the error
            return {
                isValid: false,
                error: expectedToken.startsWith('-') ? 'UNKNOWN_OPTION' : 'UNKNOWN_ARG',
            };
        }

        if (expectedToken.startsWith('-')) {
            // It's an option, check if it's a valid option
            const validOptions = expectedToken.substring(1, expectedToken.length - 1).split('|');
            if (!validOptions.includes(cmdToken)) {
                return {
                    isValid: false,
                    error: 'INVALID_OPTION',
                };
            }
            parsedCommand.options.push(cmdToken);
        } else if (expectedToken.startsWith('[') && expectedToken.endsWith(']')) {
            // It's an optional argument
            currentArgument = expectedToken.slice(1, -1);
            parsedCommand.arguments[currentArgument] = cmdToken;
        } else {
            // It's a required argument
            currentArgument = expectedToken;
            parsedCommand.arguments[currentArgument] = cmdToken;
        }
    }

    return { isValid: true, parsedCommand };
}