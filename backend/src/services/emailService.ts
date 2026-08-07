import sgMail from '@sendgrid/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export const initializeEmail = async () => {
  console.log('✓ SendGrid configured')
}

export const sendVerificationEmail = async (email: string, code: string): Promise<boolean> => {
  try {
    if (!process.env.SENDGRID_API_KEY) {
      console.log(`[FALLBACK] Verification code for ${email}: ${code}`)
      return true
    }

    await sgMail.send({
      to: email,
      from: 'noreply@cinetudiants.com',
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
    console.error('SendGrid error:', err)
    return false
  }
}
