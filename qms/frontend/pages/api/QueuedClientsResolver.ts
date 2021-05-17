import axios from "axios";

interface QueueItem {
  pending: boolean;
  arrival_time: string;
  uuid: string;
  client: {
    platform: "PC" | "XB" | "PS4";
    client_system: string;
    client_name: string;
    o2_status: boolean;
    odyssey: boolean;
    locale: boolean;
  };
}

export default async function queuedClients(
  parent,
  args,
  context
): Promise<any> {
  const result = await axios.get<QueueItem[]>(
    process.env.QMS_URL + "/api/v1/queue",
    {
      headers: {
        Authorization: "Bearer " + process.env.QMS_API_TOKEN,
      },
    }
  );

  let rescues = result.data;
  if (args.filter?.cmdr?.length) {
    rescues = rescues.filter(
      (rescue) => rescue.client.client_name === args.filter.cmdr
    );
  }
  return rescues.map((currentRescue) => ({
    pending: currentRescue.pending,
    platform: currentRescue.client.platform,
    system: currentRescue.client.client_system,
    cmdr: currentRescue.client.client_name,
    codeRed: currentRescue.client.o2_status,
    odyssey: currentRescue.client.odyssey,
    position: async (): Promise<number> => {
      const result = await axios.get<QueueItem[]>(
        process.env.QMS_URL + "/api/v1/queue/",
        {
          headers: {
            Authorization: "Bearer " + process.env.QMS_API_TOKEN,
          },
        }
      );
      const rescues = result.data;
      const currentRescueDate = new Date(currentRescue.arrival_time);

      return (
        rescues.filter(
          (rescue) => new Date(rescue.arrival_time) < currentRescueDate
        ).length + 1
      );
    },
  }));
}