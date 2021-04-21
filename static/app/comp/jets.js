Vue.component('qual-selector', {
	props: ['num', 'quals', 'qualities'],
	data: function () {
		return {
			listVisible: false,
		};
	},
	watch: {
		quals: {
			handler(val) {
				if (this.selectedQual &&
					this.quals['qual' + this.num] != this.qualities[this.selectedQual]) {
					this.quals['select' + this.num] = null;
				}
			},
			deep: true
		},
	},
	computed: {
		selectStyle: function () {
			return {
				display: this.listVisible ? 'block' : 'none',
			}
		},
		selectedQual: function () {
			return this.quals['select' + this.num];
		},
	},
	methods: {
		toogle: function () {
			this.listVisible = !this.listVisible;
		},
		select: function (qual) {
			let val = this.qualities[qual];
			this.quals["qual" + this.num] = val;
			this.quals['select' + this.num] = qual;
			this.listVisible = false;
		},
		mouseLeave: function () {
			this.listVisible = false;
		},
	},
	template: `
	<th class="inrc_view_clickable" v-on:mouseleave="mouseLeave" v-on:click="toogle"
		v-bind:class="[selectedQual ? 'inrc_qual_' + selectedQual : false, {inrc_qual : selectedQual}]">
		<div v-if="selectedQual">{{ selectedQual.toUpperCase() }}</div>
		<div v-else>Qualité {{num}}</div>
		<div class="inrc_qual_select" v-bind:style="selectStyle" v-on:click.stop="">
			<div class="inrc_qual_co" v-on:click="select('co')">CO</div>
			<div class="inrc_qual_in" v-on:click="select('in')">IN</div>
			<div class="inrc_qual_iu" v-on:click="select('iu')">IU</div>
			<div class="inrc_qual_ch" v-on:click="select('ch')">CH</div>
			<div class="inrc_qual_de" v-on:click="select('de')">DE</div>
			<div class="inrc_qual_ag" v-on:click="select('ag')">AG</div>
			<div class="inrc_qual_cn" v-on:click="select('cn')">CN</div>
			<div class="inrc_qual_fo" v-on:click="select('fo')">FO</div>
		</div>
	</th>
	`
});

function nr_of(n) {
	if (n < 0) { return 0; }
	if (n < 4) { return 1; }
	if (n < 7) { return 2; }
	if (n < 10) { return 3; }
	if (n < 13) { return 4; }
	if (n < 16) { return 5; }
	return 6;
}

function countIn(arr, item) {
	return arr.filter(x => x === item).length;
}
function sumArr(arr) {
	return arr.reduce((a, b) => a + b, 0);
}

let computed_probas = {};
function getProbas(q1, q2, q3, vc, bonus) {
	let id = [q1, q2, q3, vc, bonus];
	if (!(id in computed_probas)) {
		q1_val = Math.min(q1 + bonus, 19)
		q2_val = Math.min(q2 + bonus, 19)
		q3_val = Math.min(q3 + bonus, 19)
		compte = new Array(7).fill(0)

		for (let a_val = 1; a_val <= 20; a_val++) {
			for (let b_val = 1; b_val <= 20; b_val++) {
				for (let c_val = 1; c_val <= 20; c_val++) {
					let quals = [[a_val, q1_val], [b_val, q2_val], [c_val, q3_val]]
					quals.sort(function (a, b) {
						return (a[0] - b[0]) || (a[1] - b[1]);
					});
					let [[a, q1], [b, q2], [c, q3]] = quals;

					let delta = vc - Math.max(0, a - q1) - Math.max(0, b - q2) - Math.max(0, c - q3);
					if (countIn([a, b, c], 1) >= 2) {
						delta = vc;
					}
					if (countIn([a, b, c], 20) >= 2) {
						delta = -1;
					}
					let nr = nr_of(delta);
					compte[nr] += 1;
				}
			}
		}
		computed_probas[id] = compte.map(n => (n / 8000));
	}
	return computed_probas[id];
}

function probaString(p) {
	return Math.round(p * 10000) / 100;
}

