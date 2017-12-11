import * as assign from 'object-assign'
import { Action } from '../actions/menuActions'
import { getFolders } from '../chrome'
import {
  ADD_FOLDER, 
  DELETE_FOLDER, 
  CHANGE_FOLDER, 
  ADD_FAV, 
  DELETE_FAV,
  START_CONFIGURE_FOLDER,
  END_CONFIGURE_FOLDER,
  SELECT_FOLDER,
  START_EDIT_FOLDER,
  END_EDIT_FOLDER
} from '../constants';

export interface ImenuReducer {
  selectedFolder: number,
  configureFolder: number,
  editedFolder: number,
  folders: Array<string>;
}

export var INITIAL_STATE: ImenuReducer = {
  selectedFolder: NaN,
  configureFolder: NaN,
  editedFolder: NaN,
  folders: []
};

getFolders((folders) => { INITIAL_STATE.folders = folders});

export default function menuReducer(
  state = INITIAL_STATE, 
  action: Action = {type: ''}
): ImenuReducer {
  switch (action.type) {

     case ADD_FOLDER:
       var folders = assign([], state.folders);
       folders.push(action.payload);
       return assign({}, state, {folders});

     case DELETE_FOLDER:
       var folders = assign([], state.folders);
       folders[action.payload] = undefined;
       return assign({}, state, {folders});

     case ADD_FAV:
       return assign({}, state); // edit

     case DELETE_FAV:
       return assign({}, state); // edit

     case START_CONFIGURE_FOLDER:
       return assign({}, state, {configureFolder: action.payload});

     case END_CONFIGURE_FOLDER:
       return assign({}, state, {configureFolder: INITIAL_STATE.configureFolder});

     case SELECT_FOLDER:
       return assign({}, state, {selectedFolder: action.payload});

     case START_EDIT_FOLDER:
       return assign({}, state, {editedFolder: action.payload});

     case END_EDIT_FOLDER:
       if (action.payload) {
         var folders = assign([], state.folders);
         folders[state.editedFolder] = action.payload;
         return assign({}, state, {folders}, {editedFolder: INITIAL_STATE.editedFolder});
       }
       else return assign({}, state, {editedFolder: INITIAL_STATE.editedFolder});


    default:
      return state;
  }
}