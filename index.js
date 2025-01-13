import express from "express";
import * as dotenv from "dotenv";
import cors from "cors";
import cookieParser from 'cookie-parser';

import requestRoutes from "./routes/request.js";
import oauthRoutes from "./routes/oauth.js";
import userRoutes from "./routes/users.js";

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
app.use(cookieParser());

app.use('/request', requestRoutes);
app.use('/oauth', oauthRoutes)
app.use("/users", userRoutes);

const port = process.env.PORT || 8000;

const scopes = ["https://www.googleapis.com/auth/calendar"];

// // OAuth 2 configuration
// const oauth2Client = new google.auth.OAuth2(
//   process.env.CLIENT_ID,
//   process.env.CLIENT_SECRET,
//   process.env.REDIRECT_URL
// );



// app.get("/auth", (req, res) => {
//   const url = oauth2Client.generateAuthUrl({
//     access_type: "offline",
//     scope: scopes,
//   });
//   res.redirect(url);
// });

// app.get("/auth/redirect", async (req, res) => {
//   const { tokens } = await oauth2Client.getToken(req.query.code);
//   oauth2Client.setCredentials(tokens);
//   res.send("Authentication successful! Please return to the console.");
// });



app.get("/create-event", async (req, res) => {
  try {
    const result = await calendar.events.insert({
      calendarId: "primary",
      auth: oauth2Client,
      resource: event,
    });

    res.send({
      status: 200,
      message: "Event created",
    });
  } catch (err) {
    console.log(err);
    res.send(err);
  }
});

app.get("/", (req, res) => {
  res.send("Hello World");
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
