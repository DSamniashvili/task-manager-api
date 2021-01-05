const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeMessage = async (email, user) => {
    const msg = {
        to: email,
        from: 'deasamniashvili@gmail.com',
        subject: 'Welcome to the board!',
        text: `Hi ${user}! Hope you'll like it`,
    }
    const sent = await sgMail.send(msg);

    if (!sent) {
        return console.log('Email was not sent');
    }

    console.log('email has been sent')
}

const sendGoodByeMessage = async (email, user) => {
    const msg = {
        to: email,
        from: 'deasamniashvili@gmail.com',
        subject: 'Sad to see you going',
        text: `Hi ${user}! We are sorry you're leaving`,
        html: `Hi <b>${user}</b>! We are sorry you're leaving`
    }

    await sgMail.send(msg);

}

module.exports = {
    sendWelcomeMessage,
    sendGoodByeMessage,
}


