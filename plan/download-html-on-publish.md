# Implementation Plan: Automatic HTML Download on Publish

## Objective
Enable users to automatically download a static HTML file of their page immediately after clicking the "Publish" button in the Admin Page Editor.

## Technical Approach
We will utilize the browser's native capabilities to fetch the generated page content and trigger a file download. Since the application uses Next.js with Static Generation (SSG) or On-Demand Revalidation, checking the page URL immediately after saving to the DB will trigger the server to generate/return the fresh HTML.

## Steps

### 1. Modify `src/views/PageEditor.tsx`

We need to update the `handlePublishToggle` function.

**Current Flow:**
1. User clicks Publish.
2. App updates `is_published` in Supabase.
3. App updates local state.
4. Toast notification appears.

**New Flow:**
1. User clicks Publish.
2. App updates `is_published` in Supabase.
3. App updates local state.
4. **IF** the page is being published (changing from false to true):
    a. Show a "Preparing download..." toast.
    b. Construct the public URL for the page: `/page/[slug]`.
    c. Perform a client-side `fetch()` request to this URL.
    d. specific `dynamic = 'force-dynamic'` or standard SSG config ensures we get the latest DB content.
    e. Convert the response text to a `Blob`.
    f. Create a temporary hidden `<a>` tag pointing to this Blob.
    g. Programmatically click the tag to trigger the browser's "Save As" or auto-download behavior.
    h. Clean up the URL object.

### 2. Implementation Code

```typescript
// Inside handlePublishToggle function

const newIsPublished = !page.is_published;

// ... existing database update logic ...

if (newIsPublished) {
  try {
    toast.info("Generating static HTML file...");

    // 1. Fetch the live page content
    const response = await fetch(`/page/${page.slug}`);
    
    if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
    }

    const htmlContent = await response.text();

    // 2. Create a downloadable file object (Blob)
    const blob = new Blob([htmlContent], { type: "text/html" });
    const downloadUrl = window.URL.createObjectURL(blob);

    // 3. Trigger download via hidden link
    const link = document.createElement("a");
    link.href = downloadUrl;
    link.download = `${page.slug}.html`; // e.g., "about-us.html"
    document.body.appendChild(link);
    link.click();

    // 4. Cleanup
    link.remove();
    window.URL.revokeObjectURL(downloadUrl);

    toast.success("Download started!");
  } catch (error) {
    console.error("Download failed:", error);
    toast.error("Could not download the HTML file.");
  }
}
```

## Benefits
- **Zero Configuration**: No complex build scripts needed for the user.
- **Immediate Result**: User gets the file cleanly after the action.
- **Fresh Data**: Fetches the exact representation of what the server renders.

## Limitations
- The downloaded HTML file relies on absolute paths or properly accessible relative paths for CSS/JS (`/_next/static/...`). If the file is opened locally (file:// protocol) without a running local server, styles might break unless standard HTML `<base>` tags or CDN links are used. Next.js standard output assumes a server environment.
