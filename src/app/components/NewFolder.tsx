import * as React from 'react'
import { FOLDER_NAME_MAX_LENGTH } from '../constants'

interface INewFolderProps extends React.Props<any> {
	addFolderFun: (name: string) => void;
}

export default function NewFolder ({ addFolderFun }: INewFolderProps) {
	var handlerFolderKeyPress = (e) => {
		var el = e.target;
		if (e.which == 13 && el.value.length > 0) {
			var val = el.value;
			el.value = '';
			el.blur();
			addFolderFun(val);
		}
	}
	return (
		<span className='ui_rmenu_item vkf_add_folder'>
		  <input 
			  type='text' 
			  placeholder='Добавить папку' 
			  maxLength={ FOLDER_NAME_MAX_LENGTH } 
			  onKeyPress={ handlerFolderKeyPress }
		  >
		  </input>
		</span>
	)
}