import dotenv from "dotenv";
dotenv.config();
const trigger = "https://api.brightdata.com/datasets/v3/trigger";
export const scrape = async (url) => {
  const data = JSON.stringify({
    input: [{ url: url, country: "", transcription_language: "" }],
  });
  console.log("SCRAPE REQUEST DATA:", data);
  const info = await fetch(
    `${trigger}?dataset_id=gd_lk56epmy2i5g7lzu0k&endpoint=${encodeURIComponent(process.env.ENDPOINT_URL)}&notify=false&format=json&uncompressed_webhook=true&force_deliver=false&include_errors=true`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SCRAPER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: data,
    },
  );
  const response = await info.json();
  console.log("SCRAPE RESPONSE:", response);
  return response.snapshot_id;
};

// scrape("https://www.youtube.com/watch?v=j2lGFm1i91s");
