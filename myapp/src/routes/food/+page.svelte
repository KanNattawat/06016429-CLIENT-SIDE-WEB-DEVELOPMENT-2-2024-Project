<script>
    import Gallery from "../Gallery.svelte";
    import Navbar from "../navbar.svelte";
</script>

<div class="min-h-screen flex flex-col bg-gradient-to-br from-gray-900 to-gray-800 text-white">
    <Navbar />

    <main class="flex-1 flex flex-col items-center justify-start pt-10">
        <h1 class="text-3xl md:text-4xl font-bold mb-6 text-center">Foods</h1>
        <p class="text-lg text-gray-300 text-center mb-8 max-w-2xl">
            Explore and manage your image gallery with ease. Upload, edit, and organize your images seamlessly.
        </p>

        <Gallery filter="food" />
    </main>

    <footer class="py-4 text-center text-gray-400 text-sm">
        &copy; {new Date().getFullYear()} Pesterin. All rights reserved.
    </footer>
</div>