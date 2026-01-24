import dotenv from "dotenv";
dotenv.config();
const trigger = "https://api.brightdata.com/datasets/v3/trigger";
const scrape = async (url) => {
  const data = JSON.stringify({
    input: [{ url: url, country: "", transcription_language: "" }],
  });

  fetch(
    `${trigger}?dataset_id=gd_lk56epmy2i5g7lzu0k&endpoint=${process.env.ENDPOINT_URL}&notify=false&format=json&uncompressed_webhook=true&force_deliver=false&include_errors=true`,
    {
      method: "POST",
      headers: {
        Authorization: "Bearer 256a68de-78a2-4c75-ac34-82dd4fee24e5",
        "Content-Type": "application/json",
      },
      body: data,
    },
  )
    .then((response) => response.json())
    .then((data) => console.log(data))
    .catch((error) => console.error("Error:", error));
};

scrape("https://www.youtube.com/watch?v=j2lGFm1i91s");
