import { ipcRenderer } from 'electron';

export async function ipcSend(channel: string, data: any): Promise<any> {
  return new Promise((resolve, reject) => {
    ipcRenderer.send(channel, data);

    ipcRenderer.once(`${channel}-response`, (_, response) => {
      // if (response?.error) {
      //   reject(response.error);
      // } else {
      //   resolve(response.data);
      // }
      resolve(response);
    });
  });
}
