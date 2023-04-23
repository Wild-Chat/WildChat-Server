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

module.exports = {
    async post(req, res) {

        if (!req.params.user) return res.status(401).json({
            error: 'UNAUTHORIZED'
        })

        let attachment = req.body

        if(!attachment.name || !attachment.type || !attachment.data)return res.status(400).json({
            error: 'MISSING_DATA'
        })

        attachment.timestamp = Date.now()

        attachment = await mongo.insert('Attachments', attachment)

        res.json({
            id: attachment._id.toString()
        })

    }
};