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

export default async function queuedClient(
  parent,
  args,
  context
): Promise<any> {
  if (args.uuid.length === 0) {
    return null;
  }
  const result = await axios.get<QueueItem>(
    process.env.QMS_URL + "/api/v1/queue/uuid/" + args.uuid
  );

  const currentRescue = result.data;
  return {
    pending: currentRescue.pending,
    platform: currentRescue.client.platform,
    system: currentRescue.client.client_system,
    cmdr: currentRescue.client.client_name,
    codeRed: currentRescue.client.o2_status,
    odyssey: currentRescue.client.odyssey,
    position: async (): Promise<number> => {
      const result = await axios.get<QueueItem[]>(
        process.env.QMS_URL + "/api/v1/queue/"
      );
      const rescues = result.data;
      const currentRescueDate = new Date(currentRescue.arrival_time);

      return (
        rescues.filter(
          (rescue) => new Date(rescue.arrival_time) < currentRescueDate
        ).length + 1
      );
    },
  };
}
