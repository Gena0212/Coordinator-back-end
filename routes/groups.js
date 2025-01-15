import express from "express";
import initKnex from "knex";
import knexConfig from "../knexfile.js";
const knex = initKnex(knexConfig);

import authorise from "../middleware/auth.js";
import { configDotenv } from "dotenv";

const router = express.Router();

router.post('/', authorise, async(req, res) => {

    const user_id = req.token.id;
    const groupMembers = {...req.body.members, [user_id]:true}
    console.log(groupMembers)

    try {
        const newGroupIds = await knex("groups").insert({
            name: req.body.groupName, 
            members: groupMembers
        }) 

        const newGroup = await knex("groups").where({id: newGroupIds[0]}).first();
        console.log(newGroup)
        res.status(201).json(newGroup)
    } catch (error) {
        console.log(error)
    }
})

export default router;