import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: process.env.EMAIL_SERVICE || 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
})

export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
      console.log(`[DEV MODE] Verification code for ${email}: ${code}`)
      return true
    }

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
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
    return true
  } catch (err) {
    console.error('Email error:', err)
    return false
  }
}
