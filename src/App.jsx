import { useEffect, useRef, useState } from "react";

function App() {
  const [filteredImage, setFilteredImage] = useState(null);
  const workerRef = useRef(null);

  useEffect(() => {
    // Initialize worker once
    workerRef.current = new Worker(new URL("./worker.js", import.meta.url));

    // Attach listener once
    workerRef.current.onmessage = (event) => {
      const { data } = event;
      const canvas = document.createElement("canvas");
      const context = canvas.getContext("2d");
      canvas.width = data.width;
      canvas.height = data.height;
      context.putImageData(data, 0, 0);
      setFilteredImage(canvas.toDataURL());
    };

    // Cleanup worker on unmounting
    return () => workerRef.current.terminate();
  }, []);

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      img.onload = () => {
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d");
        context.drawImage(img, 0, 0);
        const imageData = context.getImageData(0, 0, img.width, img.height);
        workerRef.current.postMessage({ imageData });
      };
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      <h1>Image Filter App</h1>
      <input type="file" onChange={handleFileUpload} />
      {filteredImage && <img src={filteredImage} alt="Filtered Image" />}
    </div>
  );
}

export default App;
