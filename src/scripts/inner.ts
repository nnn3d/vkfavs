(function () {
	var injections = {
		items: [],
		add: function (fun:string, funInj: Function) {
			var item = {
				fun: fun,
				funInj: funInj,
				status: false,
			};
			this.inject(item)
			this.items.push(item);
		},
		inject: function inject (item:Object, iteration:number = 0) {
			var p = this.parse(item['fun']);
			if (p && p.fun[p.name]) {
				var newFun = p.fun[p.name];
				p.fun[p.name] = function () {
					item['funInj'].apply(window, arguments);
					return newFun.apply(p.fun, arguments);
				};
				item['funRes'] = p.fun[p.name];
				item['status'] = true;
			} else {
				// if (iteration++ > 100) return;
				setTimeout(inject.bind(this, item, iteration), 100);
			}
		},
		watch: function () {
			var self = this;
			return setInterval(function () {
				var items = self.items;
				for (var i in items) {
					if (status) {
						var p = self.parse(items[i].fun);
						if (p.fun[p.name] != items[i].funRes) {
							items[i].status = false;
							self.inject(items[i]);
							console.log('start re-inject ' + items[i].fun);
						}
					}
				}
			}, 500);
		},
		parse: function (fun: string) {
			var funArr = fun.split('.');
			var outFun:Object = window;
			var result = true;
			for (var i = 0; i < funArr.length - 1; ++i) {
				outFun = outFun[funArr[i]];
				if (outFun === undefined) {
					result = false;
					break;
				}
			}
			if (result && outFun[funArr[i]] !== undefined) {
				return {
					fun: outFun,
					name: funArr[i]
				}
			} else {
				return undefined;
			}
		}
	};

	injections.add('Wall.likeIt', function (el, post_id, hash, ev) {
		var p = wall.parsePostId(post_id),
		       like_type = p.type,
		       post_raw = p.id,
		       postEl = el && gpeByClass('_post_content', el) || wall.domPost(post_raw),
		       wrapEl = domByClass(postEl, '_like_wrap'),
		       my = hasClass(wrapEl, 'my_like');
		window.postMessage({ type: "FROM_PAGE", action: "SET_FAV", id: String(post_id), status: my}, "*");
	});

	injections.add('Wall.likesShow', function (el, post_id, opts) {
		window.postMessage({ type: "FROM_PAGE", action: "HOVER_FAV", id: String(post_id), status: !hasClass(el, 'my_like')}, "*");
	});

	injections.add('WkView.like', function () {
		window.postMessage({ type: "FROM_PAGE", action: "SET_FAV_W", id: String(wkcur.post), status: wkcur.liked}, "*");
	});

	injections.add('WkView.likeOver', function (e) {
		window.postMessage({ type: "FROM_PAGE", action: "SET_FAV_W", id: String(wkcur.post), status: !wkcur.liked}, "*");
	});

	injections.add('nav.go', function (loc, ev, opts) {
		checkUrl(function() {
			window.postMessage({ type: "FROM_PAGE", action: "PAGE_INIT"}, "*");
		});
	});

	var watch = injections.watch();

	function checkUrl(fun:Function, oldUrl:string = '', iteration:number = 0) {
		oldUrl = oldUrl || location.href;
		if (iteration > 1000) return;
		if (location.href != oldUrl) fun();
		else setTimeout(checkUrl.bind(window, fun, oldUrl, ++iteration), 20);
	}

	(function test() {
		var params = {
			act:			"a_run_method",
			hash:			"1478519755:426fa7e5ce63e92982",
			method:			"storage.get",
			param_global:	0,
			param_key:		"1",
			param_v:		"5.60"
		};
		ajax.post('/dev', params, {
			onDone: function (code) {
				console.log(code);
			},
			onFail: function (code) {
				console.log(code);
			}
		})
	});
})()