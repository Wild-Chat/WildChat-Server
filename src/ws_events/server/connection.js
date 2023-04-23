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


const fs = require('fs/promises')

module.exports = async(io, ws) => {
    console.log(`WS connection -> ${ws.handshake.address}`)

    fs.readdir(__dirname + '/../socket')
        .then(files => {
            files.forEach(file => {
                if (!file.endsWith('.js')) return
                const name = file.split('.js')[0]
                const event = require(`../socket/${file}`)
                ws.on(name, event.bind(null, io, ws))
            })
        })

}