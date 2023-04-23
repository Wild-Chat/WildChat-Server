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

let stats

mongo.queryOne('Settings', { name: 'stats' })
    .then(async res => {
        stats = res

        if (!stats) {
            stats = {
                name: 'stats',
                genders: {
                    0: 0,
                    1: 0,
                    2: 0,
                    4: 0
                }
            }
            await mongo.insert('Settings', stats)
        }

    })

setInterval(() => {
    mongo.update('Settings', { name: 'stats' }, stats)
}, 60000)

module.exports.addGender = async (gender) => {
    stats.genders[gender] += 1
    console.log(`Stats | Increased gender[${gender}] to ${stats.genders[gender]}`)
}