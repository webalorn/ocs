Vue.component('qual-selector', {
	props: ['num', 'quals', 'qualities'],
	data: function () {
		return {
			listVisible: false,
		};
	},
	computed: {
		selectStyle: function () {
			return {
				display: this.listVisible ? 'block' : 'none',
			}
		},
	},
	methods: {
		toogle: function () {
			this.listVisible = !this.listVisible;
		},
		select: function (val) {
			this.quals["qual" + this.num] = val;
			this.listVisible = false;
		},
		mouseLeave: function () {
			this.listVisible = false;
		},
	},
	template: `
	<th class="inrc_view_clickable" v-on:mouseleave="mouseLeave" v-on:click="toogle">
		<div>Qualité {{num}}</div>
		<div class="inrc_qual_select" v-bind:style="selectStyle" v-on:click.stop="">
			<div class="inrc_qual_co" v-on:click="select(qualities.co)">CO</div>
			<div class="inrc_qual_in" v-on:click="select(qualities.in)">IN</div>
			<div class="inrc_qual_iu" v-on:click="select(qualities.iu)">IU</div>
			<div class="inrc_qual_ch" v-on:click="select(qualities.ch)">CH</div>
			<div class="inrc_qual_de" v-on:click="select(qualities.de)">DE</div>
			<div class="inrc_qual_ag" v-on:click="select(qualities.ag)">AG</div>
			<div class="inrc_qual_cn" v-on:click="select(qualities.cn)">CN</div>
			<div class="inrc_qual_fo" v-on:click="select(qualities.fo)">FO</div>
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
		q1_val = Math.min(Math.max(q1 + bonus, 0), 19)
		q2_val = Math.min(Math.max(q2 + bonus, 0), 19)
		q3_val = Math.min(Math.max(q3 + bonus, 0), 19)
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
	props: ['socket', 'identity'],
	data: function () {
		return {
			quals: {
				qual1: 8,
				qual2: 8,
				qual3: 8,
			},
			vc: 0,
			bonus: 0,
			showTalentSelect: false,
			talentLists: talentLists,
		};
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
			return 1 + Math.max(0, Math.floor((pc - 1) / 3));
		},
		success_proba: function () {
			let repartition = getProbas(this.quals.qual1, this.quals.qual2, this.quals.qual3, this.vc, this.bonus);
			let success = sumArr(repartition.slice(1));
			return `Succès : ${probaString(success)}%`;
		},
	},
	methods: {
		send: function (target) {
			let messageDict = {
				'type': 'competence',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'q1': { 'roll': true, 'qual': this.quals.qual1 },
				'q2': { 'roll': true, 'qual': this.quals.qual2 },
				'q3': { 'roll': true, 'qual': this.quals.qual3 },
				'vc': this.vc,
				'bonus': this.bonus,
			};
			if (target) {
				messageDict.target = target;
			}
			this.socket.send_json(messageDict);
		},
		send_routine: function () {
			if (this.nr_routine != 0) {
				let messageDict = {
					'type': 'routine',
					'from': this.identity.id,
					'from_name': this.identity.name,
					'nr': this.nr_routine,
				};
				this.socket.send_json(messageDict);
			}
		},
		toogleTalentView: function () {
			this.showTalentSelect = !this.showTalentSelect;
		},
		selectTalent: function (rollOn, vc) {
			let quals = rollOn.toLowerCase().split("/");
			this.vc = vc;
			this.quals.qual1 = this.identity.sheet.qualites[quals[0]];
			this.quals.qual2 = this.identity.sheet.qualites[quals[1]];
			this.quals.qual3 = this.identity.sheet.qualites[quals[2]];
			this.showTalentSelect = false;
			// this.bonus = 0;
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
				<th :data-tooltip="success_proba">Bonus / Malus</th>
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
			<button class="inrc_send hidden_roll" v-on:click="send('self')">Jet caché</button>
			<button class="inrc_send screen_roll" v-on:click="send('game_master')">Jet derrière l'écran</button>
			<button class="inrc_send" v-on:click="send">Effectuer le jet</button>
		</div>

		<template v-if="showTalentSelect">
			<div class="winBack" v-on:click="toogleTalentView"></div>
			<div class="talent_select scrollable">
				<div class="col_talents">
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
				<div class="col_talents">
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
			this.eventFct(this.infos.roll, this.talent.vc);
		},
	},
	template: `
	<div class="inrc_talent" v-on:click="select">
		<span class="inrc_tal_name">{{ infos.name }}</span>
		<span class="inrc_tal_roll">({{ infos.roll }})</span>
		<span class="inrc_tal_val">{{ talent.vc }}</span>
	</div>
	`,
});

Vue.component('reroll-competence', {
	props: ['socket', 'identity', 'reroll_comp'],
	data: function () {
		return {
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
		}
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
				<th>Qualité 1</th>
				<th>Qualité 2</th>
				<th>Qualité 3</th>
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
			<button class="inrc_send" v-on:click="send" v-bind:disabled="!(reroll1 || reroll2 || reroll3)">Relancer les dés</button>
			<button class="inrc_send" v-on:click="close">Annuler</button>
		</div>
	</div>`
});
