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
  OpenProjectSettings = 'openProjectSettings',

  UpdateStaticDataSchema = 'updateStaticDataSchema',
  UpdateStaticDataAllData = 'updateStaticDataAllData',
  UpdateStaticDataTranslations = 'updateStaticDataTranslations',
  UpdateStaticDataFile = 'updateStaticDataFile',
  RenameStaticDataFile = 'renameStaticDataFile',
}

export const eventEmitter = new EventEmitter();
