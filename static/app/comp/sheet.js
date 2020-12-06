/*
	Sheet tools
*/
let sum2 = (a, b) => a + b;
function newDefaultSheet() {
	return {
		"owner": "",
		"image": "",
		"head": {
			"nom": "",
			"sexe": "",
			"peuple": "",
			"date_naissance": "",
			"age": "",
			"cheveux": "",
			"yeux": "",
			"taille_masse": "",
			"profession": "",
			"culture": "",
			"niveau_social": "",
			"lieu_naissance": "",
			"famille": "",
			"traits": "",
			"description_phy": "",
		},
		"qualites": {
			"co": 8,
			"in": 8,
			"iu": 8,
			"ch": 8,
			"de": 8,
			"ag": 8,
			"cn": 8,
			"fo": 8,
		},
		"stats": {
			"ev": [0, 0, 0],
			"ea": [0, 0, 0],
			"ek": [0, 0, 0],
			"tm": [0, 0],
			"tp": [0, 0],
			"esq": [0, 0],
			"ini": [0, 0],
			"vi": [0, 0],
		},
		"cur_stats": {
			"ev": 0,
			"ea": 0,
			"ek": 0,
		},
		"des": {
			"valeur": 3,
			"modif": 0,
			"actuels": 3,
		},
		"xp": { "total": 0, "spent": 0 },
		"avantages": "",
		"desavantages": "",
		"cs": {
			"generales": "",
			"combat": "",
			"magiques": "",
			"divines": "",
		},
		"langues": "",
		"ecriture": "",
		"modifs_qualites": "",
		"talents": {
			"phy": {
				"acuite": { "vc": 0, "remark": "" },
				"alcool": { "vc": 0, "remark": "" },
				"batellerie": { "vc": 0, "remark": "" },
				"chant": { "vc": 0, "remark": "" },
				"danse": { "vc": 0, "remark": "" },
				"equitation": { "vc": 0, "remark": "" },
				"escalade": { "vc": 0, "remark": "" },
				"furtivite": { "vc": 0, "remark": "" },
				"maitrise_corps": { "vc": 0, "remark": "" },
				"maitrise_soi": { "vc": 0, "remark": "" },
				"natation": { "vc": 0, "remark": "" },
				"tour_force": { "vc": 0, "remark": "" },
				"vol": { "vc": 0, "remark": "" },
				"vol_tire": { "vc": 0, "remark": "" },
			},
			"soc": {
				"rue": { "vc": 0, "remark": "" },
				"convertir": { "vc": 0, "remark": "" },
				"deguisement": { "vc": 0, "remark": "" },
				"etiquette": { "vc": 0, "remark": "" },
				"intimidation": { "vc": 0, "remark": "" },
				"nature_humaine": { "vc": 0, "remark": "" },
				"persutaation": { "vc": 0, "remark": "" },
				"seduction": { "vc": 0, "remark": "" },
				"volonte": { "vc": 0, "remark": "" },
			},
			"nat": {
				"botanique": { "vc": 0, "remark": "" },
				"orientation": { "vc": 0, "remark": "" },
				"peche": { "vc": 0, "remark": "" },
				"pistage": { "vc": 0, "remark": "" },
				"noeuds": { "vc": 0, "remark": "" },
				"survie": { "vc": 0, "remark": "" },
				"zoologie": { "vc": 0, "remark": "" },
			},
			"connaissance": {
				"art_guerre": { "vc": 0, "remark": "" },
				"astonomie": { "vc": 0, "remark": "" },
				"calcul": { "vc": 0, "remark": "" },
				"contes_legendes": { "vc": 0, "remark": "" },
				"dieux_cultes": { "vc": 0, "remark": "" },
				"droit": { "vc": 0, "remark": "" },
				"geographie": { "vc": 0, "remark": "" },
				"histoire": { "vc": 0, "remark": "" },
				"jeux": { "vc": 0, "remark": "" },
				"magicologie": { "vc": 0, "remark": "" },
				"mecanique": { "vc": 0, "remark": "" },
				"spherologie": { "vc": 0, "remark": "" },
			},
			"savoir": {
				"alchimie": { "vc": 0, "remark": "" },
				"navires": { "vc": 0, "remark": "" },
				"commerce": { "vc": 0, "remark": "" },
				"conduite": { "vc": 0, "remark": "" },
				"crochetage": { "vc": 0, "remark": "" },
				"cuisine": { "vc": 0, "remark": "" },
				"musique": { "vc": 0, "remark": "" },
				"peinture_dessin": { "vc": 0, "remark": "" },
				"soin_esprit": { "vc": 0, "remark": "" },
				"soin_blessures": { "vc": 0, "remark": "" },
				"soin_maladies": { "vc": 0, "remark": "" },
				"soin_poisons": { "vc": 0, "remark": "" },
				"pierre": { "vc": 0, "remark": "" },
				"bois": { "vc": 0, "remark": "" },
				"cuir": { "vc": 0, "remark": "" },
				"métal": { "vc": 0, "remark": "" },
				"tissu": { "vc": 0, "remark": "" },
			},
		},
		"etats": {
			"confusion": 0,
			"douleur": 0,
			"encombrement": 0,
			"etourdissement": 0,
			"extase": 0,
			"paralysie": 0,
			"terreur": 0,
			"ebriete": 0,
		},
		"status": "",
		"techniques": {
			"arbaletes": { "vtc": 6, "atcd": 6 },
			"arcs": { "vtc": 6, "atcd": 6 },
			"chaines": { "vtc": 6, "atcd": 6 },
			"hast": { "vtc": 6, "atcd": 6, "prd": 3 },
			"duel": { "vtc": 6, "atcd": 6, "prd": 3 },
			"jet": { "vtc": 6, "atcd": 6 },
			"bagarre": { "vtc": 6, "atcd": 6, "prd": 3 },
			"boucliers": { "vtc": 6, "atcd": 6, "prd": 3 },
			"dagues": { "vtc": 6, "atcd": 6, "prd": 3 },
			"epees": { "vtc": 6, "atcd": 6, "prd": 3 },
			"epees2mains": { "vtc": 6, "atcd": 6, "prd": 3 },
			"haches_masses": { "vtc": 6, "atcd": 6, "prd": 3 },
			"haches_masses_2m": { "vtc": 6, "atcd": 6, "prd": 3 },
			"lances": { "vtc": 6, "atcd": 6, "prd": 3 },
		},
		"argent": [0, 0, 0, 0],
		"animal": {
			"nom": "",
			"type": "",
			"pv": 0,
			"pa": 0,
			"qualites": {
				"co": 8,
				"in": 8,
				"iu": 8,
				"ch": 8,
				"de": 8,
				"ag": 8,
				"cn": 8,
				"fo": 8,
			},
			"tm": 0,
			"tp": 0,
			"pr": 0,
			"ini": 0,
			"vi": 0,
			"attaque": "",
			"atcd": "",
			"defense": "",
			"pi": "",
			"alpo": "",
			"action": "",
			"cs": "",
			"notes": "",
			"image": "",
		},
		"divin": {
			"perma_pk": 0,
			"tradition": "",
			"qualite_principale": "",
			"aspect": "",
			"cs": "",
			"benedictions": "",
		},
		"magic": {
			"perma_pa": 0,
			"tradition": "",
			"qualite_principale": "",
			"domaine": "",
			"cs": "",
			"tours": "",
		},
		"notes": {
			"background": "",
			"relations": "",
			"notes": "",
			"ideaux_objectifs": "",
			"qualites_defauts_rp": "",
		},
		"stuff": [],
		"sorts": [],
		"liturgies": [],
		"armes": {
			"melee": [],
			"distance": [],
			"armures": [],
			"parade": [],
		},
	}
}

