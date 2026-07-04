import * as z from "zod";

const createDryerSchema = z.object({
    name: z.string().min(1, "Name is required"),
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

    const update_edit_state = (area_id: number) => {
        update_data.value.area_id = edit_state.value == false ? area_id : null;
        edit_state.value = !edit_state.value;
    }

    const error = ref<any>(null);

    const create_dryer = async () => {
        try {
            if (createDryerSchema.safeParse(create_data.value).success === false) {
                throw new Error("Name is required");
            }
            const response = await useFetch('/api/dryarea/dry_area', {
                method: 'POST',
                body: create_data.value,
            });
            fetch_dryer();
            return response;
        } catch (err) {
            error.value = err;
            alert("Error creating dryer: " + error.value?.message || "Unknown error");
            return null;
        }
    }

    const update_dryer = async () => {
        try {
            const response = await useFetch('/api/dryarea/dry_area', {
                method: 'PUT',
                body: update_data.value,
            });
            fetch_dryer();
            return response;
        }   catch (err) {
            error.value = err;
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
        update_edit_state
    }
}