from api.util import *
import re, random


class MessageError(Exception):
    def __init__(self, text):
        self.text = text
        super().__init__(text)


class RollError(Exception):
    pass


SIMPLE_MESSAGES = ['message', 'routine', 'join', 'quit']
ROLL_D20 = ['attack', 'parade', 'esquive']
ROLL_STR = ['initiative', 'damages']


def process_message(message_obj):
    if message_obj['type'] == 'competence':
        return jet_competence(message_obj['q1'], message_obj['q2'],
                              message_obj['q3'], message_obj['vc'],
                              message_obj['bonus'], message_obj['on'])
    if message_obj['type'] in ROLL_D20:
        return jet_d20(message_obj['roll'], message_obj['type'])
    if message_obj['type'] in ROLL_STR:
        return jet_simple(message_obj['roll'], message_obj['type'])

    if message_obj['type'] not in SIMPLE_MESSAGES:
        raise MessageError("Pas de message ?")
    if message_obj['type'] != 'message':
        return message_obj

    message = message_obj['message'].strip()
    if not message.startswith('/'):
        message_obj['display'] = 'text'
        return message_obj

    parts = message.split()
    cmd = parts[0][1:]
    args = parts[1:]
    if cmd in all_commands:
        return all_commands[cmd](message_obj, args)
    elif cmd[:-1] in all_commands:
        if cmd[-1] == 'h':
            r = all_commands[cmd[:-1]](message_obj, args)
            r['target'] = 'self'
            return r
        if cmd[-1] == 'j':
            r = all_commands[cmd[:-1]](message_obj, args)
            r['target'] = 'game_master'
            return r
    raise MessageError(f"La commande {cmd} n'existe pas")


def cmd_roll(message_obj, args):
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


def cmd_ini(message_obj, args):
    if len(args) == 0:
        raise MessageError(f"Pas de valeur d'initiative !")
    ini = args[0]
    dice = 'd6'
    if len(args) >= 2:
        dice = args[1]
    expr = ini + '+' + dice
    return jet_simple(expr, 'initiative')
    # return {
    #     'type': 'roll',
    #     'rolls': [roll_dice(expr) + (expr, )],
    #     'roll_type': 'ini',
    # }


def cmd_competence(message_obj, args):
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
    }, vc, bonus, '-')


def cmd_d20(message_obj, args):
    if len(args) == 0 or not is_int(args[0]):
        raise MessageError(f"Pas de valeur pour le dé !")
    n = int(args[0])
    text = 'Jet simple'
    if len(args) >= 2:
        text = ' '.join(args[1:])
    return jet_d20(n, text)


def cmd_image(message_obj, args):
    if len(args) == 0:
        raise MessageError(f"Pas d'url donnée pour l'image")
    message_obj['display'] = 'image'
    message_obj['message'] = args[0]
    return message_obj


all_commands = {
    'r': cmd_roll,
    'roll': cmd_roll,
    'ini': cmd_ini,
    'c': cmd_competence,
    'competence': cmd_competence,
    'd20': cmd_d20,
    'image': cmd_image,
    'img': cmd_image,
}


# Special actions, parsing, etc...
def roll_dice(expr):
    expr = expr.lower()
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


def jet_competence(rq1, rq2, rq3, vc, bonus, on):
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
        'on': on,
        'nr': 0 if pc < 0 else min(6, max(1, 1 + (pc - 1) // 3)),
        'critique': bool(len([r for r in jets if r == 1]) >= 2),
        'maladresse': bool(len([r for r in jets if r == 20]) >= 2),
    }


def jet_d20(difficulty, type):
    dice = random.randint(1, 20)
    dice_conf = random.randint(1, 20)
    results = {
        'type': 'd20',
        'roll_type': type,
        'dice': dice,
        'success': bool(dice <= difficulty and dice != 20),
        'critique': bool(dice == 1 and difficulty > 0),
        'maladresse': bool(dice == 20),
        'difficulty': difficulty,
        'confirmation': False,
        'dice_conf': dice_conf,
    }
    if results['critique'] and dice_conf <= difficulty:
        results['confirmation'] = True
    if results['maladresse'] and (dice_conf > difficulty or dice_conf == 20):
        results['confirmation'] = True
    return results


def jet_simple(roll, type):
    dice_total, _ = roll_dice(roll)
    results = {
        'type': 'simple_roll',
        'roll_type': type,
        'dice': dice_total,
        'expr': roll,
    }
    return results
