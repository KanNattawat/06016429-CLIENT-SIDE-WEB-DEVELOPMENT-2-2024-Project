<script>
    import { onDestroy, onMount } from "svelte";
    import { user, logout } from "../stores/gallery";
    import { get } from "svelte/store";
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";

    export function load() {
    if (browser) {
        const user = JSON.parse(localStorage.getItem("user"));
        if (!user) {
        goto("/login");
        }
    }
    }

    let isOpen = false;
    let dropdown = false;

    const tabs = [
        { name: "Uploads", href: "/upload" },
    ];

    const categories = [
        { name: "All Images", href: "/" },
        { name: "Nature", href: "/nature" },
        { name: "Animals", href: "/animals" },
        { name: "Technology", href: "/technology" },
        { name: "Architecture", href: "/architecture" },
        { name: "Food", href: "/food" },
    ];

    function toggleSidebar() {
        isOpen = !isOpen;
    }

    function toggleDropdown(event) {
        event.stopPropagation();
        dropdown = !dropdown;
    }

    function closeDropdown(event) {
        if (!event.target.closest(".dropdown-menu") && !event.target.closest(".dropdown-btn")) {
            dropdown = false;
        }
    }

    onMount(() => {
    if (typeof document !== "undefined") {
        document.addEventListener("click", closeDropdown);
    }
});

onDestroy(() => {
    if (typeof document !== "undefined") {
        document.removeEventListener("click", closeDropdown);
    }
});
</script>

<nav id="naver" class="fixed top-0 left-0 w-full z-50 bg-gray-800 p-4 text-white shadow-md flex justify-between items-center">
    <button class="md:hidden p-2 bg-gray-700 rounded" on:click={toggleSidebar}>
        {isOpen ? "✖" : "☰"}
    </button>
    
    <a href="/" class="text-2xl font-bold p-3 hover:text-blue-500">Pesterin</a>
    
    <div class="hidden md:flex space-x-4">
        {#each categories as category}
            <a href={category.href} class="hover:text-blue-400">{category.name}</a>
        {/each}
    </div>

    <div class="relative">
        {#if $user}
            <button on:click={toggleDropdown} class="dropdown-btn group flex items-center space-x-2 hover:bg-gray-900 px-3 py-2 rounded-4xl">
                <span>{$user.formatName}</span>
                <img src={$user.picture || "../../anonymous-icon.jpg"} alt="Profile" class="w-10 h-10 rounded-full border-2 border-sky-400 group-hover:border-blue-600 group-hover:brightness-85" />
            </button>
            {#if dropdown}
                <div class="dropdown-menu absolute right-0 bg-white text-black rounded-lg shadow-md mt-2 w-40">
                    <a href="/upload" class="block px-4 py-2 hover:bg-gray-200 hover:rounded-lg">Upload</a>
                    <a href="/myuploads" class="block px-4 py-2 hover:bg-gray-200">My Uploads</a>
                    <a href="/favorites" class="block px-4 py-2 hover:bg-gray-200">Favorites</a>
                    <button on:click={logout} class="block w-full text-left px-4 py-2 hover:bg-gray-200 hover:rounded-lg">Log Out</button>
                </div>
            {/if}
        {:else}
            <a href="/login">
                <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">Log In</button>
            </a>
        {/if}
    </div>
</nav>

{#if isOpen}
    <div class="fixed top-0 left-0 w-64 h-full bg-gray-900 p-6 shadow-lg flex flex-col space-y-4 md:hidden">
        <button class="self-end text-xl" on:click={toggleSidebar}>✖</button>
        {#each categories as category}
            <a href={category.href} class="text-white hover:text-blue-400">{category.name}</a>
        {/each}
        <hr class="border-gray-700" />
        {#each tabs as tab}
            <a href={tab.href} class="text-white hover:text-blue-400">{tab.name}</a>
        {/each}
    </div>
{/if}
