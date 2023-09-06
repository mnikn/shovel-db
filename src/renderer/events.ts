import EventEmitter from 'eventemitter3';

export enum EVENT {
  ON_SAVE_PROJECT_START = 'on_save_project_start',
  ON_SAVE_PROJECT_FINISHED = 'on_save_project_finished',
}

export enum Event {
  OpenStorylet = 'openStorylet',
  DeleteStorylet = 'deleteStorylet',
  CreateStorylet = 'createStorylet',
  UpdateStory = 'updateStory',
  UpdateStoryFiles = 'updateStoryFiles',
  UpdateStoryActors = 'updateStoryActors',
  UpdateStoryNodeSettings = 'updateStoryNodeSettings',
  UpdateStoryActorSettings = 'updateStoryActorSettings',
  UpdateStoryTranslations = 'updateStoryTranslations',
  UpdateStoryletName = 'updateStoryletName',
  UpdateExplorer = 'updateExplorer',
  UpdateRecentOpenFiles = 'updateRecentOpenFiles',
  OpenFile = 'openFile',
  OpenProjectSettings = 'openProjectSettings',

  CreateStaticDataFile = 'createStaticDataFile',
  UpdateStaticDataSchema = 'updateStaticDataSchema',
  UpdateStaticDataAllData = 'updateStaticDataAllData',
  UpdateStaticDataTranslations = 'updateStaticDataTranslations',
  UpdateStaticDataFile = 'updateStaticDataFile',
  DeleteStaticDataFile = 'deleteStaticDataFile',
  RenameStaticDataFile = 'renameStaticDataFile',
  CodeEditorResetLangRegisteration = 'codeEditorResetLangRegisteration',
}

export const eventEmitter = new EventEmitter();
