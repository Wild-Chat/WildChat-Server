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
var MongoClient = require('mongodb').MongoClient
const { ObjectId } = require('mongodb')

const server = config.get('database.url')

const db_name = config.get('database.name')

let db

MongoClient.connect(server)
    .then(s => {
        db = s.db(db_name)
    })
    .catch(err => {
        console.error(err)
    })

// Insert a new document
//
// collection | String | Name of the collection
// obj | Object | Object to insert
module.exports.insert = (collection, obj) => {
    return new Promise((resolve, reject) => {
        db.collection(collection).insertOne(obj)
            .then(res => resolve(obj))
    })
}

// Returns all documents matching a query
//
// collection | String | Name of the collection
// query | Object | Values to search for
module.exports.query = (collection, query) => {
    return new Promise((resolve, reject) => {
        if (query._id) {
            try {
                query._id = new ObjectId(query._id)
            } catch (error) {
                return reject()
            }
        }
        let res = db.collection(collection).find(query)
        if (!res) return resolve()
        res.toArray()
            .then(resArray => resolve(resArray))
    })
}

// Returns one document matching a query
//
// collection | String | Name of the collection
// query | Object | Values to search for
module.exports.queryOne = (collection, query) => {
    return new Promise((resolve, reject) => {
        if (query._id) {
            try {
                query._id = new ObjectId(query._id)
            } catch (error) {
                return reject()
            }
        }
        db.collection(collection).findOne(query)
            .then(res => {
                if (!res) return resolve()
                resolve(res)
            })
    })
}

// Updates a document
//
// collection | String | Name of the collection
// query | Object | Values to search for
// newvals | Object | Values to add/overwrite
module.exports.update = (collection, query, newvals) => {
    return new Promise((resolve, reject) => {
        let obj = { $set: newvals }
        db.collection(collection).updateOne(query, obj)
            .then(res => resolve(res))
    })
}

// Deletes a document
//
// collection | String | Name of the collection
// query | Object | Values to search for
module.exports.delete = (collection, query) => {
    return new Promise((resolve, reject) => {
        db.collection(collection).deleteOne(query)
            .then(res => resolve(res))
    })
}