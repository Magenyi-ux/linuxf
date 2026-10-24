export function evaluateMath(source: string): { result: string; steps: string[] } | null {
  const input = source.trim().replace(/×/g, '*').replace(/÷/g, '/').replace(/π/g, 'pi').replace(/−/g, '-');
  if (!input || input.length > 180 || !/^[0-9a-zA-Z_+\-*/^().,=%\s]+$/.test(input)) return null;
  const tokens = input.match(/\d*\.?\d+(?:e[+-]?\d+)?|[a-zA-Z_]+|[=()+\-*/^%,]/gi);
  if (!tokens || tokens.join('').replace(/\s/g, '') !== input.replace(/\s/g, '')) return null;
  let pos = 0;
  const calculationSteps: string[] = [];
  const peek = () => tokens[pos];
  const take = () => tokens[pos++];
  const parsePrimary = (): number => {
    const token = take();
    if (token === undefined) throw new Error('Incomplete expression');
    if (token === '+') return parsePrimary();
    if (token === '-') return -parsePrimary();
    if (token === '(') {
      const value = parseAdd();
      if (take() !== ')') throw new Error('Missing closing bracket');
      return value;
    }
    if (/^\d/.test(token)) return Number(token);
    const name = token.toLowerCase();
    if (name === 'pi') return Math.PI;
    if (name === 'e') return Math.E;
    if (['sqrt', 'sin', 'cos', 'tan', 'log', 'ln', 'abs'].includes(name)) {
      if (peek() === '(') take();
      const arg = parseAdd();
      if (peek() === ')') take();
      let value: number;
      if (name === 'sqrt') value = Math.sqrt(arg);
      else if (name === 'abs') value = Math.abs(arg);
      else if (name === 'log') value = Math.log10(arg);
      else if (name === 'ln') value = Math.log(arg);
      else {
        const radians = arg * Math.PI / 180;
        value = name === 'sin' ? Math.sin(radians) : name === 'cos' ? Math.cos(radians) : Math.tan(radians);
      }
      calculationSteps.push(name + '(' + arg + ') = ' + Number(value.toPrecision(10)));
      return value;
    }
    throw new Error('Unknown symbol');
  };
  const parsePower = (): number => {
    let value = parsePrimary();
    if (peek() === '^') {
      take(); const base = value; const exponent = parsePower(); value = Math.pow(base, exponent);
      calculationSteps.push(base + '^' + exponent + ' = ' + Number(value.toPrecision(10)));
    }
    return value;
  };
  const parseMul = (): number => {
    let value = parsePower();
    while (['*', '/', '%'].includes(peek())) {
      const op = take(); const right = parsePower(); const left = value;
      if ((op === '/' || op === '%') && right === 0) throw new Error('Division by zero');
      value = op === '*' ? value * right : op === '/' ? value / right : value % right;
      calculationSteps.push(left + ' ' + (op === '*' ? '×' : op === '/' ? '÷' : 'mod') + ' ' + right + ' = ' + Number(value.toPrecision(10)));
    }
    return value;
  };
  const parseAdd = (): number => {
    let value = parseMul();
    while (peek() === '+' || peek() === '-') {
      const op = take(); const right = parseMul(); const left = value;
      value = op === '+' ? value + right : value - right;
      calculationSteps.push(left + ' ' + op + ' ' + right + ' = ' + Number(value.toPrecision(10)));
    }
    return value;
  };
  try {
    if (input.includes('=')) {
      const sides = input.split('=');
      if (sides.length !== 2 || !sides.every(Boolean)) return null;
      if (!sides.join('').toLowerCase().includes('x')) {
        const left = evaluateMath(sides[0]); const right = evaluateMath(sides[1]);
        if (!left || !right) return null;
        const equal = Number(left.result) === Number(right.result);
        return { result: equal ? 'True — both sides equal ' + left.result : 'False — the sides are ' + left.result + ' and ' + right.result, steps: ['Evaluate the left side: ' + left.result, 'Evaluate the right side: ' + right.result, equal ? 'Both sides are equal.' : 'The two sides are not equal.'] };
      }
      const affine = (expr: string): [number, number] => {
        const parts = expr.match(/[+-]?[^+-]+/g);
        if (!parts) throw new Error('Unsupported equation');
        let a = 0, b = 0;
        for (const raw of parts) {
          const term = raw.trim();
          const sign = term.startsWith('-') ? -1 : 1;
          const body = term.replace(/^[+-]/, '').trim();
          if (body.includes('x')) {
            const coefficient = body.replace(/x/gi, '') || '1';
            const c = coefficient.endsWith('*') ? coefficient.slice(0, -1) : coefficient;
            if (/[*/^()]/.test(c)) throw new Error('Use simple linear equations such as 2x + 5 = 13');
            a += sign * (c ? Number(c) : 1);
          } else {
            const n = Number(body);
            if (!Number.isFinite(n)) throw new Error('Unsupported equation');
            b += sign * n;
          }
        }
        return [a, b];
      };
      const [la, lb] = affine(sides[0]); const [ra, rb] = affine(sides[1]);
      const coefficient = la - ra; const constant = rb - lb;
      if (coefficient === 0) return { result: constant === 0 ? 'Every value of x satisfies this equation.' : 'No solution', steps: ['Collect x terms on one side.', 'Collect constants on the other side.'] };
      const x = constant / coefficient;
      return { result: 'x = ' + Number(x.toPrecision(10)), steps: ['Start with ' + input, 'Collect x terms: ' + coefficient + 'x = ' + constant, 'Divide both sides by ' + coefficient + '.', 'Therefore, x = ' + Number(x.toPrecision(10)) + '.'] };
    }
    const result = parseAdd();
    if (pos !== tokens.length || !Number.isFinite(result)) return null;
    const rounded = Number(result.toPrecision(12));
    return { result: String(rounded), steps: ['Expression: ' + input, ...calculationSteps, 'Result: ' + rounded] };
  } catch { return null; }
}
