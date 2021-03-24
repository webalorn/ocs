/*
	Sheet tools
*/
const saveIntervalMax = 60 * 1000;
const saveInactiveDelay = 4 * 1000;

function newSaveManager(dataInit, prepareData, interval = 200) {
	let data = dataInit;
	let lastSavedData = cloneData(data);
	let lastModif = Date.now();
	let lastTrySave = Date.now();
	let ignoreNextChange = false;

	let manager = {
		lastSavedAt: lastModif,
		unsaved: false,
		saving: false,
		saveError: false,
		changed: function (dataNew) {
			if (ignoreNextChange) {
				ignoreNextChange = false;
				return false;
			}
			data = dataNew;
			if (!this.unsaved && areEqual(data, lastSavedData)) {
				return true;
			}
			this.unsaved = true;
			lastModif = Date.now();
		},
		pushSave: function (forceSave = false) {
			if (((this.unsaved || this.saveError)
				&& (!this.saving || Date.now() - lastTrySave > 6 * 1000))
				|| forceSave) {
				lastSavedData = cloneData(data);
				lastTrySave = Date.now();
				this.saving = true;
				this.saveError = false;
				this.unsaved = false;

				let [url, sentData] = prepareData(data);
				fetch(url, {
					method: 'PUT',
					cache: 'no-cache',
					headers: {
						'Content-Type': 'application/json',
					},
					body: JSON.stringify(sentData)
				}).then((answer) => {
					this.saving = false;
					if (!answer.ok) {
						console.error("Error during saving");
						console.log(answer);
						this.saveError = true;
					} else {
						this.lastSavedAt = Date.now();
					}
				}).catch((error) => {
					console.error("Error during saving", error);
					this.saving = false;
					this.saveError = true;
				});
			}
		},
		autoSave: function () {
			if (!this.saving && this.unsaved && (Date.now() - this.lastSavedAt > saveIntervalMax) ||
				(Date.now() - lastModif > saveInactiveDelay)) {
				this.pushSave();
			}
		},
		remoteUpdate: function (newData) {
			if (!areEqual(newData, data)) {
				ignoreNextChange = true;
				updateSavedData(data, lastSavedData, newData);
				lastSavedData = cloneData(data);
			}
		},
	};
	setInterval(() => manager.autoSave(), interval);

	return manager;
};

/*
	Vue tools
*/

function pavTxt(pavCost) {
	if (pavCost === null) {
		return 'Non améliorable';
	}
	if (Number.isInteger(pavCost)) {
		return '+1: ' + pavCost + ' PAV';
	}
	return pavCost;
}
function qualPlainName(qual) {
	return qualPlainNameDict[qual.toLowerCase()];
}

function tooltipForSpell(spell) {
	let vc = spell[2];
	let am = spell[8];
	let pav = pav_cost_am(vc, am);
	if (pav) {
		let text = pavTxt(pav);
		if (vc >= 14) {
			text += " (maîtrise)";
		}
		return { 0: text };
	}
	return {};
}

Vue.component('data-saver', {
	props: ['data', 'manager'],
	watch: {
		data: {
			handler(val) {
				this.manager.changed(this.data);
			},
			deep: true
		},
	},
	methods: {
		save: function () {
			this.manager.pushSave(true);
		},
	},
	template: `
	<div class='save_state'>
		<button v-on:click="save">Sauvegarder</button>
		<br>
		<span v-if="manager.saving" class='save_saving'>Sauvegarde....</span>
		<span v-if="!manager.saving && manager.saveError" class='save_error'>Erreur de sauvegarde</span>
		<span v-if="!manager.saving && !manager.saveError">
			<span v-if="manager.unsaved" class='save_no'>Non enregistré</span>
			<span v-if="!manager.unsaved" class='save_yes'>Enregistré</span>
		</span>
	</div>
  `
});

