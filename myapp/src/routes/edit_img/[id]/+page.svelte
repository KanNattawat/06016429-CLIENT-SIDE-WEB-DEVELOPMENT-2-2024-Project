<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Navbar from "../../navbar.svelte";

  let id;
  $: id = $page.params.id; // Reactive assignment

  let name = "";
  let description = "";
  let category = "";
  let categories = [
        { name: "Nature" },
        { name: "Animals" },
        { name: "Technology" },
        { name: "Architecture" },
        { name: "Food" }
    ];
  // Fetch Image Details
  async function fetchImage() {
    const res = await fetch(`http://localhost:3000/files`);
    const data = await res.json();
    const image = data.files.find((img) => img.id == id);

    if (image) {
      name = image.name;
      description = image.description;
      category = image.category;
    }
  }

  //

  onMount(() => {
    fetchImage();
    fetchCategories();
  });

  // Update Image
  async function updateImage() {
    const res = await fetch(`http://localhost:3000/image/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, category }),
    });

    if (res.ok) {
      alert("Image updated successfully!");
      goto("/"); // Redirect to homepage
    } else {
      alert("Failed to update image.");
    }
  }
</script>

<Navbar />
<!-- Edit Image Form -->
<!-- Edit Image Form -->
<div class="bg-gray-900 flex justify-center items-center min-h-screen">
  <div class="max-w-lg p-6 bg-white shadow-lg rounded-lg">
    <a href="http://localhost:5173/">Back</a>
    <h1 class="text-2xl font-bold mb-4">Edit Image</h1>

    <label class="block text-sm font-medium">Name</label>
    <input
      type="text"
      bind:value={name}
      class="w-full p-2 border rounded-md mb-4"
    />

    <label class="block text-sm font-medium">Description</label>
    <textarea bind:value={description} class="w-full p-2 border rounded-md mb-4"
    ></textarea>

    <label class="block text-sm font-medium">Category</label>
    <select bind:value={category} class="w-full p-2 border rounded-md mb-4">
      <option value="">Select Category</option>
      {#each categories as cat}
        <option value={cat.name}>{cat.name}</option>
      {/each}
    </select>

    <button
      on:click={updateImage}
      class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
    >
      Update Image
    </button>
  </div>
</div>
