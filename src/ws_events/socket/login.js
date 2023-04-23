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


const sessions = require('../../session_manager')
const mongo = require('../../mongo')

module.exports = async (io, ws, token) => {
    sessions.get(token)
        .then(async user => {
            ws.data.user = user

            const defaultChannels = await mongo.query('Channels', {default: true})

            defaultChannels.forEach(channel => {
                channel._id = channel._id.toString()
                ws.join(channel._id)
                ws.emit('channel-join', channel)
            })

            sessions.setSocket(user._id.toString(), ws)
            
        })
        .catch(() => {
            ws.emit('error', 'INVALID_TOKEN')
        })
}