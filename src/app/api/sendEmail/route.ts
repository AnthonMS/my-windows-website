import { NextResponse } from "next/server"
import * as zod from 'zod'

// export const feedBaseURL = process.env.DS_FEED_BASEURL

import { sendMail } from "@/services/mailService"

const emailSchema = zod.object({
    nameFrom: zod.string().min(1, 'Name required').max(100),
    emailFrom: zod.string().min(1, 'Email required').max(100),
    phoneFrom: zod.string().min(1, 'Phone required').max(25),
    subject: zod.string().min(1, 'Subject required').max(100),
    content: zod.string().min(1, 'Content required').max(1000),
})


export async function POST(req: Request) {
    // Creating a new user
    try {
        const body = await req.json()
        const { nameFrom, emailFrom, phoneFrom, subject, content } = emailSchema.parse(body)

        try {
            await sendMail(process.env.NODEMAILER_MAIL, process.env.NODEMAILER_PW, process.env.MY_MAIL, subject, content)
            return NextResponse.json({
                message: 'Email sent successfully'
            }, {
                status: 200
            })
        }
        catch (e) {
            return error(e)
        }

    }
    catch (e: any) {
        return error(e)
    }
}


const error = (error:any) => {
    let msg = error.message
    if (error.errors[0]) {
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