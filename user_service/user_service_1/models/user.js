module.exports = (sequelize, types) => {
  const User = sequelize.define(
    'users',
    {
      id: {
        type: types.UUID,
        defaultValue: types.UUIDV1,
        primaryKey: true
      },

      username: {
        type: types.STRING(30),
        allowNull: false,
      },

      password: {
        type: types.STRING(30),
        allowNull: false,
      },
    },
    {
      charset: 'utf8',
      collate: 'utf8_unicode_ci',
    },
  );
  return User;
};