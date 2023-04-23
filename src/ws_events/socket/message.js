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

module.exports = async (io, ws, data) => {

    if (!ws.data.user) return ws.emit('error', 'UNAUTHORIZED')

    let channel = await mongo.queryOne('Channels', { _id: data.channel._id }).catch(() => {return})

    if (!channel) return ws.emit('error', 'INVALID_CHANNEL')

    const payload = {
        channel,
        content: data.content,
        attachment: data.attachment,
        author: {
            name: ws.data.user.name,
            _id: ws.data.user._id,
            badges: ws.data.user.badges
        }
    }

    ws.to(data.channel._id).emit('message', payload)
    ws.emit('message', payload)

}