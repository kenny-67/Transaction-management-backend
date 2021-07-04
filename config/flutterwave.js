const axios = require("axios");

const FLUTTER_WAVE_BASE_URL = "https://api.flutterwave.com";
const RAVE_PAY_BASE_URL = "https://api.ravepay.co";

const headers = {
  Accept: "application/json, text/plain, */*",
  "Content-Type": "application/json",
  Authorization: `Bearer ${process.env.FLUTTER_WAVE_SECRET_KEY}`,
};
exports.flutterwaveV3Client = axios.create({
  baseURL: `${FLUTTER_WAVE_BASE_URL}/v3`,
  headers,
});

exports.ravePayV2Client = axios.create({
  baseURL: `${RAVE_PAY_BASE_URL}/v2`,
  headers,
});
