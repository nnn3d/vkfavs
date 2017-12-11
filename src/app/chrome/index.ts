import * as $ from 'jquery'

export function addFolder(name:string, callback?: (id:number) => void): void {
	chrome.storage.local.get({folders: []}, function (items:Object): void {
		var folders = items['folders'];
		folders.push(name);
		chrome.storage.local.set({folders: folders}, function () {
			callback && callback(folders.length - 1);
		});

	});
}

export function changeFolder(id:number, newName:string, callback?: () => void): void {
	chrome.storage.local.get({folders: []}, function (items:Object): void {
		var folders = items['folders'];
		folders[id] = newName;
		chrome.storage.local.set({folders: folders}, function () {
			callback && callback();
		})
	})
}

export function getFolders(callback?: (folders: any) => void) {
	chrome.storage.local.get({ folders: [] }, function(items: Object): void {
		var folders = items['folders'];
		callback(folders);
	});
}

export function deleteFolder(id:number, callback?: (result: boolean) => void) {
	chrome.storage.local.get({folders: [], favs: '{}'}, function (items:Object) {
		var folders:Object = items['folders'];
		var favs = JSON.parse(items['favs']);
		if (!(id in folders)) {
			callback && callback(false);
			return;
		}
		folders[id] = null;
		for (var fav in favs) {
			if (favs[fav]['folder'] == id) {
				delete favs[fav];
			}
		}
		var out = JSON.stringify(favs);
		chrome.storage.local.set({folders: folders, favs: out}, function () {
			callback && callback(true);
		})
	})
}

export function addFav(id: string, folder: number, callback?: (result: boolean) => void): void {
	chrome.storage.local.get({favs: '{}', folders: []}, function(items: Object) {
		if (!(folder in items['folders'])) {
			callback && callback(false);
			return;
		}
		var favs = JSON.parse(items['favs']);
		favs[id] = {
			time: (new Date()).getTime(),
			folder: folder
		}
		var out = JSON.stringify(favs);
		chrome.storage.local.set({ favs: out }, function() {
			callback && callback(true);
		});
	});
}

export function deleteFav(id: string, callback?: Function): void {
	chrome.storage.local.get({favs: '{}'}, function(items: Object) {
		var favs = JSON.parse(items['favs']);
		delete favs[id];
		var out = JSON.stringify(favs);
		chrome.storage.local.set({ favs: out }, function() {
			callback && callback();
		});
	});
}

export function getFav(id:string, callback: (fav: Object) => void): void {
	chrome.storage.local.get({ favs: '{}' }, function(items: Object) {
		var favs = JSON.parse(items['favs']);
		callback(favs[id] || {time: -1, folder: -1});
	});
}

export function loadFavs(folder: number): void {
	chrome.storage.local.get({favs: '{}', folders: []}, function (items:Object) {
		if (!(folder in items['folders'])) return;
		var $block = $('<div/>', {
			class: 'vkf_fav_wrap wall_posts all'
		});
		var favs = JSON.parse(items['favs']);
		var el = [];
		for (var id in favs) {
			if (favs[id].folder == folder) {
				el.push({
					id: id,
					time: favs[id].time
				});
			}
		}
		el.sort(function (a, b) {
			return b.time - a.time;
		});
		for (var i = 0; i < el.length; i++) {
			var $item = $('<div/>', {
				class: 'vkf_fav vkf_fav_'+el[i].id
			});
			$item.load(location.protocol + '//' + location.hostname + '/wall' + el[i].id + ' #post' + el[i].id, {}, 
				function () {
				$item.find('.wall_comments_header, .replies').remove();
				if ($item.html() == '') $item.remove();
			});
			$block.append($item);
			$item.hide().delay(100).fadeIn();
		}
		$('.page_block_header').html('').append(
			$('<div/>', {
			class: 'page_block_header_inner'
			}).append(
				$('<div/>', {
				class: 'ui_crumb',
				text: items['folders'][folder]
				})
			)
		);
		$('#show_more_likes_posts').remove();
		$('#wide_column > .page_block .no_rows').remove();
		var $out = $('#results');
		if ($out.length == 0) {
			$out = $('<div/>', {
					class: 'wall_module',
					id: 'results'
				}).appendTo(
					$('<div/>', {
						class: 'fave_module'
					}).appendTo($('#wide_column')
				)
			);
		}
		$out.html('').append($block);
		if (el.length == 0) {
			$('<div/>', {
				class: 'no_rows',
				html: 'Вы можете добавлять сюда интересные Вам записи.<br>Из этой папки у Вас всегда будет быстрый доступ к ним.'
			}).appendTo($('#wide_column > .page_block'));
		}
	})
}

export function waitFor(condition: () => boolean, callback: () => void, waitTime: number = 20, iterations: number = 0, iteration: number = 0) {
	if (condition()) {
		callback();
		return;
	}
	if (iterations !== 0 && iteration > iterations) {
		return;
	}
	setTimeout(waitFor.bind(window, condition, callback, waitTime, iterations, iteration++), waitTime);
}