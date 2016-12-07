/// <reference path="./reference/chrome.d.ts"/>
/// <reference path="./reference/jquery.d.ts"/>

// chrome.storage.local.clear();
function init(): void {
	menuLikeInit();
	favPageInit();
}

function favPageInit(checkLink: boolean = true, iteration: number = 0) {
	if (checkLink && (
		!/vk\.com\/fave/.test(location.href) || 
		(location.search && !/section=likes_posts|folder=[\d]+/.test(location.search)))
		) return;
	var block = $('.narrow_column')[0];
	if (!block || !$('.ui_rmenu_pr')[0]) {
		if (iteration > 1000) return;
		setTimeout(function () {
			favPageInit(checkLink, ++iteration);
		}, 20);
		return;
	}
	//done!
	createMenu(function ($el) {
		if ($(block).find('.vkf_menu').length > 0) return;
		var $all = $('#ui_rmenu_likes_posts').clone(true);
		$all.children('span').text('Все записи');
		var $sep = $('<div/>', {class: 'ui_rmenu_sep'});
		var $slider = $el.find('.ui_rmenu_slider');
		$el.find('.vkf_menu').prepend($sep).prepend($all).prepend($slider);
		$el.on('click', '.vkf_folder', function (e) {
			history.pushState({}, '', location.protocol + '//' + location.hostname + location.pathname + '?folder=' + $(this).attr('data-id'));
			loadFavs(Number($(this).attr('data-id')));
			menuLikeInit();
		})
		$el.appendTo(block);
	})
}

function menuLikeInit(): void {
	waitFor(function () {
		return Boolean($('body')[0]);
	}, 		function () {
		createLikeMenu(function ($menu) {
			$likeMenu = $menu;
			$(document.body).prepend($likeMenu.hide());
		});
	});
}

function createMenu(callback: (menu: JQuery) => void): void {
	//add menu wrapper
	var $menuWrap = $('<div/>', {
		class: 'page_block ui_rmenu vkf_menu_wrap',
		click: function (e) {
			e.preventDefault();
			return false;
		}
	});
	//add menu
	var $menu = $('<div/>', {
		class: 'vkf_menu'
		// id: 'vkf_menu'
	}).appendTo($menuWrap);
	// separator
	var $sep = $('<div/>', {
		class: 'ui_actions_menu_sep'
	})
	// .appendTo($menuWrap);
	//add new folder item
	var $newFolder = $('<span/>', {
		class: 'ui_rmenu_item vkf_add_folder'
	}).appendTo($menuWrap);
	//new folder input
	var $newFolderInput = $('<input/>', {
		type: 'text',
		placeholder: 'Добавить папку',
		maxlength: 22,
		keypress: function(e) {
			if (e.keyCode == 13 && this.value.length > 0) {
				var val = this.value;
				this.value = '';
				var self = this;
				addFolder(val, function(id) {
					createMenuEl(val, id).appendTo($('.vkf_menu'));
					$(self).blur();
				});
			}
		}
	}).appendTo($newFolder);
	//add func 
	$menuWrap['selectClear'] = function () {
		$(this).find('.ui_rmenu_slider').attr('style', '');
		$(this).removeClass('ui_rmenu_sliding');
		$(this).find('.ui_rmenu_item_sel').removeClass('ui_rmenu_item_sel');
	};
	$menuWrap['selectFolder'] = function (id:number): void {
		$menuWrap['selectClear']();
		$(this).find('.vkf_folder_'+id).addClass('ui_rmenu_item_sel');
	};
	//add elements
	chrome.storage.local.get({ folders: [] }, function(items: Object): void {
		var folders = items['folders'];
		for (var i = 0; i < folders.length; ++i) {
			if (folders[i] !== null) {
				createMenuEl(folders[i], i).appendTo($menu);
			}
		}
		//slider
		$('<div/>', {
			class: 'ui_rmenu_slider _ui_rmenu_slider'
		}).prependTo($menu);
		callback($menuWrap);
	});
}

