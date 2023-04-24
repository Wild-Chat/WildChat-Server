/*
    WildChat-Server
    Copyright (C) 2023  Marcus Huber (xenorio) <dev@xenorio.xyz>

    This program is free software: you can redistribute it and/or modify
    it under the terms of the GNU Affero General Public License as published
    by the Free Software Foundation, either version 3 of the License, or
    (at your option) any later version.

    This program is distributed in the hope that it will be useful,
    but WITHOUT ANY WARRANTY; without even the implied warranty of
    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
    GNU Affero General Public License for more details.

    You should have received a copy of the GNU Affero General Public License
    along with this program.  If not, see <https://www.gnu.org/licenses/>.
*/


const mongo = require('../mongo')
const hat = require('hat')
const sessions = require('../session_manager')
const stats = require('../stats')

module.exports = {
    async post(req, res) {
        const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress

        let name = req.body.name
        let gender = req.body.gender
        let accessCode = req.body.accessCode

        if (!name) return res.status(400).json({
            error: 'MISSING_NAME'
        })

        if(!gender){
            gender = 0b00000000
        }

        if(![0, 1, 2, 4].includes(gender))return res.status(400).json({
            error: 'INVALID_GENDER'
        })

        let user = await mongo.queryOne('Users', { name_lower: name.toLowerCase() })

        if (user) {
            if (!user.reserved) {
                return res.status(409).json({
                    error: 'ACTIVE_SESSION'
                })
            } else if (user.reserved && !accessCode) {
                return res.status(401).json({
                    error: 'NAME_RESERVED'
                })
            } else if (user.reserved && accessCode != user.accessCode) {
                return res.status(401).json({
                    error: 'INVALID_ACCESS_CODE'
                })
            }
        }

        const token = hat()

        if (!user) {
            user = await mongo.insert('Users', {
                name,
                name_lower: name.toLowerCase(),
                token,
                reserved: false,
                login: Date.now(),
                badges: gender
            })
        } else {
            user.token = token
            user.login = Date.now()

            user.badges = user.badges >> 3

            user.badges = user.badges | gender
            mongo.update('Users', { _id: user._id }, user)
        }

        sessions.login(token, user)

        res.json({
            user
        })

        console.log(`Login -> ${name} -> ${ip}`)

        stats.addGender(gender)

    }
};