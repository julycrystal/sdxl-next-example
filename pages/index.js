import { useState } from "react";

async function getBase64Encoded(file) {
  if (!file) {
    return Promise.resolve(null);
  }

  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => {
      const base64Data = reader.result;
      resolve(base64Data);
    };
    reader.onerror = (error) => {
      reject(error);
    };
    reader.readAsDataURL(file);
  });
}

const MyPage = () => {
  const [prompt, setPrompt] = useState("");
  const [id, setId] = useState(null);
  const [imageUrl, setImageUrl] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const image = await getBase64Encoded(selectedFile);

    // Send the prompt to the backend and get back an ID
    const response = await fetch("/api/generate", {
      method: "POST",
      headers: {
        "Content-type": "application/json",
      },
      body: JSON.stringify({ prompt, image }),
    });
    const { id } = await response.json();
    setId(id);

    // Poll the backend for the image URL
    const pollInterval = setInterval(async () => {
      const imageResponse = await fetch(`/api/image?id=${id}`);
      const { output } = await imageResponse.json();
      if (output && output.length > 0) {
        const url = output[0];
        setImageUrl(url);
        clearInterval(pollInterval);
      }
    }, 1000);
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];

    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  return (
    <div className="container">
      <h1 className="title">SDXL Evaluator</h1>
      <form onSubmit={handleSubmit}>
        <label className="form-file">
          <span className="form-label-text">Image (optional):</span>
          <input type="file" onChange={handleFileChange} accept="image/*" />
          {selectedFile && <p>Selected file: {selectedFile.name}</p>}
        </label>

        <label className="form-label">
          <span className="form-label-text">Prompt:</span>
          <textarea
            required
            className="form-textarea"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
          />
        </label>

        <button className="form-button" type="submit">
          Generate
        </button>
      </form>
      {imageUrl && <img className="image" src={imageUrl} />}
      <style jsx>{`
        .container {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        form {
          width: 500px;
        }
        .title {
          font-size: 2rem;
          margin-bottom: 2rem;
        }
        .form-label {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
        }
        .form-label-text {
          font-size: 1.2rem;
          margin-bottom: 0.5rem;
        }
        .form-textarea {
          height: 10rem;
          padding: 0.5rem;
          font-size: 1.2rem;
          border: 1px solid #ccc;
          border-radius: 0.25rem;
        }
        .form-button {
          padding: 0.5rem;
          font-size: 1.2rem;
          border: none;
          border-radius: 0.25rem;
          background-color: #0070f3;
          color: #fff;
          cursor: pointer;
        }
        .form-button:hover {
          background-color: #0053ad;
        }
        input[type="file"] {
          display: none;
        }
        .form-file {
          border: 1px solid #ccc;
          display: inline-block;
          padding: 6px 12px;
          cursor: pointer;
        }
        .image {
          margin-top: 2rem;
          max-width: 100%;
        }
      `}</style>
    </div>
  );
};

export default MyPage;
