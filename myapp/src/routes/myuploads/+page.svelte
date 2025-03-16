<script>
    import { onMount } from "svelte";
    import { user, fetchUser } from "../../stores/gallery";
    import { goto } from "$app/navigation"; // Import goto for navigation
    import { fade, fly } from "svelte/transition"; // Import transitions
    import Gallery from "../Gallery.svelte";
    import Navbar from "../navbar.svelte";
    import { fetchImages } from "../../stores/gallery";

</script>

<div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <!-- Navbar -->
    <Navbar />

    <!-- Main Content Wrapper -->
    <main class="flex-1 flex flex-col items-center justify-start pt-10">
        <h1 class="text-3xl md:text-4xl font-bold mb-6 text-center">My Uploads</h1>
        <p class="text-lg text-gray-300 text-center mb-8 max-w-2xl">
            Explore and manage your image gallery with ease. Upload, edit, and organize your images seamlessly.
        </p>

        <!-- Gallery Component -->
        <Gallery filter={`myuploads/${encodeURIComponent($user.email)}`} />
    </main>

    <!-- Footer -->
    <footer class="py-4 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Pesterin. All rights reserved.
    </footer>
</div>