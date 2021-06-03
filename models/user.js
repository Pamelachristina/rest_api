'use strict';
const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');


module.exports = (sequelize) => {
  class User extends Model {}
  User.init({
    firstName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A first name is required'
        },
        notEmpty: {
          msg: 'Please provide a first name'
        }
      }
    },
    lastName: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'A last name is required'
        },
        notEmpty: {
          msg: 'Please provide a last name'
        }
      }
    },
    password: {
      type: DataTypes.STRING,  
      allowNull: false,
      set(val) {
        if (val) {
          const hashedPassword = bcrypt.hashSync(val, 10);
          this.setDataValue('password', hashedPassword);
        }
      },
      validate: {
        notNull: {
          msg: 'A password is required'
        },
        notEmpty: {
          msg: 'Please provide a password'
        },
       
      }
    },
    emailAddress: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        notNull: {
          msg: 'An email is required'
        }
      }
    }
  }, { sequelize });
  

  User.associate = (models) => {
      // TODO add associations 
      User.hasMany(models.Course, {
        foreignKey: 'userId'
      });
  };


  return User;
};