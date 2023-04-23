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


const mongo = require('../../mongo')
const hat = require('hat')
const sessions = require('../../session_manager')
const { io } = require('../../index')

module.exports = {
    async post(req, res) {

        if (!req.params.user) return res.status(401).json({
            error: 'UNAUTHORIZED'
        })

        if (!req.body.recipient) return res.status(400).json({
            error: 'MISSING_RECIPIENT'
        })

        const recipient = await mongo.queryOne('Users', { _id: req.body.recipient })

        if (!req.body.recipient) return res.status(404).json({
            error: 'INVALID_RECIPIENT'
        })

        const existing = await mongo.queryOne('Channels', { participantID: { $all: [req.params.user._id, recipient._id] } })

        if (existing) return res.status(400).json({
            error: 'CHANNEL_EXISTS'
        })

        const channel = await mongo.insert('Channels', {
            is_dm: true,
            participants: [req.params.user, recipient],
            participantID: [req.params.user._id, recipient._id]
        })

        wsSender = sessions.getSocket(req.params.user._id.toString())
        wsRecipient = sessions.getSocket(recipient._id.toString())

        wsSender.emit("channel-join", channel)
        wsRecipient.emit("channel-join", channel)

        wsSender.join(channel._id.toString())
        wsRecipient.join(channel._id.toString())

        res.json(channel)

    }
};