const low = require('lowdb')
const FileSync = require('lowdb/adapters/FileSync')

const adapter = new FileSync('db.test.json')
const db = low(adapter)
const { execSync } = require('child_process');

module.exports = {
    seed: function(state) {
        db.setState(state).write()
    },
    rbSeed: function(state) {
        execSync('bundle exec rake seed')
    }
}

module.exports.rbSeed({})