Vue.component('jet-competence', {
	props: ['socket', 'identity', 'config'],
	data: function () {
		return {
			quals: {
				qual1: 0,
				qual2: 0,
				qual3: 0,
				select1: null,
				select2: null,
				select3: null,
			},
			vc: 0,
			bonus: 0,
			talentLists: talentLists,
			showTalentSelect: false,
			showSpellSelect: false,
			showBonuses: false,
			rollName: '',

			magic_titles: {
				'domain': 'Domaine',
				'duree_incant': 'Durée d\'incantation',
			},
			divin_titles: {
				'domain': 'Aspect',
				'duree_incant': "Durée d'oraison",
			},
			showSpellDetails: false,
			spell: null,
			titles: null,
		};
	},
	mounted: function () {
		document.addEventListener('openRoll', e => {
			this.toogleTalentView();
		}, false);
		document.addEventListener('openSpells', e => {
			this.toogleSpellView();
		}, false);
	},
	computed: {
		nr_routine: function () {
			let bonus = Math.min(3, this.bonus);
			bonus -= Math.max(0, 13 - this.quals.qual1);
			bonus -= Math.max(0, 13 - this.quals.qual2);
			bonus -= Math.max(0, 13 - this.quals.qual3);
			if (this.vc < 10 - 3 * bonus) {
				return 0;
			}
			let pc = Math.floor(this.vc / 2);
			return Math.min(6, 1 + Math.max(0, Math.floor((pc - 1) / 3)));
		},
		success_proba: function () {
			let repartition = getProbas(this.quals.qual1, this.quals.qual2, this.quals.qual3, this.vc, this.bonus);
			let success = sumArr(repartition.slice(1));
			return `Succès : ${probaString(success)}%`;
		},
	},
	methods: {
		send: function () {
			let messageDict = {
				'type': 'competence',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'q1': { 'roll': true, 'qual': this.quals.qual1 },
				'q2': { 'roll': true, 'qual': this.quals.qual2 },
				'q3': { 'roll': true, 'qual': this.quals.qual3 },
				'on': `${this.quals.select1 ? this.quals.select1.toUpperCase() : '-'}/${this.quals.select2 ? this.quals.select2.toUpperCase() : '-'}/${this.quals.select3 ? this.quals.select3.toUpperCase() : '-'}`,
				'vc': this.vc,
				'bonus': this.bonus,
				'target': this.config.target,
				'roll_name': this.rollName,
			};
			this.socket.send_json(messageDict);
		},
		send_routine: function () {
			if (this.nr_routine != 0) {
				let messageDict = {
					'type': 'routine',
					'from': this.identity.id,
					'from_name': this.identity.name,
					'nr': this.nr_routine,
					'target': this.config.target,
				};
				this.socket.send_json(messageDict);
			}
		},
		toogleTalentView: function () {
			this.showTalentSelect = !this.showTalentSelect;
		},
		toogleBonusView: function () {
			this.showBonuses = !this.showBonuses;
		},
		toogleSpellView: function () {
			this.showSpellSelect = !this.showSpellSelect;
		},
		selectTalent: function (rollOn, vc, name) {
			let quals = rollOn.toLowerCase().split("/");
			this.vc = vc;
			this.quals.qual1 = this.identity.sheet.qualites[quals[0]];
			this.quals.qual2 = this.identity.sheet.qualites[quals[1]];
			this.quals.qual3 = this.identity.sheet.qualites[quals[2]];
			this.quals.select1 = quals[0];
			this.quals.select2 = quals[1];
			this.quals.select3 = quals[2];
			this.showTalentSelect = false;
			this.showSpellSelect = false;
			this.rollName = name;
			// this.bonus = 0;
		},
		displaySpell: function (titles, spell) {
			this.spell = spell;
			this.titles = titles;
			this.showSpellDetails = true;
		},
	},
	template: `
	<div class="inrc_view">
		<table>
			<tr>
				<qual-selector v-bind:quals="quals" v-bind:num="1" v-bind:qualities="identity.sheet.qualites"></qual-selector>
				<qual-selector v-bind:quals="quals" v-bind:num="2" v-bind:qualities="identity.sheet.qualites"></qual-selector>
				<qual-selector v-bind:quals="quals" v-bind:num="3" v-bind:qualities="identity.sheet.qualites"></qual-selector>
				<th class="inrc_view_clickable" v-on:click="toogleTalentView">VC</th>
				<th :data-tooltip="success_proba" class="inrc_view_clickable" v-on:click="toogleBonusView">Bonus / Malus</th>
			</tr>
			<tr>
				<td><input type="number" v-model.number="quals.qual1"></td>
				<td><input type="number" v-model.number="quals.qual2"></td>
				<td><input type="number" v-model.number="quals.qual3"></td>
				<td><input type="number" v-model.number="vc"></td>
				<td><input type="number" v-model.number="bonus"></td>
			</tr>
		</table>
		<div class="inrc_routine" v-on:click="send_routine" v-bind:class="{inrc_routine_allowed: nr_routine!=0}">
			<span>Épreuve de routine:</span>
			<span v-if="nr_routine==0">impossible</span>
			<span v-if="nr_routine!=0">NR = {{nr_routine}}</span>
		</div>
		<div class="inrc_actions inrc_actions_2">
			<input class="inrc_roll_name" v-model.trim="rollName" placeholder="Nom de la compétence..." />
			<button class="inrc_send" v-on:click="send">Effectuer le jet</button>
		</div>

		<template v-if="showTalentSelect">
			<div class="winBack" v-on:click.self="toogleTalentView"></div>
			<div class="talent_select select_win scrollable">
				<div class="col_in_win">
					<h3>Talents physiques</h3>
					<inrc-selector-talent v-for="tal in talentLists.phy"
						v-bind:eventFct="selectTalent"
						v-bind:talents="identity.sheet.talents" v-bind:cat="'phy'" 
						v-bind:stat="tal" v-bind:key="'stal_phy_' + tal"></inrc-selector-talent>

					<h3>Talents sociaux</h3>
					<inrc-selector-talent v-for="tal in talentLists.soc"
						v-bind:eventFct="selectTalent"
						v-bind:talents="identity.sheet.talents" v-bind:cat="'soc'" 
						v-bind:stat="tal" v-bind:key="'stal_soc_' + tal"></inrc-selector-talent>

					<h3>Talents de nature</h3>
					<inrc-selector-talent v-for="tal in talentLists.nat"
						v-bind:eventFct="selectTalent"
						v-bind:talents="identity.sheet.talents" v-bind:cat="'nat'" 
						v-bind:stat="tal" v-bind:key="'stal_nat_' + tal"></inrc-selector-talent>
				</div>
				<div class="col_in_win">
					<h3>Connaissances</h3>
					<inrc-selector-talent v-for="tal in talentLists.connaissance"
						v-bind:eventFct="selectTalent"
						v-bind:talents="identity.sheet.talents" v-bind:cat="'connaissance'" 
						v-bind:stat="tal" v-bind:key="'stal_connaissance_' + tal"></inrc-selector-talent>
					
					<h3>Savoir-faire</h3>
					<inrc-selector-talent v-for="tal in talentLists.savoir"
						v-bind:eventFct="selectTalent"
						v-bind:talents="identity.sheet.talents" v-bind:cat="'savoir'" 
						v-bind:stat="tal" v-bind:key="'stal_savoir_' + tal"></inrc-selector-talent>
				</div>
			</div>
		</template>

		<template v-if="showSpellSelect">
			<div class="winBack" v-on:click.self="toogleSpellView"></div>
			<div class="talent_select select_win scrollable">
				<template v-if="identity.deriv.stats.ea">
					<h3>Sortilièges</h3>
					<select-spell-item v-for="(w, iw) in identity.sheet.sorts" :key="'spell_' + iw" :eventFct="selectTalent" :spell="w" :titles="divin_titles" :showFct="displaySpell"></select-spell-item>
				</template>

				<template v-if="identity.deriv.stats.ek">
					<h3>Liturgies</h3>
					<select-spell-item v-for="(w, iw) in identity.sheet.liturgies" :key="'liturgie_' + iw" :eventFct="selectTalent" :spell="w" :titles="magic_titles" :showFct="displaySpell"></select-spell-item>
				</template>
			</div>
		</template>

		<template v-if="showSpellDetails">
			<div class="winBack" v-on:click.stop="showSpellDetails = false;"></div>
			<div class="select_win scrollable">
				<h3>{{ spell[0] }}</h3>
				<div class="col_in_win">
					<strong>Nom :</strong> {{ spell[0] }} <br>
					<strong>Épreuve :</strong> {{ spell[1] }} <br>
					<strong>Valeur de compétence (VC) :</strong> {{ spell[2] }} <br>
					<strong>{{titles.domain}} :</strong> {{ spell[7] }} <br>
				</div>
				<div class="col_in_win">
					<strong>Coût :</strong> {{ spell[3] }} <br>
					<strong>Durée :</strong> {{ spell[4] }} <br>
					<strong>Portée :</strong> {{ spell[5] }} <br>
					<strong>{{titles.duree_incant}} :</strong> {{ spell[6] }} <br>
				</div>
				<h4>Description</h4>
				<p style="text-align:left;">{{ spell[9] }}</p>
				<button v-on:click="showSpellDetails = false;" class="centerButton">Fermer</button>
			</div>
		</template>

		<template v-if="showBonuses">
			<div class="winBack" v-on:click.self="toogleBonusView"></div>
			<div class="bonusesWin select_win scrollable" v-on:click="toogleBonusView">
				<div class="col_in_win">
					<h3>Compétence</h3>
					Prendre en compte les états, status, et l'encombrement si applicable.
					<h4>Gêne visuelle</h4>
					<ul>
						<li>Niveau I (feuillage léger, brume légère) : <em>-1</em></li>
						<li>Niveau II (Brouillard, pleine lune) : <em>-2</em></li>
						<li>Niveau III (Boruillard épas, nuit sans lune) : <em>-3</em></li>
						<li>Niveau IV (obscurité totale) : <em>-4</em></li>
					</ul>


					<h3>Magie et divin</h3>

					Pour un sort de tradition étrangère : -2<br>
					Banissement du fer : malus de -1 par tranche de 2 pierres de fer ou aliage portées sur soi.<br>
					Agir selon le codex d'un dieu peut octroyer un bonus. De même pour les sorcières agissant selon leur émotions.

				</div>
				<div class="col_in_win">
					<h3>Modifications de sorts / liturgies</h3>

					<h4>Moditication de sorts, rituels, litugies, cérémonies</h4>
					(Max : 1 modification / 4 VC, impossible sur les sorts de tradition étrangère)
					<ul>
						<li>Consolider : <em>+1, coût +1 niv</em></li>
						<li>Diminuer le coût : <em>-1, coût -1 niv</em></li>
						<li>Portée : <em>-1, portée +1 niv</em></li>
						<li>Durée d'incantation (+) : <em>+1, durée +1 niv</em></li>
						<li>Durée d'incantation (-) : <em>-1, durée -1 niv</em></li>
						<li>Sans les gestes / paroles (-) [sorts et liturgies] : <em>-2 ou -4</em></li>
					</ul>

					<h4>Niveaux de sorts et liturgies</h4>
					<table>
						<tr>
							<th>Durée</th>
							<td>1 action	</td>
							<td>2</td>
							<td>3</td>
							<td>8</td>
							<td>16</td>
							<td>32</td>
						</tr>
						<tr>
							<th>Portée</th>
							<td>contact</td>
							<td>4</td>
							<td>8</td>
							<td>16</td>
							<td>32</td>
							<td>64</td>
						</tr>
						<tr>
							<th>Coût</th>
							<td>1 PA/PK</td>
							<td>2</td>
							<td>4</td>
							<td>8</td>
							<td>16</td>
							<td>32</td>
						</tr>
					</table>

					<h4>Niveaux de rituels / cérémonies</h4>
					<table>
						<tr>
							<th>Durée</th>
							<td>5m</td>
							<td>30m</td>
							<td>3h</td>
							<td>8h</td>
							<td>16h</td>
							<td>32h</td>
						</tr>
						<tr>
							<th>Portée</th>
							<td>contact</td>
							<td>4</td>
							<td>8</td>
							<td>16</td>
							<td>32</td>
							<td>64</td>
						</tr>
						<tr>
							<th>Coût</th>
							<td>8 PA/PK</td>
							<td>16</td>
							<td>32</td>
							<td>64</td>
							<td>128</td>
							<td>256</td>
						</tr>
					</table>
					Rituels et cérémonies : modificateurs selon le lieu, la tenue, le moment, les outils... (se repporter aux règles).
				</div>
			</div>
		</template>
	</div>`
});

