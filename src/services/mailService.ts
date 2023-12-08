var nodemailer = require("nodemailer");
//-----------------------------------------------------------------------------
export async function sendMail(nodemailerUser: any, nodemailerPass: any, toEmail: any, subject: any, otpText: any) {
    var transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
            user: nodemailerUser,
            pass: nodemailerPass,
        },
    })

    var mailOptions = {
        from: nodemailerUser,
        to: toEmail,
        subject: subject,
        text: otpText,
    }

    await new Promise((resolve, reject) => {
        transporter.sendMail(mailOptions, (err:any, response:any) => {
            if (err) {
                reject(err)
            } else {
                resolve(response)
            }
        })
    })
}