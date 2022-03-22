const moment = require('moment')

function formatMessage(userName, text) {
    return {
        userName,
        text,
        time: moment().format('h:m a')
    }
}

module.exports = formatMessage