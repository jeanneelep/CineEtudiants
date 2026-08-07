import nodemailer from 'nodemailer'

let transporter: any = null

export const initializeEmail = async () => {
  if (process.env.MAILTRAP_API_TOKEN) {
    transporter = nodemailer.createTransport({
      host: 'send.mailtrap.io',
      port: 587,
      auth: {
        user: 'api',
        pass: process.env.MAILTRAP_API_TOKEN
      }
    })
    console.log('✓ Mailtrap configured')
  }
}

export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    if (!transporter) {
      await initializeEmail()
    }

    if (!transporter) {
      console.log(`[FALLBACK] Verification code for ${email}: ${code}`)
      return true
    }

    await transporter.sendMail({
      from: 'CinéÉtudiants <noreply@cinetudiants.com>',
      to: email,
      subject: 'Vérifiez votre adresse email - CinéÉtudiants',
      html: `
        <h2>Bienvenue sur CinéÉtudiants!</h2>
        <p>Votre code de vérification est:</p>
        <h1 style="color: #6366f1; font-size: 32px; letter-spacing: 5px;">${code}</h1>
        <p>Ce code expire dans 15 minutes.</p>
        <p>Si vous n'avez pas créé ce compte, ignorez cet email.</p>
      `
    })

    console.log(`✓ Email sent to ${email}`)
    return true
  } catch (err) {
    console.error('Mailtrap error:', err)
    return false
  }
}
