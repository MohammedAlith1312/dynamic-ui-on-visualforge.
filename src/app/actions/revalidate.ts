"use server";

import { revalidatePath } from "next/cache";

/**
 * Revalidates a specific page by its slug.
 * This will clear the static cache for that page and force a fresh render on the next request.
 */
export async function revalidatePage(slug: string) {
    try {
        // We revalidate the dynamic route for the page
        revalidatePath(`/page/${slug}`);




        console.log(`Successfully revalidated path: /page/${slug}`);
        return { success: true };
    } catch (error) {
        console.error("Revalidation Error:", error);
        return { success: false, error };
    }
}