function compute_derived(sheet) {
	// Etat des PV
	let total_ev = sheet.stats.ev.reduce(sum2);
	let cur_ev = sheet.cur_stats.ev;
	let ev_etats = 0;
	if (cur_ev <= 3 * total_ev / 4) { ev_etats++; }
	if (cur_ev <= total_ev / 4) { ev_etats++; }
	if (cur_ev <= total_ev / 2) { ev_etats++; }
	if (cur_ev <= 5) { ev_etats++; }
	if (cur_ev <= 0) { ev_etats = 5; }

	// Calcul de la masse
	let masse_stuff = 0, masse_weapons = 0;
	sheet.stuff.forEach(el => { masse_stuff += el[1] });
	sheet.armes['melee'].forEach(el => { masse_weapons += el[8] });
	sheet.armes['distance'].forEach(el => { masse_weapons += el[7] });
	sheet.armes['armures'].forEach(el => { masse_weapons += el[5] });
	sheet.armes['parade'].forEach(el => { masse_weapons += el[3] });

	return {
		"xp": {
			"restant": sheet.xp.total - sheet.xp.spent,
			"degree": (
				sheet.xp.total >= 2100 ? "Légendaire" :
					sheet.xp.total >= 1770 ? "Brillant" :
						sheet.xp.total >= 1400 ? "Magistral" :
							sheet.xp.total >= 1200 ? "Compétent" :
								sheet.xp.total >= 1100 ? "Expérimenté" :
									sheet.xp.total >= 1000 ? "Moyen" : "Inexpérimenté"
			),
		},
		"stats": {
			"ev": sheet.stats.ev.reduce(sum2),
			"ea": sheet.stats.ea.reduce(sum2),
			"ek": sheet.stats.ek.reduce(sum2),
			"tm": sheet.stats.tm.reduce(sum2),
			"tp": sheet.stats.tp.reduce(sum2),
			"esq": sheet.stats.esq.reduce(sum2),
			"ini": sheet.stats.ini.reduce(sum2),
			"vi": sheet.stats.vi.reduce(sum2),
		},
		"des": { "max": sheet.des.valeur + sheet.des.modif },
		"ev_etats": ev_etats,
		"masse": {
			"stuff": masse_stuff,
			"weapons": masse_weapons,
			"total": masse_stuff + masse_weapons,
			"max": sheet.qualites.fo * 2,
		}
	}
}

