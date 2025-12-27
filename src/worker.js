self.onmessage = (event) => {
  const { imageData } = event.data;
  const grayscaleImageData = applyGrayscaleFilter(imageData);
  self.postMessage(grayscaleImageData, [grayscaleImageData.data.buffer]);
};

function applyGrayscaleFilter(imageData) {
  const { data } = imageData;
  for (let i = 0; i < data.length; i += 4) {
    const avg = (data[i] + data[i + 1] + data[i + 2]) / 3;
    data[i] = avg;
    data[i + 1] = avg;
    data[i + 2] = avg;
  }
  return imageData;
}
