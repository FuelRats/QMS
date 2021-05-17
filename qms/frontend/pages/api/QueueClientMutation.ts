import axios from "axios";

export default async function queueClient(parent, args, context): Promise<any> {
  const input = args.input;
  const queuedClient = await axios.put(
    process.env.QMS_URL + "/api/v1/queue/newclient",
    {
      client: {
        client_name: input.cmdr,
        client_system: input.system,
        platform: input.platform,
        locale: input.locale,
        o2_status: input.codeRed,
        odyssey: input.odyssey,
        in_progress: false,
      },
    },
    {
      headers: {
        Authorization: "Bearer " + process.env.QMS_API_TOKEN,
      },
    }
  );

  return {
    message: queuedClient.data.message,
    arrivalTime: queuedClient.data.arrival_time,
    pending: queuedClient.data.pending,
    uuid: queuedClient.data.uuid,
    platform: queuedClient.data.client.platform,
    locale: queuedClient.data.client.locale,
    codeRed: !queuedClient.data.client.o2_status,
    system: queuedClient.data.client.client_system,
    cmdr: queuedClient.data.client.client_name,
    odyssey: queuedClient.data.client.odyssey,
  };
}
