/*
	Sheet tools
*/
const saveIntervalMax = 60 * 1000;
const saveInactiveDelay = 4 * 1000;
const autoCheckInterval = 500;

function newSaveManager(dataInit, prepareData, saveInactive = saveInactiveDelay) {
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
					lastModif = Date.now();
					if (!answer.ok) {
						console.error("Error during saving");
						console.log(answer);
						this.saveError = true;
					}
				}).catch((error) => {
					console.error("Error during saving", error);
					this.saving = false;
					this.saveError = true;
					lastModif = Date.now();
				});
			}
		},
		autoSave: function () {
			if (!this.saving && this.unsaved && (Date.now() - this.lastSavedAt > saveIntervalMax ||
				Date.now() - lastModif > saveInactive)) {
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
	setInterval(() => manager.autoSave(), autoCheckInterval);

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
		<button v-on:click="save" title="Raccourci : [s]">Sauvegarder</button>
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
	props: ["schema", "data", "titles", "tooltipsFct", "show", 'edit_compo'],
	// schema : ['int', 'str', 'str', ...]
	// data : [ [1, 'a', 'b', ...], ...]
	// titles : ["title 1", ....]
	data: function () {
		let shown = this.show;
		if (shown === undefined) {
			shown = [...Array(this.schema.length).keys()]
		}
		return {
			'cols_shown': shown,
			'editing': false,
			'edit_line': 0,
		};
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
		isEmpty: function () {
			if (this.data.length > 3) {
				return false;
			}
			for (let line of this.data) {
				if (!this.isLineEmpty(line)) {
					return false;
				}
			}
			return true;
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
		delIfEmptySet: function (iLine) {
			this.delLine = this.isLineEmpty(this.data[iLine]);
		},
		delIfEmptyDo: function (iLine) {
			if (this.delLine) {
				this.data.splice(iLine, 1);
				this.delLine = false;
			}
		},
		goToCell: function (iLine, iCol) {
			let el = this.$el.querySelector('.cell_' + iLine + '_' + iCol + ' > *');
			if (el) {
				el.focus();
				return el;
			}
			return null;
		},
		onKeyAction: function (event, iLine, iCol) {
			let active = event.target;
			if (event.key == "ArrowDown") {
				this.goToCell(iLine + 1, iCol);
			}
			else if (event.key == "ArrowUp") {
				this.goToCell(iLine - 1, iCol);
			}
			else if (event.key == "ArrowLeft" && (!active.setSelectionRange || active.selectionStart == 0)) {
				let el = this.goToCell(iLine, iCol - 1);
				if (el && el.setSelectionRange) {
					setTimeout(() => {
						el.setSelectionRange(el.value.length, el.value.length);
					}, 0);
				}
			}
			else if (event.key == "ArrowRight" && (!active.setSelectionRange || active.selectionStart == active.value.length)) {
				let el = this.goToCell(iLine, iCol + 1);
				if (el && el.setSelectionRange) {
					setTimeout(() => {
						el.setSelectionRange(0, 0);
					}, 0);
				}
			}
		},
		edit_toogle: function (iline = 0) {
			this.edit_line = iline;
			this.editing = !this.editing;
		},
	},
	beforeUpdate: function () {
		this.refreshData();
	},
	beforeMount: function () {
		this.refreshData();
	},
	template: `
	<div :class="{empty_table: isEmpty}">
	<table class="s_table expand_table">
		<tr>
			<th v-for="title in titles">{{ title }}</th>
		</tr>
		<tr v-for="(line, iline) in data"
			v-on:keydown.enter="insertLine(iline)" v-on:keydown.backspace="delIfEmptySet(iline)"
			v-on:keyup.backspace="delIfEmptyDo(iline)"
			:class="{line_empty: isLineEmpty(line)}">
			<td v-for="(ival, icol) in cols_shown"
				v-bind:data-tooltip="[ival in tooltips[iline] ? tooltips[iline][ival] : '']" :class="'cell_' + iline + '_' + icol"
			v-on:keydown="onKeyAction($event, iline, icol)">
				<button v-if="ival == 'edit'" class='s_table_edit' v-on:click="edit_toogle(iline)"></button>
				<input type="text" v-model.trim="line[ival]" v-else-if="schema[ival] == 'str'" />
				<int-input v-model.number="line[ival]" v-else-if="schema[ival] == 'int'" />
			</td>
		</tr>
	</table>
	<template v-if="editing">
		<component :is="edit_compo" :data="data[edit_line]" :close="edit_toogle"></component>
	</template>
	</div>
	`,
});

Vue.component('edit-spell-agnostic', {
	props: ['data', 'close', 'titles'],
	data: function () {
		return {
		};
	},
	template: `
	<div>
		<div class="winBack" v-on:click="close"></div>
		<div class="spell_edit_win select_win scrollable">
			<h3>Modifier {{ data[0] }}</h3>
			<div class="col_in_win">
				<label>Nom :</label>
				<input type="text" v-model.trim="data[0]" />
				<br>
				<label>Épreuve :</label>
				<input type="text" v-model.trim="data[1]" />
				<br>
				<label>Valeur de compétence (VC) :</label>
				<int-input type="text" v-model.number="data[2]" style="max-width: 4em; text-align:center;" />
				<br>
				<label>{{titles.domain}} :</label>
				<input type="text" v-model.trim="data[7]" />
				<br>
			</div>
			<div class="col_in_win">
				<label>Coût :</label>
				<input type="text" v-model.trim="data[3]" />
				<br>
				<label>Durée :</label>
				<input type="text" v-model.trim="data[4]" />
				<br>
				<label>Portée :</label>
				<input type="text" v-model.trim="data[5]" />
				<br>
				<label>{{titles.duree_incant}} :</label>
				<input type="text" v-model.trim="data[6]" />
				<br>
			</div>
			<h4>Description</h4>
			<textarea v-model="data[9]"></textarea>
			<button v-on:click="close" class="centerButton">Fermer</button>
		</div>
	</div>
	`,
});

Vue.component('edit-spell', {
	props: ['data', 'close'],
	data: function () {
		return {
			'titles': {
				'domain': 'Domaine',
				'duree_incant': 'Durée d\'incantation',
			},
		};
	},
	template: `<edit-spell-agnostic :data="data" :close="close" :titles="titles">`,
});

Vue.component('edit-liturgie', {
	props: ['data', 'close'],
	data: function () {
		return {
			'titles': {
				'domain': 'Aspect',
				'duree_incant': "Durée d'oraison",
			},
		};
	},
	template: `
	<edit-spell-agnostic :data="data" :close="close" :titles="titles">
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
		props: ['socket', 'id', 'ismainapp', 'view'],
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
			if (this.ismainapp) {
				document.addEventListener("keydown", event => {
					if (event.target instanceof HTMLTextAreaElement || event.target instanceof HTMLInputElement) {
						return;
					}
					this.onKeydown(event);
				});
			}
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
			simplified: function () {
				if (this.view == 'simple') {
					return true;
				}
				else if (this.view == 'full') {
					return false;
				}
				return this.sheet.simplified;
			}
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
				let erase_ok = confirm("Voulez vous vraiment importer une ancienne fiche ? Cela effacera toutes les données de celle-ci");
				if (erase_ok) {
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
						if (json.sheetType == "ocs-tde") {
							this.sheet = json;
						} else if (json.clientVersion !== undefined) {
							this.importOptolith(json);
						} else {
							alert("Mauvais format !");
						}
					};
					fileInput.click();
				}
			},
			importOptolith: function (json) {
				fetch("/api/sheet/optolith", {
					method: 'POST',
					cache: 'no-cache',
					body: JSON.stringify({ 'data': json }),
				}).then(ans => {
					if (ans.ok) {
						ans.json().then(data => {
							data = mergeDatas(newDefaultSheet(), data);
							this.sheet = data;
							alert("Import Optolith réussi : il faut compléter les champs manquants (Nom du joueur, PAV dépensés, munitions)");
						});
					} else {
						ans.json().then(data => {
							message = '' + data.detail;
							alert("Erreur lors de l'import d'Optolith : " + message);
							console.error("error optolith import", data)
						}).catch(error => {
							console.error("Error : ", error);
							alert("Server Error");
						});
					}
				})
			},
			clone_sheet: function () {
				let clone_message = confirm("Créer une nouvelle fiche identique ?");
				if (clone_message) {
					fetch("/api/sheet/", {
						method: 'POST',
						cache: 'no-cache',
					}).then(ans => {
						if (ans.ok) {
							ans.json().then(data => {
								let id = data['id'];
								storage_add('characters', id);

								fetch("/api/sheet/" + id, {
									method: 'PUT',
									cache: 'no-cache',
									headers: {
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({
										"id": this.id,
										"content": this.sheet,
									}),
								}).then(ans => {
									let url = '/web/sheet.html?view=full&id=' + id;
									window.open(url, '_blank');
								});
							});
						} else {
							alert("Erreur lors de la copie du personnage");
						}
					});
				}
			},
			socketListener: function (event, data) {
				if (data.type == 'notification' && data.on == 'sheet' && data.sheet_id == this.id) {
					this.saveManager.remoteUpdate(data.new_data.content);
				}
			},
			onKeydown: function (event) {
				if (event.metaKey || event.ctrlKey || event.shiftKey) {
					return;
				}
				switch (event.key) {
					case '1': this.active_view = 'character'; break;
					case '2': this.active_view = 'stats'; break;
					case '3': this.active_view = 'fight'; break;
					case '4': this.active_view = 'stuff'; break;
					case '5':
						if (this.deriv.stats.ea != 0) this.active_view = 'magic';
						else if (this.deriv.stats.ek != 0) this.active_view = 'gods';
						else this.active_view = 'notes';
						break;
					case '6':
						if (this.deriv.stats.ea != 0 && this.deriv.stats.ek != 0) {
							this.active_view = 'gods';
							break;
						}
					case '7': this.active_view = 'notes'; break;
					case 's': this.saveManager.pushSave(); break;
					case 'e': this.export_sheet(); break;
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

Vue.component('etats-table', {
	props: ["sheet"],
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
	<table class="s_table table_etats">
		<tr>
			<th>Etat</th>
			<th>Niveau</th>
			<th>Etat</th>
			<th>Niveau</th>
		</tr>
		<tr>
			<td>Confusion</td>
			<td>
				<intnum-input v-model.number="sheet.etats.confusion" v-bind:min="0" v-bind:max="4">
				</intnum-input>
			</td>
			<td>Douleur</td>
			<td>
				<intnum-input v-model.number="sheet.etats.douleur" v-bind:min="0" v-bind:max="4">
				</intnum-input>
			</td>
		</tr>
		<tr>
			<td>Encombrement</td>
			<td>
				<intnum-input v-model.number="sheet.etats.encombrement" v-bind:min="0" v-bind:max="4">
				</intnum-input>
			</td>
			<td>Étourdissement</td>
			<td>
				<intnum-input v-model.number="sheet.etats.etourdissement" v-bind:min="0" v-bind:max="4">
				</intnum-input>
			</td>
		</tr>
		<tr>
			<td>Extase</td>
			<td>
				<intnum-input v-model.number="sheet.etats.extase" v-bind:min="0" v-bind:max="4">
				</intnum-input>
			</td>
			<td>Paralysie</td>
			<td>
				<intnum-input v-model.number="sheet.etats.paralysie" v-bind:min="0" v-bind:max="4">
				</intnum-input>
			</td>
		</tr>
		<tr>
			<td>Terreur</td>
			<td>
				<intnum-input v-model.number="sheet.etats.terreur" v-bind:min="0" v-bind:max="4">
				</intnum-input>
			</td>
			<td>Ébriété</td>
			<td>
				<intnum-input v-model.number="sheet.etats.ebriete" v-bind:min="0" v-bind:max="4">
				</intnum-input>
			</td>
		</tr>
	</table>
	`,
});
