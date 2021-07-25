//get best selling products
const checkDuplicate = (array, obj) => {
  for (let i = 0; i < array.length; i++) {
    console.log(array[i].productId, obj.productId);
    if (array[i].productName == obj.productName) {
      return true;
    }
  }
  return false;
};

const updateObjects = (objects, product) => {
  return objects.map((object) => {
    object.quantity += +product.quantity;
    object.price += +product.price;
    return object;
  });
};

const someFunction = async () => {
  let product = [
    {
      productId: "609bbd53b7aec13444cbb329",
      productName: "Soap",
      quantity: 10,
      price: 1000,
    },
    {
      productId: "609bbd53b7aec13444cbb329",
      productName: "Soap",
      quantity: 2,
      price: 600,
    },
    {
      productId: "609bbddfb7aec13444cbb32a",
      productName: "Cream",
      quantity: 2,
      price: 240,
    },
  ];

  let best = [];

  await product.forEach(async (product) => {
    //check if the product exist

    if (!checkDuplicate(best, product)) {
      console.log(false);
      best.push(product);
    } else {
      console.log(true);
      best = updateObjects(best, product);
    }
  });
  console.log(best);
};

someFunction();
