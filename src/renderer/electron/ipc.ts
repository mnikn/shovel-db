import { ipcRenderer } from 'electron';
import { UUID } from '../../utils/uuid';

export async function ipcSend(channel: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    const id = UUID();
    ipcRenderer.send(channel, { ...data, channelId: id });

    ipcRenderer.once(`${channel}-${id}-response`, (_, response) => {
      // if (response?.error) {
      //   reject(response.error);
      // } else {
      //   resolve(response.data);
      // }
      resolve(response);
    });
  });
}
