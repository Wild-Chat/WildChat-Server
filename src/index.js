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


const config = require('config')
const express = require('express')
const http = require('http')
const FsRouter = require('express-router-filesystem').FsRouter;
const cors = require('cors');
const fs = require('fs/promises');
const mongo = require('./mongo')
const hat = require('hat')
const ms = require('ms')

const app = express()
const server = http.createServer(app)

const io = require('socket.io')(server, {
    cors: {
        origin: '*'
    }
});

app.use(express.json({limit: '50mb'}))
app.use(cors())

setTimeout(async () => {

    // Add default channels
    mongo.queryOne('Channels', { default: true })
        .then(channels => {
            if (!channels) {
                mongo.insert('Channels', {
                    name: 'global',
                    is_dm: false,
                    default: true,
                    autofocus: true
                })
            }
        })

    // Add admin users
    for(let admin of config.get('admins')){
        let exists = await mongo.queryOne('Users', {name_lower: admin.toLowerCase()})
        if(!exists){
            const accessCode = hat()
            mongo.insert('Users', {
                name: admin,
                name_lower: admin.toLowerCase(),
                badges: 0b10000000,
                accessCode,
                reserved: true
            })
            console.log(`Created Admin User | ${admin} | ${accessCode}`)
        }
    }

    // Purge non-reserved users
    mongo.query('Users', {reserved: false})
        .then(users => {
            users.forEach(user => {
                console.log(`Purging ${user.name} from last session`)
                mongo.delete('Users', user)
            })
        })

}, 1000)

// Purge Attachments
setInterval(() => {
    mongo.query('Attachments', {timestamp: {$lt: Date.now() - ms(config.get('attachment_retention'))}})
}, ms('5m'))

fs.readdir(__dirname + '/ws_events/server')
    .then(files => {
        files.forEach(file => {
            if (!file.endsWith('.js')) return
            const name = file.split('.js')[0]
            const event = require(`./ws_events/server/${file}`)
            io.on(name, event.bind(null, io))
        })
    })

FsRouter(app, {
    routesDir: __dirname + '/routes',
    routePrefix: ''
}).then(() => {
    server.listen(config.get('port'), () => {
        console.log('Listening')
    })
});

module.exports = {
    io
}