Vue.component('inrc-selector-talent', {
	props: ['eventFct', 'talents', 'cat', 'stat'],
	data: function () {
		return {
			talent: this.talents[this.cat][this.stat],
			infos: talentInfos[this.cat][this.stat],
		};
	},
	methods: {
		select: function () {
			this.eventFct(this.infos.roll, this.talent.vc, this.infos.name);
		},
	},
	template: `
	<div class="inrc_talent inrc_talent_select" v-on:click="select">
		<span class="inrc_tal_name">{{ infos.name }}</span>
		<span class="inrc_tal_roll">({{ infos.roll }})</span>
		<span class="inrc_tal_enc" v-if="infos.enc!='NON'">[ENC : {{infos.enc}}]</span>
		<span class="inrc_tal_val">{{ talent.vc }}</span>
	</div>
	`,
});

Vue.component('select-spell-item', {
	props: ['eventFct', 'titles', 'spell', 'showFct'],
	data: function () {
		let qs = this.spell[1].toLowerCase().split('/');
		return {
			qualsOk: qs.length == 3 && qualNames.includes(qs[0])
				&& qualNames.includes(qs[1]) && qualNames.includes(qs[2]),
			showDetails: false,
			vc: this.spell[2],
			roll: this.spell[1],
			name: this.spell[0],
		};
	},
	methods: {
		select: function () {
			if (this.qualsOk) {
				this.eventFct(this.roll, this.vc, this.name);
			} else {
				alert(`Erreur : "${this.roll}" n'a pas le bon format pour l'épreuve de talent (Q1/Q2/Q3)`);
			}
		},
	},
	template: `
	<div>
		<div class="inrc_talent" v-if="name.trim()">
			<div class="inrc_tal_show simpleButton" v-on:click="showFct(titles, spell)"></div>
			<div class="inrc_talent_select" v-on:click="select" v-bind:class="{inrc_spell_error : !qualsOk}">
				<span class="inrc_tal_name">{{ name }}</span>
				<span class="inrc_tal_roll">({{ roll }})</span>
				<span class="inrc_tal_val">{{ vc }}</span>
			</div>
		</div>
	</div>
	`,
});

