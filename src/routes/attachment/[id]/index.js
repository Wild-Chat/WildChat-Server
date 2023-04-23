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


const mongo = require('../../../mongo')

module.exports = {
    async get(req, res) {

        if (!req.params.user) return res.status(401).json({
            error: 'UNAUTHORIZED'
        })

        const attachment = await mongo.queryOne('Attachments', {_id: req.params.id})

        if(!attachment)return res.status(404).json({
            error: 'NOT_FOUND'
        })

        res.json(attachment)

    }
};