import express from "express";
import "dotenv/config";
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

router.post('/', async function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header("Referrer-Policy","no-referrer-when-downgrade");

    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URL
    );

    // Generate the url that will be used for the consent dialog.
    const authorizeUrl = oAuth2Client.generateAuthUrl({
            access_type: 'offline',
            scope: 'https://www.googleapis.com/auth/userinfo.profile  openid ',
            prompt: 'consent'
    });
      
    res.json({url:authorizeUrl})
})

export default router;