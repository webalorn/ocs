/*
	Sheet short view
*/
Vue.component('sheet-short-view', {
	props: ['identity', 'table', 'id', 'socket', 'isgm'],
	data: function () {
		return {
			sheet: null,
			saveManager: null,
			editSheet: false,
			status: {
				details: { open: false },
				edit_status_etats: { open: false },
			}
		}
	},
	watch: {
		sheet: {
			handler(val) {
				if (this.editSheet) {
					this.saveManager.changed(this.sheet);
				}
			},
			deep: true,
		},
	},
	mounted: function () {
		let url = "/api/sheet/" + this.id;
		if (this.identity.id == this.id) {
			this.editSheet = true;
		}
		fetch(url)
			.then(answer => answer.json())
			.then(data => {
				let sheet = data.content;
				updateSheetVersion(sheet);
				this.setSheet(sheet);

				if (this.editSheet) {
					this.saveManager = newSaveManager(this.sheet, sheet => {
						let url = "/api/sheet/" + this.id;
						let data = {
							"id": this.id,
							"content": sheet
						};
						return [url, data];
					}, 1000);
				}
			});
		this.socket.register((event, data) => {
			if (data.type == 'notification' && data.on == 'sheet' && data.sheet_id == this.id) {
				if (this.editSheet) {
					this.saveManager.remoteUpdate(data.new_data.content);
					this.identity.deriv = compute_derived(this.sheet);
				} else {
					this.setSheet(data.new_data.content);
				}
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
		deriv: function () {
			return compute_derived(this.sheet);
		},
	},
	methods: {
		edit: function () {
			let url = "/web/sheet.html?view=full&id=" + this.id;
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
		openDetails: function () {
			this.status.details.open = true;
		},
		setSheet: function (sheet) {
			this.sheet = sheet;
			if (this.id === this.identity.id) {
				this.identity.sheet = sheet;
				this.identity.deriv = compute_derived(sheet);
				this.identity.initOk = true;
			}
		},
	},
	template: `
	<div class="sheet_short_view">
	<template v-if="sheet">
		<div class="ssv_head">
			<div class="ssv_avatar" v-bind:style="avatarStyle" v-on:click="openDetails"></div>
			<div class="header_infos">
				<span class="char_name">{{sheet.head.nom}}</span>
				<br>
				<template v-if="sheet.owner">
					<label>Joueur :</label>
					<span>{{sheet.owner}}</span>
					<br>
				</template>
				<label>PAV :</label>
				<span>{{sheet.xp.total}} ({{ deriv.xp.degree }})</span>
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
				<label data-tooltip="Points de vie">PV :</label>
				<int-input v-model.number="sheet.cur_stats.ev" style="width: 4em; text-align: right;" v-if="editSheet" />
				<span v-else>{{sheet.cur_stats.ev}}</span>
				<span> / {{ deriv.stats.ev }}</span>
				<br v-if="editSheet">
				<span v-if="deriv.ev_etats == 1" class="ev_niv_1" data-tooltip="+1 Douleur">Touché (1)</span>
				<span v-if="deriv.ev_etats == 2" class="ev_niv_2" data-tooltip="+2 Douleur">Touché (2)</span>
				<span v-if="deriv.ev_etats == 3" class="ev_niv_3" data-tooltip="+3 Douleur">Touché (3)</span>
				<span v-if="deriv.ev_etats == 4" class="ev_niv_4" data-tooltip="+4 Douleur">Touché (4)</span>
				<span v-if="deriv.ev_etats == 5" class="ev_niv_5">Mourant</span>
				<br>
				<template v-if="deriv.stats.ea != 0">
					<label data-tooltip="Énergie astrale (magie)">PA :</label>
					<int-input v-model.number="sheet.cur_stats.ea" style="width: 4em; text-align: right;" v-if="editSheet" />
					<span v-else>{{sheet.cur_stats.ea}}</span>
					<span> / {{ deriv.stats.ea }}</span>
					<br>
				</template>
				<template v-if="deriv.stats.ek != 0">
					<label data-tooltip="Énergie karmique (divin)">PK :</label>
					<int-input v-model.number="sheet.cur_stats.ek" style="width: 4em; text-align: right;" v-if="editSheet" />
					<span v-else>{{sheet.cur_stats.ek}}</span>
					<span> / {{ deriv.stats.ek }}</span>
					<br>
				</template>
				<template v-if="editSheet">
					<label data-tooltip="Points de destin">Destin :</label>
					<int-input v-model.number="sheet.des.actuels" style="width: 2em; text-align: center;" v-if="editSheet" />
					<span> / {{ deriv.des.max }}</span>
				</template>
			</div>
			<div class="header_infos" v-if="editSheet">
				<label>Vitesse :</label>
				<span>{{ deriv.stats.vi }}</span>
				<br>
				<label data-tooltip="Ténacité mentale">TM :</label>
				<span>{{ deriv.stats.tm }}</span>
				<br>
				<label data-tooltip="Ténacité physique">TP :</label>
				<span>{{ deriv.stats.tp }}</span>
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
			<div class="champ_in champ_ste">
				<label>Status & États</label>
				<button v-on:click="status.edit_status_etats.open=true;" v-if="editSheet">Modifier</button>
			</div>
			<div class="ssv_status">{{ sheet.status }}</div>
			<sheet-etats-display v-bind:etats="sheet.etats"></sheet-etats-display>
			<div class="ssv_status">{{ sheet.modifs_qualites }}</div>
		</div>
		<sheet-show-details :sheet="sheet" :status="status.details" :isgm="isgm" :table="table" :id="id">
		</sheet-show-details>
		<sheet-edit-status-etats :sheet="sheet" :status="status.edit_status_etats">
		</sheet-edit-status-etats>
	</template>
	</div>`,
});

Vue.component('sheet-show-details', {
	props: ['sheet', 'status', 'isgm', 'table', 'id'],
	methods: {
		close: function () {
			this.status.open = false;
		},
	},
	computed: {
		invite_url: function () {
			if (this.isgm) {
				return window.location.protocol + '//' + window.location.host + '/web/table.html?table=' + this.table + '&id=' + this.id;
			}
			return null;
		},
	},
	template: `
<div>
	<template v-if="status.open">
		<div class="winBack" v-on:click="close"></div>
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

			<div class="win_bottom">
				<button v-on:click="close">Fermer</button>
			</div>
		</div>
	</template>
</div>`,
});


Vue.component('sheet-edit-status-etats', {
	props: ['sheet', 'status'],
	methods: {
		close: function () {
			this.status.open = false;
		},
	},
	template: `
<div>
	<template v-if="status.open">
		<div class="winBack" v-on:click="close"></div>
		<div class="select_win scrollable winSte niceInputs">
			<div class="col_container">
				<div class="column">
					<h3>Status</h3>
					<etats-table :sheet="sheet"></etats-table>
				</div>
				<div class="column">
					<h3>États</h3>
					<textarea class="s_textarea" v-model="sheet.status"></textarea>
				</div>
				<div class="column">
					<h3>Modifications des valeurs</h3>
					<textarea class="s_textarea" v-model="sheet.modifs_qualites"></textarea>
				</div>
			</div>
			<div class="win_bottom">
				<button v-on:click="close">Fermer</button>
			</div>
		</div>
	</template>
</div>`,
});

Vue.component('show-bag', {
	props: ['identity'],
	data: function () {
		return {
			open: false,
		};
	},
	mounted: function () {
		document.addEventListener('openBag', e => {
			this.open = true;
		}, false);
	},
	methods: {
		close: function () {
			this.open = false;
		},
	},
	template: `
<div>
	<template v-if="open">
		<div class="winBack" v-on:click="close"></div>
		<div class="select_win scrollable winBag niceInputs">
		<table class="s_table table_argent">
			<tr>
				<td>
					<int-input v-model.number="identity.sheet.argent[0]"></int-input>
				</td>
				<td>
					<int-input v-model.number="identity.sheet.argent[1]"></int-input>
				</td>
				<td>
					<int-input v-model.number="identity.sheet.argent[2]"></int-input>
				</td>
				<td>
					<int-input v-model.number="identity.sheet.argent[3]"></int-input>
				</td>
			</tr>
			<tr>
				<th>Croisés</th>
				<th>Deniers</th>
				<th>Thalers</th>
				<th>Ducats</th>
			</tr>
		</table>
			<h3>Possessions</h3>
			<div class="bag_item_list">
				<template v-for="(obj, i) in identity.sheet.stuff">
					<div v-if="obj[0]" class="bag_item">
					{{obj[0]}}
					</div>
					<div v-else class="bag_sep"></div>
				</template>
			</div>
			<div class="win_bottom">
				<button v-on:click="close">Fermer</button>
			</div>
		</div>
	</template>
</div>`,
});
