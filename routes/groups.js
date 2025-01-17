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
    console.log(typeof user_id)
    try {
        const data = await knex('groups')
            .join("group_users", "groups.id", "group_users.group_id")
            .join("users", "group_users.user_id", "users.id")
            .where('users.id', user_id)
            .select(
                "groups.name",
                "groups.id"
            )
        res.status(200).json(data);
    } catch (error) {
        res.status(400)
    }
} )

router.get("/:id/members", authorise, async (req, res) => {
    const group_id = req.params.id
    console.log(group_id)

    try {
        console.log('enter into trycatch')
        const data = await knex('users')
            .join("group_users", "users.id", "group_users.user_id")
            .join("groups", "group_users.group_id", "groups.id")
            .where({'groups.id': group_id})
            .select(
                "users.id",
                "users.firstName",
                "users.lastName",
                "users.email", 
                "users.events",
            )
        console.log(data)
        res.status(200).json(data);
 
    } catch (error) {
        res.status(400)
    }
})

router.get("/invites", authorise, async (req, res) => {
    const user_id = req.token.id;

    try { 
        const groupsInvitedTo = await knex('groups')
            .join("group_users", "groups.id", "group_users.group_id")
            .join("users", "group_users.user_id", "users.id")
            .where('users.id', user_id)
            .where('accept_invite', 0)
            .select(
                "groups.id",
                "groups.name"
        )
        
        for (let i = 0; i < groupsInvitedTo.length; i++){
            const groupMembers = await knex('users')
            .join("group_users", "users.id", "group_users.user_id")
            .join("groups", "group_users.group_id", "groups.id")
            .where({'groups.id': groupsInvitedTo[i].id})
            .whereNot('users.id', user_id)
            .select(
                "users.id",
                "users.firstName",
                "users.lastName",
                "users.email", 
            )
            groupsInvitedTo[i]['members'] = groupMembers;
        }
        
        console.log(groupsInvitedTo);
        
        res.status(200).json(groupsInvitedTo);
    } catch (error) {
        console.log(error);
    }
})

export default router;