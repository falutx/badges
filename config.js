// AZURE CONNECTION
// mongodb://<cosmosdb_name>:<primary_master_key>@<cosmosdb_name>.documents.azure.com:10250/mean?ssl=true&sslverifycertificate=false


const config = {
    app: {
        port: process.env.APP_PORT || 8081
    },
    db: {
        constring: process.env.DB_CONSTRING || 'mongodb://admin:changem3@ds237489.mlab.com:37489/badges',
        port: 37489
    }
}

module.exports = config; 