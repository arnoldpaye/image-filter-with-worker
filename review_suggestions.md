### Code Review: Image Filter App (Web Workers)

This review covers `src/App.jsx` and `src/worker.js`. The application uses a Web Worker to process image data off the main thread to apply a grayscale filter.

---

#### 1. Performance Improvements

**A. Use Transferable Objects**
- **Issue:** Currently, `imageData` is being copied between the main thread and the worker. For large images, this can be slow and memory-intensive.
- **Suggestion:** Use "Transferable Objects" to transfer the underlying `ArrayBuffer` without copying.
- **Code Change (`App.jsx`):**
  ```javascript
  workerRef.current.postMessage({ imageData }, [imageData.data.buffer]);
  ```
- **Code Change (`worker.js`):**
  ```javascript
  self.postMessage(grayscaleImageData, [grayscaleImageData.data.buffer]);
  ```

**B. Canvas Optimization**
- **Issue:** In `App.jsx`, a new `canvas` element is created every time an image is uploaded and every time a message is received from the worker.
- **Suggestion:** Reuse a hidden canvas or draw directly to an on-screen canvas if possible to reduce garbage collection overhead.

**C. Grayscale Algorithm**
- **Issue:** The current algorithm uses a simple average: `(R + G + B) / 3`.
- **Suggestion:** For more accurate "perceptual" grayscale, use weighted values (Luma): `0.299R + 0.587G + 0.114B`.

---

#### 2. Reliability & Error Handling

**A. Worker Error Handling**
- **Issue:** There is no `onerror` listener on the worker. If something goes wrong inside `worker.js`, the UI will stay silent.
- **Suggestion:** Add an error listener in `useEffect`.
  ```javascript
  workerRef.current.onerror = (err) => {
    console.error("Worker error:", err);
  };
  ```

**B. File Validation**
- **Issue:** `handleFileUpload` assumes the user always selects a valid image.
- **Suggestion:** Add checks for file existence and MIME type (e.g., `file.type.startsWith('image/')`).

**C. Canvas Sizing**
- **Issue:** In `handleFileUpload`, `context.drawImage(img, 0, 0)` is called without setting `canvas.width` and `canvas.height` first. By default, canvas size is 300x150, which might crop the image.
- **Suggestion:**
  ```javascript
  canvas.width = img.width;
  canvas.height = img.height;
  context.drawImage(img, 0, 0);
  ```

---

#### 3. Code Quality & Cleanliness

**A. Separation of Concerns**
- **Issue:** `App.jsx` handles file reading, image loading, canvas manipulation, and worker coordination.
- **Suggestion:** Extract the image-to-ImageData and ImageData-to-DataURL logic into utility functions.

**B. Consistency in Worker Communication**
- **Issue:** `App.jsx` sends `{ imageData }` (wrapped in an object), but `worker.js` sends back just `grayscaleImageData` (the raw ImageData object).
- **Suggestion:** Use a consistent wrapper object for messages to make it easier to add more metadata (like filter type or processing time) later.

---

#### 4. Summary of Recommended Changes

| File | Type | Suggestion |
| :--- | :--- | :--- |
| `App.jsx` | Bug | Set canvas dimensions before `drawImage`. |
| `App.jsx` | Perf | Implement Transferable Objects for `postMessage`. |
| `App.jsx` | UX | Add `onerror` handler for the Worker. |
| `worker.js` | Alg | Use Luma weights for grayscale. |
| `worker.js` | Perf | Return ImageData using Transferable Objects. |
