import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
const knex = initKnex(knexConfig);
import { google } from "googleapis";

import "dotenv/config";
import { OAuth2Client } from 'google-auth-library';
// Custom middleware to check JWT tokens on protected routes
import authorise from "../middleware/auth.js";

const router = express.Router();


const oAuth2Client = new OAuth2Client(
    process.env.CLIENT_ID,
    process.env.CLIENT_SECRET,
    process.env.REDIRECT_URL
);

const calendar = google.calendar({
    version: "v3",
    auth: oAuth2Client,
});

async function getUserData(access_token) {

    const response = await fetch(`https://www.googleapis.com/oauth2/v3/userinfo?access_token=${access_token}`);
    
    const data = await response.json();
}

router.get('/redirect',  async function(req, res, next) {
    const code = req.query.code;

    try {

        const r = await oAuth2Client.getToken(code);

        // Make sure to set the credentials on the OAuth2 client.
        oAuth2Client.setCredentials(r.tokens);

        const user = oAuth2Client.credentials;
        await getUserData(oAuth2Client.credentials.access_token);

    } catch (error) {
        console.log('Error logging in with OAuth2 user', error);
    }

    res.redirect(303, `${process.env.CLIENT_URL}home`);

})

router.get("/events", authorise, async (req, res) => {

    const user_id = req.token.id;

    try {
      const result = await calendar.events.list({
        calendarId: "primary",
        timeMin: new Date().toISOString(),
        maxResults: 10,
        singleEvents: true,
        orderBy: "startTime",
      });
  
      const events = result.data.items;

      await knex("users").where('id', user_id).update('events', JSON.stringify(events));
      if (!events || events.length === 0) {
          console.log("No upcoming events found.");
          return;
      } else {
          console.log('events are there');
      }
        
      res.send({
        status: 200,
        message: "Events added successfully",
      });
  
    } catch (error) {
      console.error(error);
    }
});

export default router;