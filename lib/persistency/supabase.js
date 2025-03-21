/**
 * Copyright: Christian Weber
 */

'use strict';

const { createClient } = require('@supabase/supabase-js');
const { v4: uuidv4 } = require('uuid'); // For generating unique IDs

class SupabasePersistency {
  /**
   * Create a new SupabasePersistency instance.
   * @param {Object} config - The configuration object including supabaseUrl and supabaseKey.
   */
  constructor(config) {
    // The configuration should include:
    // - supabaseUrl: Your Supabase project URL
    // - supabaseKey: Your Supabase API key
    this.supabase = createClient(config.supabaseUrl, config.supabaseKey);
  }

  /**
   * Save a new process document.
   * @param {Object} doc - The process document to save.
   * @param {Function} callback - Callback function (err, result).
   */
  async save(doc, callback) {
    try {
      // Ensure the document has an id; generate one if not
      const id = doc.id || uuidv4();
      doc.id = id;
      const { data, error } = await this.supabase
        .from('process_instances')
        .insert([{ id, doc }])
        .select();
      if (error) {
        throw error;
      }
      callback(null, data[0]);
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
      const { data, error } = await this.supabase
        .from('process_instances')
        .select('*')
        .eq('id', id);
      if (error) {
        throw error;
      }
      callback(null, data[0]);
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
      // We update the document and update the updated_at column via the trigger or explicitly here
      const { data, error } = await this.supabase
        .from('process_instances')
        .update({ doc, updated_at: new Date().toISOString() })
        .eq('id', doc.id)
        .select();
      if (error) {
        throw error;
      }
      callback(null, data[0]);
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
      const { error } = await this.supabase
        .from('process_instances')
        .delete()
        .eq('id', id);
      if (error) {
        throw error;
      }
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
      const { data, error } = await this.supabase
        .from('process_instances')
        .select('*');
      if (error) {
        throw error;
      }
      callback(null, data);
    } catch (err) {
      callback(err);
    }
  }
}

module.exports = SupabasePersistency;