function createLikeMenu(callback: ($menu: JQuery) => void) {
	createMenu(function ($menu) {
		$likeMenu = $menu;
		// separator
		$('<div/>', {
			class: 'ui_rmenu_sep'
		}).prependTo($likeMenu.find('.vkf_menu'));
		// no folder item
		var $noFolder = createMenuEl('Нет папки', -1);
		$noFolder
		// change class to change onclick events
		.removeClass('.vkf_folder').addClass('.vkf_not_folder')
		.prependTo($likeMenu.find('.vkf_menu'))
		//delete settings btn
		.find('.vkf_set_btn').remove();
		// add slider to start of menu el
		$likeMenu.find('.ui_rmenu_slider').prependTo($likeMenu.find('.vkf_menu'));
		// add specifical class
		$likeMenu.addClass('vkf_menu_like');

		// onclick
		$likeMenu.on('click', '.vkf_folder', function (e) {
			var id = $likeMenu.attr('data-id');
			var folder = Number($(this).attr('data-id'));
			deleteFav(id, function () {
				addFav(id, folder);
			});
		});
		$likeMenu.on('click', '.vkf_not_folder', function (e) {
			var id = $likeMenu.attr('data-id');
			deleteFav(id);
		})
		callback($likeMenu);
	});
}

function createMenuEl(name:string, folder:number): JQuery {
	var $menuItem = $('<div/>', {
		class: 'ui_rmenu_item vkf_folder vkf_folder_' + folder,
		'data-id': folder,
		mouseleave: function (e) {
			$(this).find('.vkf_set_btn').removeClass('active');
		},
		onclick: 'uiRightMenu.switchMenu(this);'
	});

		var $text = $('<span/>', {
			class: 'text',
			text: name
		}).appendTo($menuItem);

		var $setBtn = $('<span/>', {
			class: 'vkf_set_btn',
			tabindex: '-1',
			click: function (e) {
				e.preventDefault();
				$(this).toggleClass('active');
				if ($(this).hasClass('active')) {
					$(this).focus();
				}
				return false;
			},
			blur: function (e) {
				$(this).removeClass('active');
			}
		}).appendTo($menuItem);

			var $setMenu = $('<div/>', {
				class: 'vkf_set_menu page_block',
			}).appendTo($setBtn);

				var $setItemDelete = $('<span/>', {
					text: 'Удалить',
					class: 'ui_rmenu_item vkf_set_item_del vkf_set_item',
					click: function (e) {
						var $self = $(this);
						var id = $(this).closest('.vkf_folder').attr('data-id');
						deleteFolder(Number(id), function (res) {
							$('.vkf_menu .vkf_folder_'+id).remove();
							$('.vkf_menu_wrap').removeClass('ui_rmenu_sliding');
						})
					}
				}).appendTo($setMenu);

				var $setItemEdit = $('<span/>', {
					text: 'Изменить',
					class: 'ui_rmenu_item vkf_set_item_edit vkf_set_item',
					click: function (e) {
						var $self = $(this);
						var $folder = $self.closest('.vkf_folder');
						var name = $folder.children('.text').text();
						var id = $folder.attr('data-id');
						var $input = $('<span/>', {
							class: 'ui_rmenu_item vkf_edit_folder'
						});
						var $inputItem = $('<input/>', {
							value: name,
							type: 'text',
							maxlength: 22,
							keydown: function (e) {
								$input = $(this).parent();
								if (e.keyCode == 13 && $(this).val().length > 0) {
									var newName = $(this).val();
									changeFolder(Number(id), newName, function () {
										$input.remove();
										$('.vkf_menu .vkf_folder_'+id+' .text').text(newName);
										$folder.show();
									})
								}
								if (e.keyCode == 27) {
									$input.remove();
									$folder.show();
								}
							},
							focusout: function (e) {
								$(this).parent().remove();
								$folder.show();
							}
						}).appendTo($input);
						$folder.after($input).hide();
						var end = $inputItem.val().length;
						$inputItem.get(0).setSelectionRange(end, end);
						$inputItem.focus();
					}
				}).appendTo($setMenu);

	return $menuItem;
}

