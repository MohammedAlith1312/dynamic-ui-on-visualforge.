"use server";

import { revalidatePath } from "next/cache";

export async function revalidatePage(slug: string) {
    try {
        revalidatePath(`/page/${slug}`);
        return { success: true };
    } catch (error) {
        console.error("Revalidation Error:", error);
        return { success: false, error };
    }
}
