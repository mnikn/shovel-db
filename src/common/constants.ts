export enum FILE_GROUP {
  STORY = 'story',
  STATIC_DATA = 'static_data',
}

export enum EDITOR_PATTERN {
  STORY = 'story',
  STATIC_DATA = 'static_data',
}

export const IPC_API = {
  SYNC_SERVICE_MEMENTO: 'sync_service_memento',
  SAVE_CURRENT_PROJECT: 'save_current_project',
  FETCH_SERVICE_MEMENTO: 'fetch_service_memento',
  FETCH_STATIC_FILE_DATA: 'fetch_static_file_data',
  RETRIEVE_SERVICE_CACHE: 'retrieve_service_cache',
  SAVE_DATA_FILES: 'save_data_files',
  FETCH_DATA_FILES: 'fetch_data_files',
  LOG: 'log',
};
