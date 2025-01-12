import express from "express";
import "dotenv/config";
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

async function getUserData(access_token) {

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    
    //console.log('response',response);
    const data = await response.json();
    console.log('data',data);
}

router.get('/redirect',  async function(req, res, next) {
    const code = req.query.code;

    try {
        const oAuth2Client = new OAuth2Client(
            process.env.CLIENT_ID,
            process.env.CLIENT_SECRET,
            process.env.REDIRECT_URL
        );

        const r =  await oAuth2Client.getToken(code);
        // Make sure to set the credentials on the OAuth2 client.
        await oAuth2Client.setCredentials(r.tokens);
        const user = oAuth2Client.credentials;
        await getUserData(oAuth2Client.credentials.access_token);

    } catch (error) {
        console.log('Error logging in with OAuth2 user', err);
    }

    res.redirect(303, `${process.env.CLIENT_URL}home`);

})

export default router;