/*
	Sheet subviews
*/
Vue.component('sheet-talent', {
	props: ['talents', 'cat', 'stat', 'qualites'],
	data: function () {
		return {
			talent: this.talents[this.cat][this.stat],
			infos: talentInfos[this.cat][this.stat],
		}
	},
	computed: {
		routine: function () {
			return getRoutine(this.qualites, this.infos.roll, this.talent.vc);
		},
		improv_cost: function () {
			let pav = pavTxt(pav_cost_am(this.talent.vc, this.infos.am));
			let qual = getQualMax(this.qualites, this.infos.roll);
			if (this.talent.vc >= qual + 2) {
				return "Max: Q+2 = " + (qual + 2);
			}
			return pav;
		},
	},
	template: `
	<tr>
		<td :data-tooltip="improv_cost">{{ infos.name }}</td>
		<td>{{ infos.roll }}</td>
		<td>{{ infos.enc }}</td>
		<td>{{ infos.am }}</td>
		<td>
			<int-input v-model.number="talent.vc"></int-input>
		</td>
		<td v-if="routine !== null">{{ routine }}</td>
		<td v-if="routine === null">—</td>
		<td>
			<input type="text" v-model.trim="talent.remark" />
		</td>
	</tr>
	`,
});


Vue.component('sheet-technique', {
	// props: ['name', 'q', 'am', 'stats'],
	props: ['techniques', 'tech', 'qualites'],
	data: function () {
		return {
			infos: fightingInfos[this.tech],
			stats: this.techniques[this.tech],
		};
	},
	computed: {
		improv_cost: function () {
			let qual = getQualMax(this.qualites, this.infos.qual);
			if (qual + 2 <= this.stats.vtc) {
				return "Max: Q+2 = " + (qual + 2);
			}
			return pavTxt(pav_cost_am(this.stats.vtc, this.infos.am));
		},
		fight: function () {
			return compute_vtc(this.qualites, this.tech, this.stats.vtc);
		},
	},
	template: `
	<tr>
		<td :data-tooltip="improv_cost">{{ infos.name }}</td>
		<td>{{ infos.qual }}</td>
		<td>{{ infos.am }}</td>
		<td :class="{has_vtc : stats.vtc > 6}">
			<int-input v-model.number="stats.vtc"></int-input>
		</td>
		<td>{{ fight.atcd }}</td>
		<td v-if="'prd' in stats">{{ fight.prd }}</td>
		<td v-if="!('prd' in stats)" class="ts_cell_cross"></td>
	</tr>
	`,
});


Vue.component('sheet-etats-display', {
	props: ["etats"],
	data: function () {
		return {
			"texts": {
				"niveaux": ["", "I", "II", "III", "IV"],
				"confusion": ["Confusion", ["",
					"Légèrement confus, toutes les épreuves –1",
					"Confus, toutes les épreuves –2",
					"Très confus, toutes les épreuves –3, les activités com- plexes comme lancer des sorts ou accomplir des liturgies et lʼutilisation des connaissances sont impossibles",
					"Incapable dʼagir",
				]],
				"douleur": ["Douleur", ["",
					"Douleurs légères, toutes les épreuves –1, VI –1",
					"Douleurs lancinantes, toutes les épreuves –2, VI – 2",
					"Douleurs fortes, toutes les épreuves –3, VI – 3",
					"Incapable dʼagir, autrement toutes les épreuves –4",
				]],
				"encombrement": ["Encombrement", ["",
					"Légèrement encombré, épreuves pour les talents influencés par lʼencombrement à –1, AT –1, défenses (=PRD/ESQ) –1, INI – 1, VI – 1",
					"Encombré, épreuves pour les talents influencés par lʼencombrement à –2, AT –2, défenses (=PRD/ESQ) –2, INI – 2, VI – 2",
					"Très encombré, épreuves pour les talents influencés par lʼencombrement à –3, AT –3, défenses (=PRD/ESQ) –3, INI – 3, VI – 3",
					"Incapable dʼagir",
				]],
				"etourdissement": ["Étourdissement", ["",
					"Légèrement étourdi, toutes les épreuves –1",
					"Étourdi, toutes les épreuves –2",
					"Très étourdi, toutes les épreuves –3",
					"Incapable dʼagir",
				]],
				"extase": ["Extase", ["",
					"Légère extase, toutes les épreuves de talents et de sorts –1 si elles ne sont pas agréables au dieu",
					"Extase, toutes les épreuves de talents et de sorts agréables au dieu +1, toutes les autres –2",
					"Touché par la grâce du dieu, toutes les épreuves de talents et de sorts agréables au dieu +2, toutes les autres –3",
					"Instrument de dieu, toutes les épreuves de talents et de sorts agréables au dieu +3, toutes les autres –4",
				]],
				"terreur": ["Terreur", ["",
					"Inquiet, toutes les épreuves –1",
					"Apeuré, toutes les épreuves –2",
					"En panique, toutes les épreuves –3",
					"Catalepsie, incapable dʼagir",
				]],
				"paralysie": ["Paraysie", ["",
					"Légèrement raidi, toutes les épreuves exigeant de bouger ou de parler –1, VI à seulement 75 %",
					"Raidi, toutes les épreuves exigeant de bouger ou de parler –2, VI à seulement 50 %",
					"À peine mobile, toutes les épreuves exigeant de bouger ou de parler –3, VI à seulement 25 %",
					"Immobilisé",
				]],
				"ebriete": ["Ébriété", ["",
					"Les épreuves d'alcools & drogues subissent un malus de -1",
					"Les épreuves d'alcools & drogues subissent un malus de -2",
					"Les épreuves d'alcools & drogues subissent un malus de -3",
					"Le héros subit un niveau d'étourdissement, supprime 4 niveaux d'ébriété, les niveaux restants continuent à être des niveaux d'ébriété",
				]],
			}
		}
	},
	computed: {
		'list': function () {
			let r = [];
			for (let name in this.etats) {
				if (this.etats[name] != 0) {
					r.push({
						'title': this.texts[name][0] + " niveau " + this.texts["niveaux"][this.etats[name]],
						'text': this.texts[name][1][this.etats[name]],
					});
				}
			}
			return r;
		}
	},
	template: `
	<div class="s_etats_display">
		<div class="etat_display_line" v-for="l in list">
			<label>{{ l.title }} :</label> <span>{{ l.text }}</span>
		</div>
	</div>
	`,
});

