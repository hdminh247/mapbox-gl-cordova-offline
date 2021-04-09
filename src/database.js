class Database {

    static openDatabase(dbLocation) {
        const dbName = dbLocation.split("/").slice(-1)[0]; // Get the DB file basename
        const source = this;
        if ('sqlitePlugin' in self) {
            if('device' in self) {
                return new Promise(function (resolve, reject) {
                    if(device.platform === 'Android') {
                        resolveLocalFileSystemURL(cordova.file.applicationStorageDirectory, function (dir) {
                            dir.getDirectory('databases', {create: true}, function (subdir) {
                                resolve(subdir);
                            });
                        }, reject);
                    } else if(device.platform === 'iOS') {
                        resolveLocalFileSystemURL(cordova.file.documentsDirectory, resolve, reject);
                    } else {
                        reject("Platform not supported");
                    }
                }).then(function (targetDir) {
                    return new Promise(function (resolve, reject) {
                        targetDir.getFile(dbName, {}, resolve, reject);
                    }).catch(function () {
                        return source.copyDatabaseFile(dbLocation, dbName, targetDir)
                    });
                }).then(function () {
                    var params = {name: dbName};
                    if(device.platform === 'iOS') {
                        params.iosDatabaseLocation = 'Documents';
                    } else {
                        params.location = 'default';
                    }

                    console.log(`>>CORDOVA: Opening database at ${dbLocation}`)
                    return sqlitePlugin.openDatabase(params);
                });
            } else {
                return Promise.reject(new Error("cordova-plugin-device not available. " +
                    "Please install the plugin and make sure this code is run after onDeviceReady event"));
            }
        } else {
                // Electron app
                if(isType && isType('electron')){
                    let instance = null;
                    var mapDb = sqlite3.verbose();

                    console.log(`>>ELECTRON: Opening database at ${dbLocation}`)

                    instance =  new mapDb.Database(dbLocation, (err) => {
                        if (err) {
                            console.log(`>> ERROR: ${err.message}`)
                        }
                    });

                    return (instance)
                }else{
                    return Promise.reject(new Error("cordova-sqlite-ext plugin not available. " +
                        "Please install the plugin and make sure this code is run after onDeviceReady event"));
                }
        }
    }

    static copyDatabaseFile(dbLocation, dbName, targetDir) {
        console.log("Copying database to application storage directory");
        return new Promise(function (resolve, reject) {
            const absPath =  cordova.file.applicationDirectory + 'www/' + dbLocation;
            console.log(`Mapbox GL is opening: ${dbLocation}`)
            resolveLocalFileSystemURL(dbLocation, resolve, reject);
        }).then(function (sourceFile) {
            return new Promise(function (resolve, reject) {
                sourceFile.copyTo(targetDir, dbName, resolve, reject);
            }).then(function () {
                console.log("Database copied");
            });
        });
    }
}

export default Database
