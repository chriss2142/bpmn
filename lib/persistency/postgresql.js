/**
 * Copyright: Christian Weber
 */

'use strict';

const { Pool } = require('pg');
const { v4: uuidv4 } = require('uuid'); // To generate unique IDs if needed

class PostgresPersistency {
  /**
   * Create a new PostgresPersistency instance.
   * @param {Object} config - The configuration object for the PostgreSQL connection.
   */
  constructor(config) {
    // config should include connection details (host, port, user, password, database, etc.)
    this.config = config;
    this.pool = new Pool(this.config);
  }

  /**
   * Save a new process document.
   * @param {Object} doc - The process document to save.
   * @param {Function} callback - Callback function (err, result).
   */
  async save(doc, callback) {
    try {
      // Ensure the document has an id (or generate one)
      const id = doc.id || uuidv4();
      doc.id = id;
      const query = `INSERT INTO process_instances (id, doc) VALUES ($1, $2) RETURNING *`;
      const result = await this.pool.query(query, [id, doc]);
      callback(null, result.rows[0]);
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
      const query = `SELECT * FROM process_instances WHERE id = $1`;
      const result = await this.pool.query(query, [id]);
      callback(null, result.rows[0]);
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
      const query = `UPDATE process_instances SET doc = $1, updated_at = NOW() WHERE id = $2 RETURNING *`;
      const result = await this.pool.query(query, [doc, doc.id]);
      callback(null, result.rows[0]);
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
      const query = `DELETE FROM process_instances WHERE id = $1`;
      await this.pool.query(query, [id]);
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
      const query = `SELECT * FROM process_instances`;
      const result = await this.pool.query(query);
      callback(null, result.rows);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = PostgresPersistency;
