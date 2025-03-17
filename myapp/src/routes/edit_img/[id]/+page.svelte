<script>
  import { onMount } from "svelte";
  import { goto } from "$app/navigation";
  import { page } from "$app/stores";
  import Navbar from "../../navbar.svelte";
  import { user, fetchUser } from "../../../stores/gallery";

  let id;
  $: id = $page.params.id;

  let name = "";
  let description = "";
  let visibility = true;
  let category = "";
  let categories = [
        { name: "Nature" },
        { name: "Animals" },
        { name: "Technology" },
        { name: "Architecture" },
        { name: "Food" }
    ];
  async function fetchImage() {
    const res = await fetch(`http://localhost:3000/myuploads/${encodeURIComponent($user.email)}`);
    const data = await res.json();
    const image = data.files.find((img) => img.id == id);

    if (image) {
      name = image.name;
      description = image.description;
      category = image.category;
      visibility = image.visibility;
    }
  }

  onMount(() => {
    fetchUser();
    fetchImage();
    fetchCategories();
  });

  async function updateImage() {
    const res = await fetch(`http://localhost:3000/image/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, description, category, visibility }),
    });

    if (res.ok) {
      alert("Image updated successfully!");
      goto("/");
    } else {
      alert("Failed to update image.");
    }
  }
</script>

<Navbar />
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

    <label class="inline-flex items-center cursor-pointer">
      <input
          type="checkbox"
          bind:checked={visibility}
          class="sr-only peer"
      />
      <div
          class="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600 dark:peer-checked:bg-blue-600"
      ></div>
      <span
          class="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300"
      ></span>
  </label>
  <p>Visibility: <strong>{visibility === true ? 'public' : 'private'}</strong></p>
  <br>

    <button
      on:click={updateImage}
      class="w-full bg-blue-500 text-white p-2 rounded-md hover:bg-blue-600"
    >
      Update Image
    </button>
  </div>
</div>
