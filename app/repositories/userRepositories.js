const { users }  = require("../models");

module.exports = {

  create(createArgs) {
    return users.create(createArgs);
  },

  update(id, updateArgs) {
    return users.update(updateArgs, {
      where: {
        id,
      },
    });
  },

  delete(id) {
    return users.destroy(id);
  },

  findByPk(id) {
    return users.findByPk(id);
  },

  findOne(id) {
    return users.findOne(id);
  },

  findAll() {
    return users.findAll();
  },

  getTotalUsers() {
    return users.count();
  },
};
