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


const mongo = require('./mongo')

const sessions = new Map()
const sockets = new Map()

module.exports.login = (token, user) => {
    sessions.set(token, user)
}

module.exports.logout = (token) => {
    const user = sessions.get(token)
    if(!user)return

    if(!user.reserved){
        mongo.delete('Users', user)
    }

    sessions.delete(token)
}

module.exports.get = (token) => {
    return new Promise(async(resolve, reject) => {
        let user = sessions.get(token)

        if (!user) {
            user = await mongo.queryOne('Users', { token })
            if (!user) {
                return reject()
            } else {
                this.login(user.token, user)
                resolve(user)
            }
        } else {
            resolve(user)
        }

    })
}

module.exports.setSocket = (id, ws) => {
    sockets.set(id, ws)
}

module.exports.getSocket = (id) => {
    return sockets.get(id)
}