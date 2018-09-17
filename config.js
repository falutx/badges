// AZURE CONNECTION
// mongodb://<cosmosdb_name>:<primary_master_key>@<cosmosdb_name>.documents.azure.com:10250/mean?ssl=true&sslverifycertificate=false


const config = {
    app: {
        port: process.env.APP_PORT || 3000
    },
    db: {
        constring: process.env.DB_CONSTRING || 'mongodb://localhost/badges',
        port: 27017
    }
}

module.exports = config; 