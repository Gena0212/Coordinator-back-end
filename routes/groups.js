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
    let groupUserData = []

    for (let key in groupMembers){
        let user = {
            user_id: key,
            accept_invite: groupMembers[key]
        }
        groupUserData.push(user)
    }
    
    knex.transaction(function(trx) {
        return trx
        .insert({name: req.body.groupName}, 'id')
        .into("groups")
        .then(function(ids) {
            groupUserData.forEach((member)=>(member.group_id = ids[0]));
            return trx('group_users').insert(groupUserData);
        });
    })
    .then(function(inserts) {
        console.log('Transaction completed successfully');
      })
    .catch(function(error) {
        console.error('Transaction failed:', error);
      });
})

router.get('/', authorise, async (req, res) => {
    const user_id = req.token.id;

    try {
        const data = await knex('groups')
        .join("group_users", "groups.id", "group_users.group_id")
        .join("users", "group_users.user_id", "users.id")
        .where('users.id', user_id)
        .select(
            "groups.name",
            "groups.id"
        )
        
        console.log('Data from get groups is', data)
        res.status(200).json(data);
    } catch (error) {
        res.status(400)
    }
} )

export default router;