Vue.component('reroll-competence', {
	props: ['socket', 'identity', 'reroll_comp'],
	data: function () {
		let dataVals = {
			qual1: this.reroll_comp.dice.q1.qual,
			qual2: this.reroll_comp.dice.q2.qual,
			qual3: this.reroll_comp.dice.q3.qual,
			dice1: this.reroll_comp.dice.q1.dice,
			dice2: this.reroll_comp.dice.q2.dice,
			dice3: this.reroll_comp.dice.q3.dice,
			reroll1: false,
			reroll2: false,
			reroll3: false,
			vc: this.reroll_comp.dice.vc,
			bonus: this.reroll_comp.dice.bonus,
			target: (typeof this.reroll_comp.dice.target == "string" ?
				this.reroll_comp.dice.target : "all"),
			select1: null,
			select2: null,
			select3: null,
		};
		let rolledOn = this.reroll_comp.dice.on.split('/');
		if (rolledOn.length == 3) {
			if (rolledOn[0].length == 2) { dataVals.select1 = rolledOn[0].toUpperCase(); }
			if (rolledOn[1].length == 2) { dataVals.select2 = rolledOn[1].toUpperCase(); }
			if (rolledOn[2].length == 2) { dataVals.select3 = rolledOn[2].toUpperCase(); }
		}
		return dataVals;
	},
	methods: {
		send: function () {
			let messageDict = {
				'type': 'competence',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'q1': { 'roll': this.reroll1, 'qual': this.qual1, 'dice': this.dice1 },
				'q2': { 'roll': this.reroll2, 'qual': this.qual2, 'dice': this.dice2 },
				'q3': { 'roll': this.reroll3, 'qual': this.qual3, 'dice': this.dice3 },
				'vc': this.vc,
				'on': this.reroll_comp.dice.on,
				'bonus': this.bonus,
				'target': this.target,
			};
			this.socket.send_json(messageDict);
			this.close();
		},
		close: function () {
			this.reroll_comp.dice = null;
		},
	},
	template: `
	<div class="inrc_view reroll_comp_view">
		<table>
			<tr>
				<th v-bind:class="[select1 ? 'inrc_qual_' + select1.toLowerCase() : false, select1 ? 'inrc_qual' : false]">{{ select1 ? select1 : 'Qualité 1' }}</th>
				<th v-bind:class="[select2 ? 'inrc_qual_' + select2.toLowerCase() : false, select2 ? 'inrc_qual' : false]">{{ select2 ? select2 : 'Qualité 2' }}</th>
				<th v-bind:class="[select3 ? 'inrc_qual_' + select3.toLowerCase() : false, select3 ? 'inrc_qual' : false]">{{ select3 ? select3 : 'Qualité 3' }}</th>
				<th>VC</th>
				<th>Bonus / Malus</th>
			</tr>
			<tr>
				<td><input type="number" v-model.number="qual1"></td>
				<td><input type="number" v-model.number="qual2"></td>
				<td><input type="number" v-model.number="qual3"></td>
				<td><input type="number" v-model.number="vc"></td>
				<td><input type="number" v-model.number="bonus"></td>
			</tr>
		</table>
		<div class="list_reroll">
			<div>Qualités : {{this.qual1}} / {{this.qual2}} / {{this.qual3}}</div>
			<div class="dice_reroll_ask" v-bind:class="{dice_for_reroll : reroll1}" v-on:click="reroll1 = !reroll1">{{ dice1 }}</div>
			<div class="dice_reroll_ask" v-bind:class="{dice_for_reroll : reroll2}" v-on:click="reroll2 = !reroll2">{{ dice2 }}</div>
			<div class="dice_reroll_ask" v-bind:class="{dice_for_reroll : reroll3}" v-on:click="reroll3 = !reroll3">{{ dice3 }}</div>
		</div>
		<div class="inrc_actions">
			<button class="inrc_send" v-on:click="send" v-bind:disabled="!(reroll1 || reroll2 || reroll3)">
				Relancer les dés
				{{ target == 'self' ? "(jet caché)"
					: (target == 'game_master' ? "(derrière l'écran)"
					: "(jet public)")}}
			</button>
			<button class="inrc_send" v-on:click="close">Annuler</button>
		</div>
	</div>`
});

