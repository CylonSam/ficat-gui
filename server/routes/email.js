const { readFileSync } = require('fs')
const { resolve } = require('path')
const mailer = require('../emailConfig')
const { formatDate } = require('../util/utils')

function send(ctx) {
  const { body, files } = ctx.request
  const { uploads } = files
  ctx.status = 200
  mailer.sendMail({
    from: process.env.EMAIL_USER,
    to: process.env.EMAIL_RCV_ADDRESS,
    subject: `Chamado FICAT ${body.name} - ${formatDate()}`,
    html: makeEmailContent(body),
    attachments: uploads.map(file => ({
      filename: file.name,
      content: file
    }))
  })
}

function makeEmailContent({ name, email, fone, msg }) {
  const emailContent = readFileSync(
    resolve(__dirname, '../models/email/email.html'),
    'utf8'
  )
  return emailContent
    .replace('{{name}}', name)
    .replace('{{email}}', email)
    .replace('{{fone}}', fone)
    .replace('{{msg}}', msg)
}

module.exports = { send }
