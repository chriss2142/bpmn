/**
 * Copyright: E2E Technologies Ltd, Christian Weber
 */
"use strict";

var FilePersistency = require('./file.js').Persistency;
var MongoDBPersistency = require('./mongodb.js').Persistency;
var PostgresPersistency = require('./postgresql.js').Persistency;
var SupabasePersistency = require('./supabase.js').Persistency;
var RedisPersistency = require('./redis.js').Persistency;

/**
 * @param {{uri: String, ...}} options
 * @constructor
 */
var Persistency = exports.Persistency = function(options) {
    if (!options || !options.uri) {
        throw new Error("Persistency options must contain an uri property.");
    }
    
    var uri = options.uri;
    // Decide which implementation to use based on the URI scheme
    if (uri.indexOf('mongodb://') === 0) {
        this.implementation = new MongoDBPersistency(uri, options);
    } else if (uri.indexOf('postgres://') === 0) {
        // For PostgreSQL, the options object should include connection settings.
        this.implementation = new PostgresPersistency(options);
    } else if (uri.indexOf('supabase://') === 0) {
        // For Supabase, provide supabaseUrl and supabaseKey in options.
        this.implementation = new SupabasePersistency(options);
    } else if (uri.indexOf('redis://') === 0) {
        // For Redis, connection details are also passed in options.
        this.implementation = new RedisPersistency(options);
    } else {
        // Fallback: use file-based persistency (assumes uri is a file path)
        this.implementation = new FilePersistency(uri);
    }
};

/**
 * Persist the given process data.
 * @param {{processInstanceId: String}} persistentData
 * @param {Function} done
 */
Persistency.prototype.persist = function(persistentData, done) {
    this.implementation.persist(persistentData, done);
};

/**
 * Load a process document by processId and processName.
 * @param {String} processId
 * @param {String} processName
 * @param {Function} done
 */
Persistency.prototype.load = function(processId, processName, done) {
    this.implementation.load(processId, processName, done);
};

/**
 * Load all process documents by processName.
 * @param {String} processName
 * @param {Function} done
 */
Persistency.prototype.loadAll = function(processName, done) {
    this.implementation.loadAll(processName, done);
};

/**
 * Close any underlying connections.
 * @param {Function} done
 */
Persistency.prototype.close = function(done) {
    this.implementation.close(done);
};
