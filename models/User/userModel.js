const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const baseSchema = require('../BaseModel');

const addBaseSchema = (schema) => {
  schema.add(baseSchema);
  return schema;
};

const UserSchema = Schema({
  name: { type: String, required: true },
  last_name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  rol: { type: String, required: true },
  password: { type: String, required: true },
  is_staff: { type: Boolean, default: false },
});

addBaseSchema(UserSchema);

module.exports = {
  User: mongoose.model('User', UserSchema),
};
