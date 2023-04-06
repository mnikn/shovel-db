export * from './explorer';
export * from './story';
export * from './track';
export * from './project';
export * from './editor';

import EventEmitter from 'eventemitter3';

export enum Event {
  OpenStorylet = 'openStorylet',
  DeleteStorylet = 'deleteStorylet',
  CreateStorylet = 'createStorylet',
  UpdateStory = 'updateStory',
  UpdateStoryActors = 'updateStoryActors',
  UpdateStoryTranslations = 'updateStoryTranslations',
  UpdateStoryletName = 'updateStoryletName',
  UpdateExplorer = 'updateExplorer',
}

export const eventEmitter = new EventEmitter();
