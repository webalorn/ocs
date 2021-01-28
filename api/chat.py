from api.util import *
import re, random


class MessageError(Exception):
    def __init__(self, text):
        self.text = text
        super().__init__(text)


class RollError(Exception):
    pass


SIMPLE_MESSAGES = ['message', 'routine']


def process_message(message_obj):
    if message_obj['type'] == 'competence':
        return jet_competence(message_obj['q1'], message_obj['q2'],
                              message_obj['q3'], message_obj['vc'],
                              message_obj['bonus'])
    if message_obj['type'] not in SIMPLE_MESSAGES:
        raise MessageError("Pas de message ?")
    if message_obj['type'] != 'message':
        return message_obj

    message = message_obj['message'].strip()
    if not message.startswith('/'):
        return message_obj

    parts = message.split()
    cmd = parts[0][1:]
    args = parts[1:]
    if cmd in all_commands:
        return all_commands[cmd](args)
    elif cmd[:-1] in all_commands:
        if cmd[-1] == 'h':
            r = all_commands[cmd[:-1]](args)
            r['target'] = 'self'
            return r
        if cmd[-1] == 'j':
            r = all_commands[cmd[:-1]](args)
            r['target'] = 'game_master'
            return r
    raise MessageError(f"La commande {cmd} n'existe pas")


def cmd_roll(args):
    rolls = []
    for expr in args:
        try:
            rolls.append(roll_dice(expr) + (expr, ))
        except RollError:
            raise MessageError(
                f"L'expression {expr} n'est pas un lancer de dés valide")
    return {
        'type': 'roll',
        'rolls': rolls,
        'roll_type': 'simple',
    }


def cmd_ini(args):
    if len(args) == 0:
        raise MessageError(f"Pas de valeur d'initiative !")
    ini = args[0]
    dice = 'd6'
    if len(args) >= 2:
        dice = args[1]
    expr = ini + '+' + dice
    return {
        'type': 'roll',
        'rolls': [roll_dice(expr) + (expr, )],
        'roll_type': 'ini',
    }


def cmd_competence(args):
    for i, a in enumerate(args):
        if not is_int(a):
            raise MessageError(f"{a} n'est pas un entier")
        args[i] = int(a)

    if len(args) == 4:
        q1, q2, q3, vc = args
        bonus = 0
    elif len(args) == 5:
        q1, q2, q3, vc, bonus = args
    else:
        raise MessageError("Cette commande prends 4 ou 5 arguments")
    return jet_competence({
        'roll': True,
        'qual': q1
    }, {
        'roll': True,
        'qual': q2
    }, {
        'roll': True,
        'qual': q3
    }, vc, bonus)


all_commands = {
    'r': cmd_roll,
    'roll': cmd_roll,
    'ini': cmd_ini,
    'c': cmd_competence,
    'competence': cmd_competence,
}


# Special actions, parsing, etc...
def roll_dice(expr):
    if '+' in expr:
        s, dices = 0, []
        for e in expr.split('+'):
            sum2, dices2 = roll_dice(e)
            s += sum2
            dices.extend(dices2)
        return s, dices
    if '-' in expr:
        s, dices = 0, []
        for i, e in enumerate(expr.split('-')):
            sum2, dices2 = roll_dice(e)
            if i:
                s -= sum2
            else:
                s += sum2
            dices.extend(dices2)
        return s, dices
    if expr == '':
        return 0, []
    if is_int(expr):
        return int(expr), []
    m = re.match('(\d*)d(\d+)$', expr)
    if not m:
        raise RollError()
    n = int(m.group(1)) if m.group(1) else 1
    d = int(m.group(2))
    if d < 1:
        raise RollError()
    rolls = [(random.randint(1, d), d) for _ in range(n)]
    return sum([r[0] for r in rolls]), rolls


def jet_competence(rq1, rq2, rq3, vc, bonus):
    if rq1['roll']: rq1['dice'] = random.randint(1, 20)
    if rq2['roll']: rq2['dice'] = random.randint(1, 20)
    if rq3['roll']: rq3['dice'] = random.randint(1, 20)
    jets = [rq1['dice'], rq2['dice'], rq3['dice']]
    pc = (vc - max(rq1['dice'] - rq1['qual'] - bonus, 0) -
          max(rq2['dice'] - rq2['qual'] - bonus, 0) -
          max(rq3['dice'] - rq3['qual'] - bonus, 0))

    rolls = [rq1['dice'], rq2['dice'], rq3['dice']]
    if rolls.count(20) >= 2:
        pc = -1
    elif rolls.count(1) >= 2:
        pc = vc
    return {
        'type': 'competence',
        'q1': rq1,
        'q2': rq2,
        'q3': rq3,
        'vc': vc,
        'bonus': bonus,
        'pc': pc,
        'nr': 0 if pc < 0 else min(6, max(1, 1 + (pc - 1) // 3)),
        'critique': bool(len([r for r in jets if r == 1]) >= 2),
        'maladresse': bool(len([r for r in jets if r == 20]) >= 2),
    }
