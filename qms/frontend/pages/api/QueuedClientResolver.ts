import axios from "axios";


export default async function queuedClient(parent, args, context): Promise<any> {
    if (args.uuid.length === 0) {
        return null;
    }
    const result = await axios.get(
        process.env.QMS_URL + "/api/v1/queue/uuid/" + args.uuid
    );
    return {
        pending: result.data.pending,
        platform: result.data.client.platform,
        system: result.data.client.client_system,
        cmdr: result.data.client.client_name,
        codeRed: result.data.client.o2_status,
        odyssey: result.data.client.odyssey,
    };
}


