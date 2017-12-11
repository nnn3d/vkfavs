import * as React from 'react'
import { FOLDER_NAME_MAX_LENGTH } from '../constants'

interface IFoldersProps extends React.Props<any> {
	deleteFolderFun: (id: number) => void;
	handlerClickFun: (...args: any[]) => void;
	startConfigureFolderFun: (id: number) => void;
	endConfigureFolderFun: () => void;
	startEditFolderFun: (id: number) => void;
	endEditFolderFun: (name: string) => void;
	folders: Array<string>;
	selectedFolder: number;
	configureFolder: number;
	editedFolder: number;
}

export default function Folders ({
	// work with data
	deleteFolderFun,
	// on folder click
	handlerClickFun,
	// configure folder
	startConfigureFolderFun,
	endConfigureFolderFun,
	configureFolder,
	// edit folder
	startEditFolderFun,
	endEditFolderFun,
	editedFolder,
	// 
	selectedFolder,
	folders
}: IFoldersProps) {
	var className = 'ui_rmenu_item vkf_folder';
	var classNameSel = 'ui_rmenu_item_sel';
	var handlerSettingsClick = (id, e) => {
		e.preventDefault();
		if (configureFolder != id) {
			startConfigureFolderFun(id);
		} else {
			endConfigureFolderFun();
		}
	}
	var handlerNewFolderKeyDown = (oldName, e) => {
		var el = e.target;
		if (e.which == 13 && el.value.length > 0) {
			endEditFolderFun(el.value);
		}
		if (e.which == 27) {
			endEditFolderFun('');
		}
	}

	return (
		<div>
			{folders && folders.map( (name, id, array) => {
				if (!name) return;
				var cn = className + ' vkf_folder_' + id + (selectedFolder === id ? ' ' + classNameSel : '');
				return (
					<div>
					{ (editedFolder != id) &&
						<div 
							className={cn}	
							data-id={id} 
							key={id} 
							data-onclick="uiRightMenu.switchMenu(this);" 
							onClick={handlerClickFun}
							onMouseLeave={(configureFolder == id) && endConfigureFolderFun.bind(this, id)}
						>
							<span className='text'>{name}</span>
							<span 
								className={'vkf_set_btn' + (configureFolder == id ? ' active' : '')} 
								tabIndex={-1} 
								onBlur={(configureFolder == id) && endConfigureFolderFun} 
								onClick={handlerSettingsClick.bind(this, id)} 
								data-onclick="function(e) {e.preventDefault()}"
							>
								<span className='vkf_set_menu page_block'>
									<span 
										className='ui_rmenu_item vkf_set_item_del vkf_set_item'
										onClick={deleteFolderFun.bind(this, id)}
									>
										Удалить
									</span>
									<span 
										className='ui_rmenu_item vkf_set_item_edit vkf_set_item' 
										onClick={startEditFolderFun.bind(this, id)}
									>
										Изменить
									</span>
								</span>
							</span>
						</div>
					}
					{ (editedFolder == id) &&
							<span className='ui_rmenu_item vkf_edit_folder'>
								<input 
									type='text' 
									maxLength={ FOLDER_NAME_MAX_LENGTH } 
									defaultValue={name} 
									onKeyDown={handlerNewFolderKeyDown.bind(this, name)} 
									onBlur={endEditFolderFun.bind(this, '')}
									autoFocus={editedFolder == id}
								/>
							</span>
					}
					</div>
				)
			})}
		</div>
	)
}