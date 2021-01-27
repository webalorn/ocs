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
	<th class="inrc_view_qual_th" v-on:mouseleave="mouseLeave" v-on:click="toogle">
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
		}
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
	},
	template: `
	<div class="inrc_view">
		<table>
			<tr>
				<qual-selector v-bind:quals="quals" v-bind:num="1" v-bind:qualities="identity.sheet.qualites"></qual-selector>
				<qual-selector v-bind:quals="quals" v-bind:num="2" v-bind:qualities="identity.sheet.qualites"></qual-selector>
				<qual-selector v-bind:quals="quals" v-bind:num="3" v-bind:qualities="identity.sheet.qualites"></qual-selector>
				<th>VC</th>
				<th>Bonus / Malus</th>
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
		<div class="inrc_actions">
			<button class="inrc_send" v-on:click="send">Effectuer le jet</button>
		</div>
		<div class="inrc_actions inrc_actions_2">
			<button class="inrc_send hidden_roll" v-on:click="send('self')">Jet caché</button>
			<button class="inrc_send screen_roll" v-on:click="send('game_master')">Jet derrière l'écran</button>
		</div>
	</div>`
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
