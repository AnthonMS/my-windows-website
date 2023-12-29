import { NextResponse } from "next/server"

import { parseCommand, Command } from "@/services/cmd_new"
import * as commandsJson from '@/services/cmd_new/commands.json'
type Commands = Record<string, Command>
const commands: Commands = commandsJson as Commands

export interface Res {
    message: string
    command?: Command|string
    config?: Command
}
export async function POST(req: Request) {
    try {
        const body = await req.json()
        // console.log('BODY:', body)
        if (!body.command) {
            const res:Res = {
                message: "MISSING_COMMAND"
            }
            return returnNow(res, 400)
        }

        try {
            // const res = executeCommand(body.dir, body.command)
            const command:string = body.command
            const commandParts = command.split(' ')
            const commandPart = commandParts.shift() || ''
            const commandConfig = commands[commandPart]

            if (commandConfig) {
                const parsedCommand = parseCommand(body.command, commandConfig)
                const res:Res = {
                    message: "PARSED",
                    command: parsedCommand,
                    config: commandConfig
                }
                return returnNow(res, 200)
            }
            else {
                const res:Res = {
                    message: "UNKNOWN_COMMAND",
                    command: commandPart
                }
                return returnNow(res, 200)
            }
        }
        catch (e:any) {
            const res:Res = {
                message: e.stacktrace
            }
            return returnNow(res, 500)
        }
    }
    catch (e:any) {
        const res:Res = {
            message: e.stacktrace
        }
        return returnNow(res, 500)
    }
}

const returnNow = (res:Res, status:number) => {
    return NextResponse.json(res, {
        status: status
    })
}


const error = (error: any) => {
    let msg = error.message
    if (error.errors && error.errors[0]) {
        if (error.errors[0].code === 'custom') {
            msg = `${error.errors[0].message}`
        }
        else {
            msg = `${error.errors[0].code} ${error.errors[0].path} ${error.errors[0].received}`
        }
    }
    console.error("Error Caught:", msg)
    console.error("Stacktrace:", error.stack)
    return NextResponse.json({
        message: msg,
        stacktrace: error.stack
    }, {
        status: 500
    })
}