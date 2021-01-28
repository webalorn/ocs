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
			rollDetails: { shown: false },
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
			data.target_ok = true;
			if (data.target == 'game_master' && !this.identity.gm) {
				data.target_ok = false;
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
				this.socket.send_json(messageDict);
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
		},
		roll_details_with_bonus(m, bonus) {
			let pc = m.vc - Math.max(m.q1.dice - m.q1.qual - bonus, 0)
				- Math.max(m.q2.dice - m.q2.qual - bonus, 0)
				- Math.max(m.q3.dice - m.q3.qual - bonus, 0);
			let nr = Math.min(6, Math.max(1, 1 + Math.floor((pc - 1) / 3)));
			if (pc < 0) {
				nr = 0;
			}
			return { bonus: bonus, pc: pc, nr: nr };
		},
		roll_details: function (m) {
			if (!this.identity.gm) {
				return;
			}
			let withBonus = [], withMalus = [];
			let withZero = this.roll_details_with_bonus(m, 0);
			for (let i = 1; i <= 20; i++) {
				withBonus.push(this.roll_details_with_bonus(m, i));
				withMalus.push(this.roll_details_with_bonus(m, -i));
			}
			this.rollDetails = {
				m: m,
				withBonus: withBonus,
				withMalus: withMalus,
				withZero: withZero,
				shown: true,
			};
		},
		toggleDetails: function (m) {
			this.rollDetails = !this.rollDetails;
		},
	},
	template: `
	<div class="chat">
		<div class="chat_message_list">
			<div class="chat_help">
				Envoyez des messages en appuyant sur <code>entrée</code>.<br>
				Vous pouvez envoyer des commandes pour:<br>
				Lancer des dés avec <code>/r [liste de dés]</code> ou <code>/r</code> (par exemple, <code>/roll d20+3d6  6d3-4</code>).<br>
				Faire un jet de compétence avec <code>/c qual1 qual2 qual3 VC [bonus]</code> (par exemple <code>/c 9 10 15 12</code>, ou <code>/c 9 10 15 12 -1</code>).<br>
				Lancer l'initiative avec <code>/ini 12</code> par exemple si la valeur de base d'initiative est 12.<br>
				Vous pouvez utiliser le modificateur <code>h</code> pour cacher un jet (<code>/rh d20</code>), le modificateur <code>j</code> pour envoyer uniquement au MJ (<code>/rj d20</code>).
			</div>
			<div class="chat_message" v-for='m in messages' v-bind:class="{chat_message_self : m.from == identity.id}">
				<div class="chat_message_name" v-if="m.type != 'error'">
					<span class="chat_message_user">{{ m.from_name }}</span>
					<span v-if="m.target=='game_master'" class="msg_only_gm">(Jet derrière l'écran)</span>
					<span v-if="m.target=='self'" class="msg_only_self">(Jet secret)</span>
				</div>
				<template v-if="m.target_ok">
					<p class="chat_message_text" v-if="m.type == 'message'">{{ m.message }}</p>
					<p class="chat_message_error" v-else-if="m.type == 'error'">{{ m.message }}</p>
					<template v-else-if="m.type == 'roll'">
						<div v-for="roll in m.rolls" class="chat_roll_line">
							<span v-if="m.roll_type == 'ini'" class="chat_roll_ini">Initiative :</span>
							<span class="chat_roll_total">{{ roll[0] }}</span>
							<span class="chat_roll_expr"> (={{ roll[2] }})</span>
							<div v-for="d in roll[1]" class="chat_dice" v-bind:class="['dice_' + d[1], 'rolled_' + d[0]]"><span class="chat_dice_p1">{{ d[0] }}</span><span class="chat_dice_p2">/{{ d[1] }}</span></div>
						</div>
					</template>
					<div v-else-if="m.type == 'competence'" class="chat_competence"
						v-bind:class="{comp_reussite : m.nr > 0, comp_echec: m.nr == 0, comp_critique: m.critique, comp_maladresse: m.maladresse, competence_as_gm : identity.gm}">
						<div class="chat_competence_title" v-on:click="roll_details(m)">
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
					<div v-else-if="m.type == 'routine'" class="chat_routine">
						Épreuve de routine : NR = {{m.nr}}
					</div>
					<p v-else>
					{{ m }}
					</p>
				</template>
			</div>
		</div>
		<form class='chat_form' v-on:submit.prevent="sendMessage">
			<input type="text" placeholder="Message..." v-model.trim="inputMessage" v-on:keydown.up="historyPrev" v-on:keydown.down="historyNext" v-on:keydown.esc="historyReset" />
		</form>

		<template v-if="rollDetails.shown">
			<div class="winBack" v-on:click="toggleDetails"></div>
			<roll-details v-bind:roll="rollDetails"></roll-details>
		</template>
	</div>`
});

Vue.component('roll-details', {
	props: ['roll'],
	methods: {
		signed: n => n < 0 ? '' + n : '+' + n,
	},
	template: `
	<div class="rollDetails">
		<h3>Avec modificateurs :</h3>
		<div class="modifs-zero">
			<roll-detail-dice v-bind:result="roll.withZero"></roll-detail-dice>
		</div>
		<div class="modifs-list">
			<div class="modif-col">
				<roll-detail-dice v-for="r in roll.withMalus" v-bind:result="r" v-bind:key="r.bonus + '_malus'"></roll-detail-dice>
			</div>
			<div class="modif-col">
				<roll-detail-dice v-for="r in roll.withBonus" v-bind:result="r" v-bind:key="r.bonus + '_bonus'"></roll-detail-dice>
			</div>
		</div>
		<div style="text-align:center;">
			<em>Lancé avec un modificateur de : {{ signed(roll.m.bonus) }}</em>
		</div>
	</div>
	`,
});

Vue.component('roll-detail-dice', {
	props: ['result'],
	template: `
	<div class='rollDetailDice' v-bind:class="{diceOk : result.nr > 0, diceFail : result.nr == 0}">
		<template v-if="result.bonus >= 0">+</template>{{ result.bonus }} :
		<template v-if="result.nr > 0">Succès</template>
		<template v-if="result.nr == 0">Échec</template>
		(PC={{result.pc}}, NR={{result.nr}})
	</div>
	`,
})
