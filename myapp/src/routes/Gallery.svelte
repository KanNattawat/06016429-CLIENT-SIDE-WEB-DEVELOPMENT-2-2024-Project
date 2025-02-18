<script>
  import { onMount } from "svelte";

  let images = [];
  let selectedImage = null;
  let selectedImageId = null;

  async function fetchImages() {
    try {
      const response = await fetch("http://localhost:3000/files");
      if (response.ok) {
        const result = await response.json();
        images = result.files.map((file) => ({
          id: file.id,
          url: file.filepath,
          name: file.name, // Assuming the response includes `name` and `description`
          description: file.description,
        }));
      } else {
        alert("Failed to fetch images!");
      }
    } catch (error) {
      alert("Error fetching images: " + error);
    }
  }

  onMount(fetchImages);

  async function deleteImage(id) {
    if (!confirm("Are you sure you want to delete this image?")) return;
    try {
      const response = await fetch(`http://localhost:3000/delete/${id}`, {
        method: "DELETE",
      });
      if (response.ok) {
        images = images.filter((img) => img.id !== id);
        closePreview();
      } else {
        alert("Failed to delete image!");
      }
    } catch (error) {
      alert("Error deleting image: " + error);
    }
  }

  function openImage(url, id, name, description) {
    selectedImage = { url, id, name, description };
    selectedImageId = id;
  }

  function closePreview() {
    selectedImage = null;
    selectedImageId = null;
  }
</script>

<div class="gallery">
  {#each images as img (img.id)}
  <div class="image-container">
    <img src={img.url} alt="Uploaded image" on:click={() => openImage(img.url, img.id, img.name, img.description)} />
  </div>
{/each}

</div>

{#if selectedImage}
  <div class="preview" on:click={closePreview}>
    <img src={selectedImage.url} alt="Preview" />
    <div>
      <h3>{selectedImage.name}</h3>
      <p>{selectedImage.description}</p>
    </div>
    <button on:click={() => deleteImage(selectedImageId)}>Delete</button>
  </div>
{/if}

<style>
  .gallery {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
    gap: 10px;
    padding: 20px;
  }
  .gallery img {
    width: 100%;
    height: auto;
    cursor: pointer;
    border-radius: 5px;
    transition: transform 0.3s;
  }
  .gallery img:hover {
    transform: scale(1.05);
  }
  .upload {
    margin: 20px;
    padding: 10px;
  }
  .preview {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: flex-start;  /* Align content to the top */
  align-items: center;
  padding: 20px;
  overflow-y: auto; /* Make the preview scrollable */
}

.preview img {
  max-width: 90%;
  max-height: 70vh; /* Adjust this to control the image size in the preview */
  margin-bottom: 20px; /* Add space below the image */
}

.preview div {
  color: white; /* Make text readable on dark background */
  text-align: center;
  margin-bottom: 20px;
}

.preview h3 {
  font-size: 1.5rem;
  margin: 10px 0;
}

.preview p {
  font-size: 1rem;
  margin: 5px 0;
}

.preview button {
  margin-top: 10px;
  background: red;
  color: white;
  border: none;
  padding: 10px;
  cursor: pointer;
  border-radius: 5px;
}
</style>
