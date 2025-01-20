import express from "express";
import "dotenv/config";
import { OAuth2Client } from 'google-auth-library';

const router = express.Router();

router.post('/:email', async function(req, res, next) {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header("Referrer-Policy","no-referrer-when-downgrade");

    const {email} = req.params;

    const oAuth2Client = new OAuth2Client(
        process.env.CLIENT_ID,
        process.env.CLIENT_SECRET,
        process.env.REDIRECT_URL
    );

    try { 
        // Generate the url that will be used for the consent dialog.
        const authorizeUrl = oAuth2Client.generateAuthUrl({
                access_type: 'offline',
                scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/calendar.readonly https://www.googleapis.com/auth/calendar',
                prompt: 'consent',
                login_hint: email
        });
    
        if(!authorizeUrl) {
            return res.status(404).json({ message: "Error retrieving authorizeUrl" });
        }
        res.json({url: authorizeUrl})
    } catch (error) {
        res.status(500).json({ message: "Server error" });
    }

})

export default router;