import { NextResponse } from "next/server"


import { executeCommand } from "@/services/cmd"


export async function POST(req: Request) {
    try {
        const body = await req.json()
        // console.log('BODY:', body)
        if (!body.command) {
            return NextResponse.json({
                message: 'Missing command',
            }, {
                status: 406 // Not Acceptable
            })
        }

        try {
            const res = executeCommand(body.dir, body.command)

            return NextResponse.json(res, {
                status: 200
            })
        }
        catch (e) {
            // return error(e)
            return NextResponse.json(e, {
                status: 500
            })
        }
    }
    catch (e: any) {
        // return error(e)
        return NextResponse.json(e, {
            status: 500
        })
    }
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