const modelVersion =
  "39ed52f2a78e934b3ba6e2a89f5b1c712de7dfea535525255b1aa35c5565e08b";

export default async function handler(req, res) {
  let response = "";

  let inputObj = {
    image: req.body.image,
    prompt: req.body.prompt,
    refine_steps: 50,
    guidance_scale: 7.5,
    high_noise_frac: 0.8,
    prompt_strength: 0.95,
    num_inference_steps: 50,
    num_outputs: 1,
    refine: "base_image_refiner",
    scheduler: "KarrasDPM",
  };

  console.log("Doing prediction with this data:");
  console.log(inputObj);

  try {
    response = await fetch("https://api.replicate.com/v1/predictions", {
      method: "POST",
      headers: {
        Authorization: `Token ${process.env.NEXT_PUBLIC_REPLICATE_API_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        version: modelVersion,
        input: inputObj,
      }),
    });
  } catch (err) {
    console.error("Error sending request to Replicate");
    console.log(err);
    res.statusCode = 500;
    return res.end(JSON.stringify({ detail: err.detail }));
  }

  if (response.status !== 201) {
    let error = await response.json();
    res.statusCode = 500;
    res.end(JSON.stringify({ detail: error.detail }));
    return;
  }

  const prediction = await response.json();

  res.statusCode = 201;
  res.end(JSON.stringify(prediction));
}