function addFolder(name:string, callback?: (id:number) => void): void {
	chrome.storage.local.get({folders: []}, function (items:Object): void {
		var folders = items['folders'];
		folders.push(name);
		chrome.storage.local.set({folders: folders}, function () {
			callback && callback(folders.length - 1);
		});

	});
}

function changeFolder(id:number, newName:string, callback?: () => void): void {
	chrome.storage.local.get({folders: []}, function (items:Object): void {
		var folders = items['folders'];
		folders[id] = newName;
		chrome.storage.local.set({folders: folders}, function () {
			callback && callback();
		})
	})
}

function deleteFolder(id:number, callback?: (result: boolean) => void) {
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

function addFav(id: string, folder: number, callback?: (result: boolean) => void): void {
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

function deleteFav(id: string, callback?: Function): void {
	chrome.storage.local.get({favs: '{}'}, function(items: Object) {
		var favs = JSON.parse(items['favs']);
		delete favs[id];
		var out = JSON.stringify(favs);
		chrome.storage.local.set({ favs: out }, function() {
			callback && callback();
		});
	});
}

function getFav(id:string, callback: (fav: Object) => void): void {
	chrome.storage.local.get({ favs: '{}' }, function(items: Object) {
		var favs = JSON.parse(items['favs']);
		callback(favs[id] || {time: -1, folder: -1});
	});
}

function appendMenuLike(selector: string, id: string, check: boolean = false): void {
	var $likeItem = $(selector);
	if (check && $likeItem.siblings().is('.vkf_menu_like')) return;
	getFav(id, function (fav) {
		$likeMenu.attr('data-id', id);
		$likeMenu
			.css({
				opacity: 0,
				display: ''
			})
			.stop()
			.animate({opacity: 1}, 300, function () {
				$likeMenu.attr('style', ' ');
			});
		$likeMenu['selectFolder'](fav['folder']);
		$likeItem.after($likeMenu);
	});
}

function loadFavs(folder: number): void {
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

function waitFor(condition: () => boolean, callback: () => void, waitTime: number = 20, iterations: number = 0, iteration: number = 0) {
	if (condition()) {
		callback();
		return;
	}
	if (iterations !== 0 && iteration > iterations) {
		return;
	}
	setTimeout(waitFor.bind(window, condition, callback, waitTime, iterations, iteration++), waitTime);
}

//------------------------------------end func---------------------------------

window.addEventListener("message", function(event) {
	// We only accept messages from ourselves
	if (event.source != window)
		return;

	if (event.data.type && (event.data.type == "FROM_PAGE")) {
		switch (event.data.action) {
			case "SET_FAV":
				if (event.data.status) {
					$likeMenu.fadeOut(0.3);
					deleteFav(event.data.id);
				} else {
					appendMenuLike('#post'+event.data.id+' .post_like', event.data.id);
				}
				break;
			case "HOVER_FAV":
				if (!event.data.status) {
					appendMenuLike('#post'+event.data.id+' .post_like', event.data.id, true);
				}
				break;
			case "SET_FAV_W":
				if (event.data.status) {
					$likeMenu.fadeOut(0.3);
					deleteFav(event.data.id);
				} else {
					appendMenuLike('#wk_content .wk_like_wrap', event.data.id);
				}
				break;
			case "HOVER_FAV_W":
				if (!event.data.status) {
					appendMenuLike('#wk_content .wk_like_wrap', event.data.id, true);
				}
				break;
			case "PAGE_INIT":
				init();
				break;
		}
	}
}, false);

// insert script into VK
$(function () {
	$('<script/>', {
		type: 'text/javascript',
		src: 'https://ajax.googleapis.com/ajax/libs/jquery/2.2.0/jquery.min.js'
	}).appendTo('body');
	$('<script/>', {
		type: 'text/javascript',
		src: chrome.extension.getURL("scripts/inner.js")
	}).appendTo('body');
});
// likes menu
var $likeMenu: JQuery;
// init 
init();