/*
	Fight rolls
*/

Vue.component('jet-fight', {
	props: ['socket', 'identity', 'config'],
	data: function () {
		return {
			ini: this.identity.deriv.stats.ini,
			at: 0,
			modif_at: 0,
			damages: '1D1-1',
			prd: 0,
			esq: this.identity.deriv.stats.esq,
			showAttackSelect: false,
			showBonuses: false,
			weaponName: '',
		};
	},
	mounted: function () {
		document.addEventListener('openWeapons', e => {
			this.toogleAttackView();
		}, false);
	},
	computed: {
		hasRanged: function () {
			return this.doesTablExists(this.identity.sheet.armes.distance);
		},
		hasArmor: function () {
			return this.doesTablExists(this.identity.sheet.armes.armures);
		},
		hasShield: function () {
			return this.doesTablExists(this.identity.sheet.armes.parade);
		},
	},
	methods: {
		doesTablExists: function (table) {
			for (let el of table) {
				if (el[0].length > 0) {
					return true;
				}
			}
			return false;
		},
		sendIni: function () {
			this.socket.send_json({
				'type': 'initiative',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'roll': this.ini + '+1d6',
				'target': this.config.target,
			});
		},
		sendAttack: function () {
			this.socket.send_json({
				'type': 'attack',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'roll': this.at + this.modif_at,
				'target': this.config.target,
				'using': this.weaponName,
			});
		},
		sendDmg: function () {
			this.socket.send_json({
				'type': 'damages',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'roll': '' + this.damages,
				'target': this.config.target,
				'using': this.weaponName,
			});
		},
		sendPrd: function () {
			this.socket.send_json({
				'type': 'parade',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'roll': this.prd,
				'target': this.config.target,
				'using': this.weaponName,
			});
		},
		sendEsq: function () {
			this.socket.send_json({
				'type': 'esquive',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'roll': this.esq,
				'target': this.config.target,
			});
		},
		toogleAttackView: function () {
			this.showAttackSelect = !this.showAttackSelect;
		},
		toogleBonusView: function () {
			this.showBonuses = !this.showBonuses;
		},
		selectWeapon: function (name, at, prd, pi) {
			this.weaponName = name;
			this.showAttackSelect = false;
			this.at = at === null ? this.at : at;
			this.prd = prd === null ? this.prd : prd;
			this.damages = pi === null ? this.damages : '' + pi;
		},
	},
	template: `
	<div class="rfight_view">
		<table>
			<tr>
				<th data-tooltip="Initiative">Initiative ({{ identity.deriv.stats.ini }})</th>
				<th class="inrc_view_clickable" v-on:click="toogleAttackView">Attaque</th>
				<th class="inrc_view_clickable" v-on:click="toogleBonusView">Bonus / Malus</th>
				<th>Dégâts</th>
				<th>Parade</th>
				<th data-tooltip="Esquive">Esquive (1{{ identity.deriv.stats.esq }})</th>
			</tr>
			<tr>
				<td><input type="number" v-model.number="ini"></td>
				<td><input type="number" v-model.number="at"></td>
				<td><input type="number" v-model.number="modif_at"></td>
				<td><input type="text" v-model.trim="damages" style="width: 5em;"></td>
				<td><input type="number" v-model.number="prd"></td>
				<td><input type="number" v-model.number="esq"></td>
			</tr>
			<tr>
				<td><button class="rfight_ini" v-on:click="sendIni">Jet d'INI</button></td>
				<td colspan="2"><button class="rfight_at" v-on:click="sendAttack">Attaquer</button></td>
				<td><button class="rfight_dmg" v-on:click="sendDmg">Jet dégâts</button></td>
				<td><button class="rfight_prd" v-on:click="sendPrd">Parer</button></td>
				<td><button class="rfight_esq" v-on:click="sendEsq">Esquiver</button></td>
			</tr>
			<tr>
				<td></td>
				<td colspan="4" class="rfight_weapon_name">
					<input v-model.trim="weaponName" placeholder="Nom de l'arme..." />
				</td>
				<td></td>
			</tr>
		</table>


		<template v-if="showAttackSelect">
			<div class="winBack" v-on:click.self="toogleAttackView"></div>
			<div class="attack_select select_win scrollable niceInputs">
				<h3>Armes de contact</h3>
				<select-weapon-item v-for="(w, iw) in identity.sheet.armes.melee" :key="'melee_' + iw" :eventFct="selectWeapon" :name="w[0]" :pi="w[3]" :at="w[6]" :prd="w[7]" :al="w[5]"></select-weapon-item>

				<template v-if="hasRanged">
					<h3>Armes à distance</h3>
					<select-weapon-item v-for="(w, iw) in identity.sheet.armes.distance" :key="'dist_' + iw" :eventFct="selectWeapon" :name="w[0]" :pi="w[3]" :at="w[6]" :prd="0" :po="w[5]" :dc="w[2]"></select-weapon-item>

					<h4>Munitions</h4>
					<div v-for="(w, iw) in identity.sheet.armes.distance" :key="'munitons_' + iw" v-if="w[0].length > 0" class="minutions_row">
						<span>{{ w[0] }} :</span>
						<input type="text" style="width: 10em; text-align: left;" v-model="w[4]" class="field" />
					</div>
				</template>

				<template v-if="hasArmor">
					<h3>Armure</h3>

					<div v-for="(w, iw) in identity.sheet.armes.armures" :key="'armor_' + iw" v-if="w[0].length > 0" class="pr_row">
						<span class="weapon_name">{{ w[0] }} </span>
						<span class="weapon_infos">(Protection {{ w[1] }})</span>
					</div>
				</template>

				<template v-if="hasShield">
					<h3>Boucliers(s)</h3>

					<div v-for="(w, iw) in identity.sheet.armes.parade" :key="'shield_' + iw" v-if="w[0].length > 0" class="pr_row">
						<span class="weapon_name">{{ w[0] }} </span>
						<span class="weapon_infos">(Protection {{ w[2] }})</span>
					</div>
				</template>
			</div>
		</template>

		<template v-if="showBonuses">
			<div class="winBack" v-on:click.self="toogleBonusView"></div>
			<div class="bonusesWin select_win scrollable" v-on:click="toogleBonusView">
				Prendre en compte les états, status, et l'encombrement si applicable.
				<div class="col_in_win">
					<h3>Combat rapproché</h3>

					Position avantageuse : +2 AT/PRD/ESQ<br>
					Attaqué de dos : -4 PRD / -4 ESQ <br>
					Manier une arme à une main avec 2 mains : PI+1, PRD-1 (sauf dague/duel).

					<h4>Taille d'armes</h4>
					<ul>
						<li>Courte contre moyenne : <em>-2 AT</em></li>
						<li>Courte contre longue : <em>-4 AT</em></li>
						<li>Moyenne contre longue : <em>-2 AT</em></li>
					</ul>

					<h4>Taille de l'adversaire</h4>
					<ul>
						<li>Très petit (rat) : <em>-4 AT</em></li>
						<li>Petit (Chèvre) / Moyen (Humain) : <em>-4 AT</em></li>
						<li>Grand (Ogre) : <em>parade : bouclier uniquement</em></li>
						<li>Très grand (Dragon) : <em>PRD=0</em></li>
					</ul>

					<h4>Espace restreint</h4>
					<ul>
						<li>Arme courte : <em>±0 AT / ±0 PRD</em></li>
						<li>Arme moyenne : <em>-4 AT / -4 PRD</em></li>
						<li>Arme longue : <em>-8 AT / -8 PRD</em></li>
						<li>Petit bouclier : <em>-2 AT / -2 PRD</em></li>
						<li>Bouclier moyen : <em>-4 AT / -3 PRD</em></li>
						<li>Grand bouclier : <em>-6 AT / -4 PRD</em></li>
					</ul>

					<h4>Défense contre une attaque à distance</h4>
					<ul>
						<li>Arme de tir : <em>-4 PRD / -4 ESQ</em></li>
						<li>Arme de jet : <em>-2 PRD / -2 ESQ</em></li>
					</ul>
				</div>
				<div class="col_in_win">
					<h3>Combat à distance</h3>

					Il est possible de viser pendant 1 ou 2 tours pour obtenir +2 ou +4 au tir.

					<h4>Portée</h4>
					<ul>
						<li>Courte : <em>+2 CD, +1 PI</em></li>
						<li>Moyenne : <em>±0 CD</em></li>
						<li>Longue : <em>-2 CD, -1 PI</em></li>
					</ul>

					<h4>Taille de l'adversaire</h4>
					<ul>
						<li>Très petit (rat) : <em>-8 CD</em></li>
						<li>Petit (Chèvre) : <em>-4 CD</em></li>
						<li>Moyen (Humain) : <em>±0 CD</em></li>
						<li>Grand (Ogre) : <em>+4 CD</em></li>
						<li>Très grand (Dragon) : <em>+8 CD</em></li>
					</ul>

					<h4>Mouvement</h4>
					<ul>
						<li>Cible immobile : <em>+2 CD</em></li>
						<li>Cible bouge peu (≤ 4 pas) : <em>±0 CD</em></li>
						<li>Cible boude rapidement (≥ 5 pas) : <em>-2 CD</em></li>
						<li>Cible court en zigzag : <em>-4 CD, VI cible/2</em></li>
						<li>Tirer en marchant (≤ 4 pas) : <em>-2 CD</em></li>
						<li>Tirer en courant (≥ 5 pas) : <em>-4 CD</em></li>
					</ul>

					<h4>À cheval</h4>
					<ul>
						<li>Monture immobile : <em>±0 CD</em></li>
						<li>Monture au pas : <em>-2 CD</em></li>
						<li>Monture au trot : <em>1 sur 1D20</em></li>
						<li>Monture au galop : <em>-8 CD</em></li>
					</ul>
				</div>
				
				<h3>Gêne visuelle</h3>
				<ul>
					<li>Niveau I (feuillage léger, brume légère) : <em>-1 AT / -1 PRD / -1 ESQ / -2 CD</em></li>
					<li>Niveau II (Brouillard, pleine lune) : <em>-2 AT / -2 PRD / -2 ESQ / -4 CD</em></li>
					<li>Niveau III (Boruillard épas, nuit sans lune) : <em>-3 AT / -3 PRD / -3 ESQ / -6 CD</em></li>
					<li>Niveau IV (obscurité totale) : <em>AT/2 / PRD, ESQ, CD uniquement avec 1 sur 1D20 (pas de défense contre CD)</em></li>
				</ul>
			</div>
		</template>
	</div>
	`,
});

Vue.component('select-weapon-item', {
	props: ['eventFct', 'name', 'pi', 'at', 'prd', 'po', 'al', 'dc'],
	data: function () {
		return {
		};
	},
	methods: {
		select: function () {
			this.eventFct(this.name, this.at, this.prd, this.pi);
		},
	},
	template: `
	<div>
		<div class="select_weapon_item" v-on:click="select" v-if="name.trim()">
			<span class="weapon_name">{{ name }}</span>
			<span class="weapon_infos">(<!--
				--><template v-if="!dc && !po">{{ pi }} PI</template><!--
				--><template v-if="po">Portée {{po}}</template><!--
				--><template v-if="al">, allonge {{al}}</template><!--
				--><template v-if="dc">, charger : {{dc}}</template><!--
			-->)</span>
		</div>
	</div>
	`,
});
