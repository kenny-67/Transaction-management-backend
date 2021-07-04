const { flutterwaveV3Client } = require("./flutterwave");
const uuid = require("uuid");

const uuidGenerator = uuid.v4;

const generatepaymentlink = async (paymentInfo, callbackURL, redirectURL) => {
  const {
    amount,
    email,
    phonenumber,
    name,
    userId,
    currency = "NGN",
    transactionInfo: { title, description },
    meta,
  } = paymentInfo;
  const transactionReference = uuidGenerator();
  try {
    const requestBody = {
      tx_ref: transactionReference,
      amount,
      currency,
      payment_options: "ussd,card",
      country: "NG",
      redirect_url: callbackURL,
      customer: {
        email,
        phonenumber,
        name,
      },
      meta: {
        reference: transactionReference,
        userId,
        frontendRedirectURL: redirectURL,
        ...meta,
      },
      customizations: {
        title,
        description,
      },
    };
    console.log(requestBody);
    const response = await flutterwaveV3Client.post("/payments", requestBody);
    const data = await response.data;

    return [
      true,
      {
        ...data,
        reference: transactionReference,
      },
    ];
  } catch (error) {
    console.error(error);
    return [
      false,
      {
        message: "An error occured while generating link",
      },
    ];
  }
};

const validatePayment = async (transactionId) => {
  const VERIFY_PATH = `/transactions/${transactionId}/verify`;
  try {
    const response = await flutterwaveV3Client.get(VERIFY_PATH);
    const data = await response.data;
    return [true, data];
  } catch (error) {
    const response = await error.response;
    return [false, response.data, response.status];
  }
};

module.exports = {
  validatePayment: validatePayment,
  generatepaymentlink: generatepaymentlink,
};