Vue.component('sheet-table', {
	props: ["schema", "data", "titles", "tooltipsFct"],
	// schema : ['int', 'str', 'str', ...]
	// data : [ [1, 'a', 'b', ...], ...]
	// titles : ["title 1", ....]
	data: function () {
		return {};
	},
	computed: {
		tooltips: function () {
			let arr = [];
			if (this.tooltipsFct) {
				this.data.forEach(line => arr.push(this.tooltipsFct(line)));
			} else {
				this.data.forEach(line => arr.push([]));
			}
			return arr;
		},
	},
	methods: {
		isLineEmpty: function (line) {
			for (let i in line) {
				if (line[i]) {
					return false;
				}
			}
			return true;
		},
		getNewLine: function () {
			let l = [];
			for (let i in this.schema) {
				if (this.schema[i] == 'int') {
					l.push(0);
				} else {
					l.push("");
				}
			}
			return l;
		},
		refreshData: function () {
			while (this.data.length < 3 || !this.isLineEmpty(this.data[this.data.length - 1])) {
				this.data.push(this.getNewLine());
			}

			while (this.data.length > 3 && this.isLineEmpty(this.data[this.data.length - 1])
				&& this.isLineEmpty(this.data[this.data.length - 2])) {
				this.data.pop();
			}
		},
		insertLine: function (iLine) {
			this.data.splice(iLine + 1, 0, this.getNewLine());
			var nextLine = this.$el.querySelector('.cell_' + (iLine + 1) + '_0 > *');
			if (nextLine) {
				nextLine.focus();
			}
		},
		delIfEmptySet: function (iLine) { // Hey, problem ! Delete after !!!
			this.delLine = this.isLineEmpty(this.data[iLine]);
		},
		delIfEmptyDo: function (iLine) { // Hey, problem ! Delete after !!!
			if (this.delLine) {
				this.data.splice(iLine, 1);
				this.delLine = false;
			}
		},
		goToCell: function (iLine, iCol) {
			console.log(iLine, iCol);
			this.$el.querySelector('.cell_' + iLine + '_' + iCol + ' > *').focus();
		},
	},
	beforeUpdate: function () {
		this.refreshData();
	},
	beforeMount: function () {
		this.refreshData();
	},
	template: `
	<table class="s_table expand_table">
		<tr>
			<th v-for="title in titles">{{ title }}</th>
		</tr>
		<tr v-for="(line, iline) in data"
			v-on:keydown.enter="insertLine(iline)" v-on:keydown.backspace="delIfEmptySet(iline)"
			v-on:keyup.backspace="delIfEmptyDo(iline)">
			<td v-for="(val, ival) in line" v-bind:data-tooltip="[ival in tooltips[iline] ? tooltips[iline][ival] : '']" :class="'cell_' + iline + '_' + ival">
				<input type="text" v-model.trim="line[ival]" v-if="schema[ival] == 'str'" />
				<int-input v-model.number="line[ival]" v-if="schema[ival] == 'int'" />
			</td>
		</tr>
	</table>
	`,
});

