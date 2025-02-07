<script>
  import { onMount } from 'svelte';

  let images = [];
  let selectedImage = null;

  // Fetch the list of images from the server
  async function fetchImages() {
  try {
    const response = await fetch("http://localhost:3000/files");
    if (response.ok) {
      const result = await response.json();
      images = result.files.map(file => `${file}`);
    } else {
      alert("Failed to fetch images!");
    }
  } catch (error) {
    alert("Error fetching images: " + error);
  }
}

  
  // Fetch images when the component is mounted
  onMount(() => {
    fetchImages();
  });

  function Test() {
    console.log("Hello");
  }
  
  // Function to handle file upload
  async function handleUpload() {
    const input = document.querySelector(".upload");
    const files = input.files;

    if (files.length === 0) {
      alert("Please select files to upload.");
      return;
    }

    const formData = new FormData();
    for (let file of files) {
      formData.append("images", file);
    }

    try {
      const response = await fetch("http://localhost:3000/upload", {
        method: "POST",
        body: formData
      });

      const result = await response.json();

      if (response.ok) {
        images = [...images, ...result.files.map(file => `/uploads/${file.filename}`)];
        
        // Clear the file input
        input.value = "";
      } else {
        alert("Upload failed!");
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      alert("An error occurred while uploading.");
    }
  }

  // Open the selected image in full-screen preview
  function openImage(url) {
    selectedImage = url;
  }

  // Close the image preview
  function closePreview() {
    selectedImage = null;
  }
</script>

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
    justify-content: center;
    align-items: center;
  }
  .preview img {
    max-width: 90%;
    max-height: 90%;
  }
</style>

<!-- File input for uploading images -->
<input class="upload" type="file" multiple accept="image/*" />
<button on:click={handleUpload}>Upload</button>

<!-- Display uploaded images in a grid -->
<div class="gallery">
  {#each images as img}
    <img src={img} alt="Uploaded image" on:click={() => openImage(img)} />
  {/each}
</div>

<!-- Full-screen image preview -->
{#if selectedImage}
  <div class="preview" on:click={closePreview}>
    <img src={selectedImage} alt="Preview" />
  </div>
{/if}
