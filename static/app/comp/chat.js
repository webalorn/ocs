Vue.component('chat-compo', {
	props: ['socket', 'identity', 'reroll_comp'],
	data: function () {
		return {
			inputMessage: "",
			history: [],
			historyPos: 0,
			scrollMsg: false,
			messages: [],
			toSend: [],
		}
	},
	mounted: function () {
		this.socket.register((event, data) => {
			if (data.type == 'notification') {
				return;
			}
			let elMsgList = this.$el.querySelector('.chat_message_list');
			if (elMsgList.clientHeight + elMsgList.scrollTop + 20 >= elMsgList.scrollHeight) {
				this.scrollMsg = true;
			}
			this.messages.push(data);
		});
	},
	updated: function () {
		let elMsgList = this.$el.querySelector('.chat_message_list');
		if (this.scrollMsg) {
			elMsgList.scrollTo(0, elMsgList.scrollHeight);
		}
	},
	methods: {
		sendMessage: function () {
			if (this.inputMessage != "") {
				let message = this.inputMessage;
				this.inputMessage = "";
				this.history.push(message);
				this.historyPos = this.history.length;

				// Send message to server
				let messageDict = {
					'type': 'message',
					'message': message,
					'from': this.identity.id,
					'from_name': this.identity.name,
				};
				this.socket.send(JSON.stringify(messageDict));
			}
		},
		getCurHistory: function () {
			return this.historyPos == this.history.length ? "" : this.history[this.historyPos];
		},
		historyPrev: function () {
			if (this.inputMessage == this.getCurHistory() && this.historyPos > 0) {
				this.historyPos--;
				this.inputMessage = this.history[this.historyPos];
			}
		},
		historyNext: function () {
			if (this.inputMessage == this.getCurHistory()) {
				if (this.historyPos < this.history.length) {
					this.historyPos++;
					this.inputMessage = this.getCurHistory();
				}
			}
		},
		historyReset: function () {
			this.historyPos = this.history.length;
		},
		reroll_comp_trigger: function (message) {
			if (message.from == this.identity.id) {
				this.reroll_comp.dice = message;
			}
		}
	},
	template: `
	<div class="chat">
		<div class="chat_message_list">
			<div class="chat_help">
				Envoyez des messages en appuyant sur <code>entrée</code>.<br>
				Vous pouvez envoyer des commandes pour:<br>
				Lancer des dés avec <code>/roll [liste de dés]</code> ou <code>/r</code> (par exemple, <code>/roll d20+3d6  6d3-4</code>).<br>
				Faire un jet de compétence avec <code>/c qual1 qual1 qual3 VC [bonus]</code> (par exemple <code>/c 9 10 15 12</code>, ou <code>/c 9 10 15 12 -1</code>).
			</div>
			<div class="chat_message" v-for='m in messages' v-bind:class="{chat_message_self : m.from == identity.id}">
				<div class="chat_message_name" v-if="m.type != 'error'">
					<span class="chat_message_user">{{ m.from_name }}</span>
				</div>
				<p class="chat_message_text" v-if="m.type == 'message'">{{ m.message }}</p>
				<p class="chat_message_error" v-else-if="m.type == 'error'">{{ m.message }}</p>
				<template v-else-if="m.type == 'roll'">
					<div v-for="roll in m.rolls" class="chat_roll_line">
						<span class="chat_roll_total">{{ roll[0] }}</span>
						<span class="chat_roll_expr"> (={{ roll[2] }})</span>
						<div v-for="d in roll[1]" class="chat_dice" v-bind:class="['dice_' + d[1], 'rolled_' + d[0]]"><span class="chat_dice_p1">{{ d[0] }}</span><span class="chat_dice_p2">/{{ d[1] }}</span></div>
					</div>
				</template>
				<div v-else-if="m.type == 'competence'" class="chat_competence"
					v-bind:class="{comp_reussite : m.nr > 0, comp_echec: m.nr == 0, comp_critique: m.critique, comp_maladresse: m.maladresse}">
					<div class="chat_competence_title">
						<span v-if="m.maladresse">Échec critique</span>
						<span v-else-if="m.critique">Réussite critique</span>
						<span v-else-if="m.nr == 0">Échec</span>
						<span v-else-if="m.nr > 0">Réussite</span>
						<span v-if="m.nr > 0" class="comp_nr"> (PC={{m.pc}}, NR={{m.nr}})</span>
						<span v-if="m.nr <= 0" class="comp_nr"> ({{m.pc}})</span>
					</div>
					<div class="chat_competence_jet">
						<span v-if="m.q1.roll && m.q2.roll && m.q3.roll">Jet sur</span>
						<span v-else>Reroll sur</span>
						 {{m.q1.qual}}/{{m.q2.qual}}/{{m.q3.qual}},
						<span v-if="m.bonus > 0">+{{m.bonus}}</span>
						<span v-if="m.bonus < 0">{{m.bonus}}</span>
						<span v-if="m.bonus == 0">+0</span>
					</div>
					<div>
						<div v-for="q in [m.q1, m.q2, m.q3]" class="comp_qual_dice" v-bind:class="['rolled_' + q.dice, {comp_dice_can_reroll : m.from == identity.id}, {comp_dice_kept : !q.roll}]" v-on:click="reroll_comp_trigger(m)"><span class="chat_dice_p1">{{ q.dice }}</span></div>
					</div>
				</div>
				<p v-else>
				{{ m }}
				</p>
			</div>
		</div>
		<form class='chat_form' v-on:submit.prevent="sendMessage">
			<input type="text" placeholder="Message..." v-model.trim="inputMessage" v-on:keydown.up="historyPrev" v-on:keydown.down="historyNext" v-on:keydown.esc="historyReset" />
		</form>
	</div>`
});

Vue.component('jet-competence', {
	props: ['socket', 'identity'],
	data: function () {
		return {
			qual1: 8,
			qual2: 8,
			qual3: 8,
			vc: 0,
			bonus: 0,
		}
	},
	methods: {
		send: function () {
			let messageDict = {
				'type': 'competence',
				'from': this.identity.id,
				'from_name': this.identity.name,
				'q1': { 'roll': true, 'qual': this.qual1 },
				'q2': { 'roll': true, 'qual': this.qual2 },
				'q3': { 'roll': true, 'qual': this.qual3 },
				'vc': this.vc,
				'bonus': this.bonus,
			};
			this.socket.send(JSON.stringify(messageDict));
		},
	},
	template: `
	<div class="inrc_view">
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
		<div class="inrc_actions">
			<button class="inrc_send" v-on:click="send">Effectuer le jet</button>
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
			};
			this.socket.send(JSON.stringify(messageDict));
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