const saveIntervalMax = 60 * 1000;
const saveInactiveDelay = 3 * 1000;

function newSaveManager(data, prepareData, interval = 200) {
	let lastSavedData = cloneData(data);
	let lastModif = Date.now();
	let lastTrySave = Date.now();

	let manager = {
		lastSavedAt: lastModif,
		unsaved: false,
		saving: false,
		saveError: false,
		changed: function () {
			// if (!this.unsaved && !areEqual(data, lastSavedData)) {
			//	 this.unsaved = true;
			// }
			this.unsaved = true;
			lastModif = Date.now();
		},
		pushSave: function () {
			if ((this.unsaved || this.saveError)
				&& (!this.saving || Date.now() - lastTrySave > 6 * 1000)) {
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
					console.log(this);
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
	};
	setInterval(() => manager.autoSave(), interval);

	return manager;
};

/*
	Vue tools
*/

Vue.component('data-saver', {
	props: ['data', 'manager'],
	watch: {
		data: {
			handler(val) {
				this.manager.changed();
			},
			deep: true
		},
	},
	methods: {
		save: function () {
			this.manager.pushSave();
		},
		test: function () {
			console.log("pressed")
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
	props: ['name', 'dices', 'enc', 'am', 'stats'],
	data: function () {
		return {}
	},
	template: `
	<tr>
		<td>{{ name }}</td>
		<td>{{ dices }}</td>
		<td>{{ enc }}</td>
		<td>{{ am }}</td>
		<td>
			<int-input v-model.number="stats.vc"></int-input>
		</td>
		<td>
			<input type="text" v-model.trim="stats.remark" />
		</td>
	</tr>
	`,
});


Vue.component('sheet-technique', {
	props: ['name', 'q', 'am', 'stats'],
	data: function () {
		return {}
	},
	template: `
	<tr>
		<td>{{ name }}</td>
		<td>{{ q }}</td>
		<td>{{ am }}</td>
		<td>
			<int-input v-model.number="stats.vtc"></int-input>
		</td>
		<td>
			<int-input v-model.number="stats.atcd"></int-input>
		</td>
		<td v-if="'prd' in stats">
			<int-input v-model.number="stats.prd"></int-input>
		</td>
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
					"Légèrement encombré, épreuves pour les talents influencés par lʼencombrement à –1, AT –1, défense –1, INI – 1, VI – 1",
					"Encombré, épreuves pour les talents influencés par lʼencombrement à –2, AT –2, défense –2, INI – 2, VI – 2",
					"Très encombré, épreuves pour les talents influencés par lʼencombrement à –3, AT –3, défense –3, INI – 3, VI – 3",
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
	props: ["schema", "data", "titles"],
	// schema : ['int', 'str', 'str', ...]
	// data : [ [1, 'a', 'b', ...], ...]
	// titles : ["title 1", ....]
	data: function () {
		return {

		}
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
		getNewLine: function (line) {
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
		<tr v-for="line in data">
			<td v-for="(val, ival) in line">
				<input type="text" v-model.trim="line[ival]" v-if="schema[ival] == 'str'" />
				<int-input v-model.number="line[ival]" v-if="schema[ival] == 'int'" />
			</td>
		</tr>
	</table>
	`,
});

/*
	Sheet main view
*/
fetch('/web/app/comp/sheet_template.html')
	.then(response => response.text())
	.then(sheet_template => {
		Vue.component('sheet-compo', {
			props: ['socket', 'id'],
			data: function () {
				return {
					loaded: false,
					sheet: newDefaultSheet(),
					active_view: "character",
					saveManager: null,
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
							});
						}
					});
			},
			computed: {
				avatarStyle: function () {
					if (this.sheet.image) {
						return "background: url('" + this.sheet.image + "'); background-size: cover;"
					}
					return "";
				},
				avatarAnimalStyle: function () {
					if (this.sheet.animal.image) {
						return "background: url('" + this.sheet.animal.image + "'); background-size: cover;"
					}
					return "";
				},
				deriv: function () {
					return compute_derived(this.sheet);
				}
			},
			methods: {
				updateAvatar: function () {
					let nouv = prompt("Nouvelle url de l'image du personage :", this.sheet.image);
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
			},
			template: sheet_template,
		});
		window.dispatchEvent(event_sheet_loaded);
	});