Vue.component('show-table', {
	props: ["data", "titles"],
	methods: {
		isLineEmpty: function (line) {
			for (let i in line) {
				if (line[i]) {
					return false;
				}
			}
			return true;
		},
	},
	template: `
	<table class="s_table expand_table show_table">
		<tr>
			<th v-for="title in titles">{{ title }}</th>
		</tr>
		<tr v-for="(line, iline) in data" v-if="!isLineEmpty(line)">
			<td v-for="(val, ival) in line">
				{{ val }}
			</td>
		</tr>
	</table>
	`,
});

/*
	Sheet main view
*/
function create_sheet_component(sheet_template) {
	Vue.component('sheet-compo', {
		props: ['socket', 'id'],
		data: function () {
			return {
				loaded: false,
				sheet: newDefaultSheet(),
				active_view: "character",
				saveManager: null,
				order: {
					'techniques': fightingList,
					'talents': talentLists,
				}
			}
		},
		mounted: function () {
			fetch('/api/sheet/' + this.id, { cache: 'no-cache' })
				.then(response => {
					if (response.ok) {
						response.json().then((data) => {
							this.sheet = mergeDatas(this.sheet, data["content"]);
							this.saveManager = newSaveManager(this.sheet, sheet => {
								let url = "/api/sheet/" + this.id;
								let data = {
									"id": this.id,
									"content": sheet
								};
								return [url, data];
							});
							this.loaded = true;

							this.socket.register(this.socketListener);
						});
					}
				});
		},
		computed: {
			avatarStyle: function () {
				if (this.sheet.image) {
					return "background-image: url('" + this.sheet.image + "');"
				}
				return "";
			},
			avatarAnimalStyle: function () {
				if (this.sheet.animal.image) {
					return "background-image: url('" + this.sheet.animal.image + "');"
				}
				return "";
			},
			deriv: function () {
				return compute_derived(this.sheet);
			},
			pav: function () {
				return compute_pav_cost(this.sheet);
			},
			autoText: function () {
				let divinQual = this.sheet.divin.qualite_principale.toLowerCase();
				let magicQual = this.sheet.magic.qualite_principale.toLowerCase();

				return {
					magicQual: magicQual ?
						(magicQual in this.sheet.qualites ?
							magicQual.toUpperCase() + ' = ' + this.sheet.qualites[magicQual]
							: magicQual + ' inconnue'
						) : '',
					divinQual: divinQual ?
						(divinQual in this.sheet.qualites ?
							divinQual.toUpperCase() + ' = ' + this.sheet.qualites[divinQual]
							: divinQual + ' inconnue'
						) : '',
					bonusEv: '+2*CN (' + (2 * this.sheet.qualites.cn) + ')',
					bonusEa: (magicQual || this.sheet.stats.ea[0]) ?
						(magicQual in this.sheet.qualites ?
							'+' + magicQual.toUpperCase() + ' (' + this.sheet.qualites[magicQual] + ')'
							: '+0'
						) : '',
					bonusEk: (divinQual || this.sheet.stats.ek[0]) ?
						(divinQual in this.sheet.qualites ?
							'+' + divinQual.toUpperCase() + ' (' + this.sheet.qualites[divinQual] + ')'
							: '+0'
						) : '',
				};
			},
		},
		watch: {
			sheet: {
				handler(val) {
					let title = 'Fiche de personnage';
					if (this.sheet && this.sheet.head.nom) {
						title = this.sheet.head.nom + ' | ' + title;
						let sheetName = this.sheet.head.nom;
						if (this.sheet.owner) {
							sheetName += ' (' + this.sheet.owner + ')';
						}
						storage_set_in_dict('idToName', this.id, sheetName);
					} else if (this.sheet) {
						storage_set_in_dict('idToName', this.id, null);
					}
					document.title = title;
				},
				deep: true
			},
		},
		methods: {
			updateAvatar: function () {
				let nouv = prompt("Nouvelle url de l'image du personnage :", this.sheet.image);
				if (nouv !== null) {
					this.sheet.image = nouv;
				}
			},
			updateAvatarAnimal: function () {
				let nouv = prompt("Nouvelle url de l'image de l'animal :", this.sheet.animal.image);
				if (nouv !== null) {
					this.sheet.animal.image = nouv;
				}
			},
			export_sheet: function () {
				let content = JSON.stringify(this.sheet);
				let file = new Blob([content], { type: 'json' });
				let url = URL.createObjectURL(file);
				let a = document.createElement("a");
				a.style.display = 'none';
				a.href = url;
				a.download = this.id + '.json';
				document.body.appendChild(a);
				a.click();
				setTimeout(function () {
					document.body.removeChild(a);
					window.URL.revokeObjectURL(url);
				}, 0);
			},
			import_sheet: function () {
				let doit = confirm("Voulez vous vraiment importer une ancienne fiche ? Cela effacera toutes les données de celle-ci");
				if (doit) {
					let fileInput = document.createElement("input");
					fileInput.type = 'file';
					fileInput.style.display = 'none';
					document.body.appendChild(fileInput);

					fileInput.onchange = e => {
						let file = e.target.files[0];
						if (!file) {
							return;
						}
						let reader = new FileReader();
						reader.onload = function (e) {
							fileInput.func(e.target.result);
							document.body.removeChild(fileInput);
						}
						reader.readAsText(file);
					};
					fileInput.func = txt => {
						let json = JSON.parse(txt);
						this.sheet = json;
					};
					fileInput.click();
				}
			},
			socketListener: function (event, data) {
				if (data.type == 'notification' && data.on == 'sheet' && data.sheet_id == this.id) {
					this.saveManager.remoteUpdate(data.new_data.content)
				}
			},
			tooltipForSpell: tooltipForSpell,
			pavTxt: pavTxt,
			qualPlainName: qualPlainName,
		},
		template: sheet_template,
	});
	window.dispatchEvent(event_sheet_loaded);
}
if (event_sheet_loaded !== null) {
	fetch('/web/app/comp/sheet_template.html')
		.then(response => response.text())
		.then(sheet_template => create_sheet_component(sheet_template));
}


