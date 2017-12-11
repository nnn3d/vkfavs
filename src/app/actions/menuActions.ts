import { ActionCreator, ActionCreatorsMapObject } from 'redux'
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
} from '../constants'

export interface Action {
	type: string;
	payload?: any;
}

const menuActions: ImenuActions = {

	addFolderFun : (name: string): Action => {
		return {
			type: ADD_FOLDER,
			payload: name,
		}
	},

	deleteFolderFun : (id: number): Action => {
		return {
			type: DELETE_FOLDER,
			payload: id
		}
	},

	changeFolderFun : (name: string): Action => {
		return {
			type: CHANGE_FOLDER,
			payload: name
		}
	},

	addFavFun : (id: string, folder: number): Action => {
		return {
			type: ADD_FAV,
			payload: {
				id,
				folder
			}
		}
	},

	deleteFavFun : (id: string): Action => {
		return {
			type: DELETE_FAV,
			payload: id
		}
	},

	startConfigureFolderFun : (id: number): Action => {
		return {
			type: START_CONFIGURE_FOLDER,
			payload: id
		}
	},

	endConfigureFolderFun : (): Action => {
		return {
			type: END_CONFIGURE_FOLDER,
			payload: undefined
		}
	},

	startEditFolderFun : (id: number): Action => {
		return {
			type: START_EDIT_FOLDER,
			payload: id
		}
	},

	endEditFolderFun : (name: string = ''): Action => {
		return {
			type: END_EDIT_FOLDER,
			payload: name
		}
	}
}

export interface ImenuActions extends ActionCreatorsMapObject {
	addFolderFun: (name: string) => Action 
	deleteFolderFun: (id: number) => Action 
	changeFolderFun: (name: string) => Action 
	addFavFun: (id: string, folder: number) => Action 
	deleteFavFun: (id: string) => Action 
	startConfigureFolderFun: (id: number) => Action 
	endConfigureFolderFun: () => Action
	startEditFolderFun: (id: number) => Action 
	endEditFolderFun: (name?: string) => Action
}

export default menuActions;