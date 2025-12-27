import { useRef, useState } from "react";

function App() {
  const [filteredImage, setFilteredImage] = useState(null);

  const workerRef = useRef(new Worker(new URL("./worker.js")), import.meta.url);

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

  workerRef.current.onmessage = (event) => {
    const { data } = event;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.putImageData(data, 0, 0);
    setFilteredImage(canvas.toDataURL());
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
