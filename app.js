const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const http = require("http");
const morgan = require("morgan");

require("dotenv").config();

//initialize express
const app = express();

//route import
const userRoutes = require("./routes/users");
const warehouseRoutes = require("./routes/warehouse");
const storeRoutes = require("./routes/store");
const productRoutes = require("./routes/product");
const employeeRoutes = require("./routes/employee")

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/kenStores", {
    useNewUrlParser: true,
    useFindAndModify: false,
    useUnifiedTopology: true,
    useCreateIndex: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.log(err));

//initializing cors
app.use(cors());

//morgan middleware for logging
app.use(morgan("dev"));

//setting up express to parse incoming json body
app.use("/public", express.static("public"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

//setting up routes
app.get("/", (req, res) => {
  res.status(200).send("Hello World!");
});
app.use("/api/users", userRoutes);
app.use("/api/warehouse", warehouseRoutes);
app.use("/api/store", storeRoutes);
app.use("/api/product", productRoutes);
app.use("/api/employee", employeeRoutes )

//Error handling
app.use((req, res, next) => {
  const error = new Error("Not Found");
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});

//settiing up the server
const PORT = process.env.PORT || 5000;
http.createServer({}, app).listen(PORT, function () {
  console.log(`App listening on port ${PORT}`);
});
