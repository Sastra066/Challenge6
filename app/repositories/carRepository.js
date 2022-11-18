const { cars } = require("../models");

module.exports = {
  create(createArgs) {
    return cars.create(createArgs);
  },

  update(id, updateArgs) {
    return cars.update(updateArgs, {
      where: {
        id,
      },
    });
  },

  delete(id) {
    return cars.destroy({  
      where: {id: id},
      });
  },

  find(id) {
    return cars.findByPk(id);
  },

  findAll() {
    return cars.findAll();
  },

  getTotalCars() {
    return cars.count();
  },
};
