import * as z from "zod";
import type { de } from "zod/locales";

const createDryerSchema = z.object({
    name: z.string().min(1, "Name is required"),
});

const updateDryerSchema = z.object({
    name: z.string().min(1, "Name is required"),
    area_id: z.number().int().positive("Area ID must be a positive integer"),
}); 

export const useDryerCRUD = (fetch_dryer: () => Promise<any>) => {
    const create_data = ref<any>({
        name: null
    });

    const update_data = ref<any>({
        name: null,
        area_id: null
    });

    const edit_state = ref<boolean>(false);
    const create_state = ref<boolean>(false);

    const update_edit_state = (area_id: number | null = null, name: string | null = null) => {
        if (area_id === null) {
            edit_state.value = false;
            return;
        }
        update_data.value.area_id =area_id;
        update_data.value.name = name;
        edit_state.value = !edit_state.value;
    }

    const error = ref<any>(null);

    const create_dryer = async (toast: any) => {
        try {
            const error_zod =  createDryerSchema.parse(create_data.value);
            const { data, error } = await useFetch('/api/dryarea/dry_area', {
                method: 'POST',
                body: create_data.value,
            });
            if (error.value) {
                throw new Error(error.value?.statusMessage || "Unknown error");
            }
            fetch_dryer();
            create_state.value = false;
            create_data.value.name = null;
            toast.add({
                title: "Dryer created successfully",
                color: "success",    
            });
            return data;
        } catch (err) {
            error.value = err;
            toast.add({
                title: "Error deleting dryer: " + error.value?.message || "Unknown error",
                color: "error",    
            });
            return null;
        }
    }

    const update_dryer = async (toast: any) => {
        try {
            const error_zod =  updateDryerSchema.parse(update_data.value);
            const { data, error } = await useFetch('/api/dryarea/dry_area', {
                method: 'PUT',
                body: update_data.value,
            });

            if (error.value) {
                throw new Error(error.value?.statusMessage || "Unknown error");
            }

            fetch_dryer();
            toast.add({
                title: "Dryer updated successfully",
                color: "success",    
            });
            edit_state.value = false;
            return data;
        }   catch (err) {
            error.value = err;
            alert("Error updating dryer: " + error.value?.message || "Unknown error");
            toast.add({
                title: "Error updating dryer: " + error.value?.message || "Unknown error",
                color: "error",    
            });
            return null;
        }
    }

    const delete_dryer = async (area_id: number, toast: any) => {
        try {
            const { data, error } = await useFetch('/api/dryarea/dry_area', {
                method: 'DELETE',
                body: { area_id },
            });
            if (error.value) {
                throw new Error(error.value?.statusMessage || "Unknown error");
            }
            fetch_dryer();
            toast.add({
                title: "Dryer deleted successfully",
                color: "success",    
            });
        }   catch (err) {
            error.value = err;
            toast.add({
                title: "Error deleting dryer: " + error.value?.message || "Unknown error",
                color: "error",    
            });
            return null;
        }
    }

    return {
        create_data,
        update_data,
        error,
        update_dryer,
        create_dryer,
        edit_state,
        update_edit_state,
        delete_dryer,
        create_state
    }
}