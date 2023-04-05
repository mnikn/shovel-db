export * from './explorer';
export * from './story';

import EventEmitter from 'eventemitter3';

export enum Event {
  OpenStorylet = 'openStorylet',
  DeleteStorylet = 'deleteStorylet',
  CreateStorylet = 'createStorylet',
  UpdateStoryletName = 'updateStoryletName',
}

export const eventEmitter = new EventEmitter();
