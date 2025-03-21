/**
 * Copyright: Christian Weber
 */

'use strict';

const redis = require('redis');
const { promisify } = require('util');
const { v4: uuidv4 } = require('uuid');

class RedisPersistency {
  /**
   * Create a new RedisPersistency instance.
   * @param {Object} config - The configuration object for the Redis connection.
   * Expected properties could include host, port, password, etc.
   */
  constructor(config) {
    // Create a Redis client using the provided configuration.
    this.client = redis.createClient(config);

    // Promisify Redis commands for async/await usage.
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
    this.keysAsync = promisify(this.client.keys).bind(this.client);
    this.mgetAsync = promisify(this.client.mget).bind(this.client);
  }

  /**
   * Save a new process document.
   * @param {Object} doc - The process document to save.
   * @param {Function} callback - Callback function (err, result).
   */
  async save(doc, callback) {
    try {
      // Ensure the document has an id; generate one if it doesn't.
      const id = doc.id || uuidv4();
      doc.id = id;
      const key = `process_instance:${id}`;
      // Store the document as a JSON string.
      await this.setAsync(key, JSON.stringify(doc));
      callback(null, doc);
    } catch (err) {
      callback(err);
    }
  }

  /**
   * Retrieve a process document by its id.
   * @param {String} id - The identifier of the process document.
   * @param {Function} callback - Callback function (err, result).
   */
  async get(id, callback) {
    try {
      const key = `process_instance:${id}`;
      const data = await this.getAsync(key);
      if (!data) {
        return callback(null, null);
      }
      callback(null, JSON.parse(data));
    } catch (err) {
      callback(err);
    }
  }

  /**
   * Update an existing process document.
   * @param {Object} doc - The updated process document (must contain an id).
   * @param {Function} callback - Callback function (err, result).
   */
  async update(doc, callback) {
    try {
      if (!doc.id) {
        throw new Error('Document must have an id to be updated.');
      }
      const key = `process_instance:${doc.id}`;
      await this.setAsync(key, JSON.stringify(doc));
      callback(null, doc);
    } catch (err) {
      callback(err);
    }
  }

  /**
   * Remove a process document by its id.
   * @param {String} id - The identifier of the process document to remove.
   * @param {Function} callback - Callback function (err).
   */
  async remove(id, callback) {
    try {
      const key = `process_instance:${id}`;
      await this.delAsync(key);
      callback(null);
    } catch (err) {
      callback(err);
    }
  }

  /**
   * List all stored process documents.
   * @param {Function} callback - Callback function (err, results).
   */
  async list(callback) {
    try {
      // Get all keys matching the process instance pattern.
      const keys = await this.keysAsync('process_instance:*');
      if (keys.length === 0) {
        return callback(null, []);
      }
      // Retrieve all documents using MGET.
      const docs = await this.mgetAsync(keys);
      const result = docs.map(doc => JSON.parse(doc));
      callback(null, result);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = RedisPersistency;
