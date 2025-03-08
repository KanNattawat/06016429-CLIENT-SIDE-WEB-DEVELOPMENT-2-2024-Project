<script>
    import { onMount } from "svelte";
    import { user, fetchUser, logout } from "../stores/gallery";

    let dropdown = false;

    function toggleDropdown() {
        dropdown = !dropdown;
    }

    onMount(fetchUser);
    console.log("nav", user.name, user.picture)
</script>

<nav class="flex items-center justify-between bg-gray-800 p-4 text-white">
    <h1 class="text-2xl font-bold">Pesterin</h1>
    <div class="flex items-center space-x-2">
        <!-- <input type="text" placeholder="Search" class="px-3 py-2 rounded-l-md border-none outline-none"> -->
        <!-- <button class="px-4 py-2 bg-gray-600 text-white rounded-r-md hover:bg-gray-700">Search</button> -->
        <a href="/upload">
            <button class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Upload Image</button>
        </a>
        <a href="">
            <button class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Category</button>
        </a>
        {#if $user}
            <button on:click={toggleDropdown}>
                <img src="{$user.picture}" alt="Profile" class="profile-pic" />
                {$user.name}
            </button>
            {#if dropdown}
                <div class="dropdown-menu">
                <a href="">My Uploads</a>
                <button on:click={logout}>Log Out</button>
                </div>
            {/if}
        {:else}
        <a href="http://localhost:3000/auth/google">
            <button class="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700">Log In</button>
        </a>
        {/if}
    </div>
</nav>
