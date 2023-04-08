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
  UpdateStoryFiles = 'updateStoryFiles',
  UpdateStoryActors = 'updateStoryActors',
  UpdateStoryNodeSettings = 'updateStoryNodeSettings',
  UpdateStoryTranslations = 'updateStoryTranslations',
  UpdateStoryletName = 'updateStoryletName',
  UpdateExplorer = 'updateExplorer',
  UpdateRecentOpenFiles = 'updateRecentOpenFiles',
  OpenFile = 'openFile',
}

export const eventEmitter = new EventEmitter();
