import axios from "axios";

export default async function systems(parent, args, context): Promise<{ name: string }[]> {
    if (args.filter.search.length === 0) {
        return [];
    }
    const result = await axios.get(
        process.env.SYSTEMS_API_URL + "/typeahead?term=" + args.filter.search
    );

    return result.data?.map((name) => ({ name })) ?? [];
}
