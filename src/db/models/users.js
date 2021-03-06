import bcrypt from 'bcrypt';
import eventEmitter from '../../helpers/eventEmitter';

export default (sequelize, DataTypes) => {
  const Users = sequelize.define(
    'Users',
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: {
          args: true
        }
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: {
          args: true
        }
      },
      username: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: {
          args: false,
          message: 'Please enter your username'
        }
      },
      email: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: {
          args: false,
          message: 'Please enter your email'
        }
      },
      bio: DataTypes.STRING,
      image: DataTypes.STRING,
      favorites: [
        {
          type: DataTypes.STRING,
          allowNull: {
            args: true
          }
        }
      ],
      following: [
        {
          type: DataTypes.INTEGER,
          allowNull: {
            args: true
          }
        }
      ],
      isVerified: {
        type: DataTypes.BOOLEAN
      },
      socialId: {
        allowNull: {
          args: true
        },
        type: DataTypes.STRING
      },
      provider: {
        allowNull: {
          args: true
        },
        type: DataTypes.STRING
      },
      role: {
        type: DataTypes.STRING,
        allowNull: {
          args: true
        }
      },
      hash: {
        allowNull: {
          args: true
        },
        type: DataTypes.STRING
      },
      role: {
        allowNull: {
          args: true
        },
        type: DataTypes.STRING
      }
    },
    {
      hooks: {
        beforeCreate: async (user) => {
          user.hash = await bcrypt.hashSync(user.hash, 8);
        },
        afterCreate: async (user) => {
          const userData = user.dataValues;
          const userConfig = {
            inApp: {
              articles: {
                show: true,
                on: ['publish', 'comment', 'like']
              }
            },
            email: {
              articles: {
                show: true,
                on: ['publish']
              }
            }
          };
          const settings = {
            userId: userData.id,
            config: JSON.stringify(userConfig)
          };
          eventEmitter.emit('create default notification configuration', settings);
        }
      },
      instanceMethods: {
        async validatePassword(hash) {
          return await bcrypt.compareSync(hash, this.password);
        }
      }
    }
  );
  Users.associate = function (models) {
    // associations can be defined here
    Users.hasMany(models.Articles, {
      as: 'author',
      foreignKey: 'authorId'
    });
    Users.hasMany(models.Followers, {
      foreignKey: 'follower',
      onDelete: 'CASCADE'
    });
    Users.hasMany(models.Followers, {
      foreignKey: 'followee',
      onDelete: 'CASCADE'
    });
    Users.hasMany(models.Notifications, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
    Users.hasMany(models.NotificationConfigs, {
      foreignKey: 'userId',
      onDelete: 'CASCADE'
    });
    Users.hasMany(models.Comments, {
      foreignKey: 'user',
      onDelete: 'CASCADE'
    });
  };
  return Users;
};