/*
	Sheet short view
*/
Vue.component('sheet-short-view', {
	props: ['identity', 'table', 'id', 'socket', 'isgm'],
	data: function () {
		return {
			detailOpen: false,
			sheet: null,
		}
	},
	mounted: function () {
		let url = "/api/sheet/" + this.id;
		fetch(url)
			.then(answer => answer.json())
			.then(data => {
				let sheet = data.content;
				updateSheetVersion(sheet);
				this.setSheet(sheet);
			});
		this.socket.register((event, data) => {
			if (data.type == 'notification' && data.on == 'sheet' && data.sheet_id == this.id) {
				this.setSheet(data.new_data.content);
			}
		});
	},
	computed: {
		avatarStyle: function () {
			if (this.sheet.image) {
				return "background-image: url('" + this.sheet.image + "'); background-size: cover;"
			}
			return "";
		},
		avatarAnimalStyle: function () {
			if (this.sheet.animal.image) {
				return "background-image: url('" + this.sheet.animal.image + "'); background-size: cover;"
			}
			return "";
		},
		deriv: function () {
			return compute_derived(this.sheet);
		},
		invite_url: function () {
			if (this.isgm) {
				return window.location.protocol + '//' + window.location.host + '/web/table.html?table=' + this.table + '&id=' + this.id;
			}
			return null;
		},
	},
	methods: {
		edit: function () {
			let url = "/web/sheet.html?id=" + this.id;
			window.open(url, '_blank');
		},
		deleteFromTable: function () {
			if (confirm("Supprimer de la campagne ?")) {
				let url = "/api/table/" + this.table + "/player/" + this.id;
				fetch(url, {
					method: 'DELETE',
					cache: 'no-cache',
				}).then(ans => {
					if (ans.ok) { location.reload(); }
				});
			}
		},
		toggleDetails: function () {
			this.detailOpen = !this.detailOpen;
		},
		setSheet: function (sheet) {
			this.sheet = sheet;
			if (this.id === this.identity.id) {
				this.identity.sheet = sheet;
				this.identity.deriv = compute_derived(sheet);
			}
		},
	},
	template: `
	<div class="sheet_short_view">
	<template v-if="sheet">
		<div class="ssv_head">
			<div class="ssv_avatar" v-bind:style="avatarStyle" v-on:click="toggleDetails"></div>
			<div class="header_infos">
				<label>Nom :</label>
				<span>{{sheet.head.nom}}</span>
				<br>
				<label>Joueur :</label>
				<span>{{sheet.owner}}</span>
				<br>
				<label>Âge :</label>
				<span>{{sheet.head.age}}</span>
			</div>
			<div class="header_infos">
				<label>Peuple :</label>
				<span>{{sheet.head.peuple}}</span>
				<br>
				<label>Culture :</label>
				<span>{{sheet.head.culture}}</span>
				<br>
				<label>Profession :</label>
				<span>{{sheet.head.profession}}</span>
			</div>
			<div class="header_infos">
				<label>PV :</label>
				<span>{{sheet.cur_stats.ev}} / {{ deriv.stats.ev }}</span>
				<span v-if="deriv.ev_etats == 1" class="ev_niv_1">Touché (1)</span>
				<span v-if="deriv.ev_etats == 2" class="ev_niv_2">Touché (2)</span>
				<span v-if="deriv.ev_etats == 3" class="ev_niv_3">Touché (3)</span>
				<span v-if="deriv.ev_etats == 4" class="ev_niv_4">Touché (4)</span>
				<span v-if="deriv.ev_etats == 5" class="ev_niv_5">Mourant</span>
				<br>
				<template v-if="deriv.stats.ea != 0">
					<label>PA :</label>
					<span>{{sheet.cur_stats.ea}} / {{ deriv.stats.ea }}</span>
					<br>
				</template>
				<template v-if="deriv.stats.ek != 0">
					<label>PK :</label>
					<span>{{sheet.cur_stats.ek}} / {{ deriv.stats.ek }}</span>
					<br>
				</template>
				<label>PAV :</label>
				<span>{{sheet.xp.total}} ({{ deriv.xp.degree }})</span>
			</div>

			<div class="header_infos" v-if="identity.gm">
				<button v-on:click="edit">Modifier</button>
				<br>
				<br>
				<button v-on:click="deleteFromTable">Retirer</button>
				<br>
			</div>
		</div>
		<div class='ssv_body'>
			<div class="champ_in">
				<label>Status & États</label>
			</div>
			<div class="ssv_status">{{ sheet.status }}</div>
			<sheet-etats-display v-bind:etats="sheet.etats"></sheet-etats-display>
			<div class="ssv_status">{{ sheet.modifs_qualites }}</div>
		</div>
		<template v-if="detailOpen">
			<div class="winBack" v-on:click="toggleDetails"></div>
			<div class="ssv_details scrollable">
				<div class="champ_in">
					<label>Nom</label>
					<span>{{sheet.head.nom}}</span>
				</div>
				<div class="champ_in">
					<label>Âge</label>
					<span>{{ sheet.head.age}}</span>
				</div>
				<div class="champ_in">
					<label>Sexe</label>
					<span>{{ sheet.head.sexe}}</span>
				</div>
				<div class="champ_in">
					<label>Peuple</label>
					<span>{{ sheet.head.peuple}}</span>
				</div>
				<div class="champ_in">
					<label>Culture</label>
					<span>{{ sheet.head.culture}}</span>
				</div>
				<div class="champ_in">
					<label>Couleur de cheveux</label>
					<span>{{ sheet.head.cheveux}}</span>
				</div>
				<div class="champ_in">
					<label>Couleur des yeux</label>
					<span>{{ sheet.head.yeux}}</span>
				</div>
				<div class="champ_in">
					<label>Taille / Masse</label>
					<span>{{ sheet.head.taille_masse}}</span>
				</div>

				<div class="champ_in">
					<label>Traits caractéristiques</label>
				</div>
				<p>{{ sheet.head.traits }}</p>

				<div class="champ_in">
					<label>Description physique complète</label>
				</div>
				<p>{{ sheet.head.description_phy }}</p>

				<div class="ssv_invit" v-if="isgm">
					<span>Lien d'invitation :</span><br />
					<a v-bind:href="invite_url" target="_blank">{{ invite_url }}</a>
				</div>

				<div class="ssv_details_close">
					<button v-on:click="toggleDetails">Fermer</button>
				</div>
			</div>
		</template>
	</template>
	</div>`,
});
