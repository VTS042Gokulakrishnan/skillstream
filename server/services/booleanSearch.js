// Recursive descent preserves phrase order and NOT > AND > OR precedence.
// Output is an Atlas Search clause, never executable input or a raw regex.
function booleanSearch(query, path = "skills") {
  if (typeof query !== "string" || query.length > 2000) throw new SyntaxError("Boolean query must be text under 2,000 characters.");
  const tokens = query.match(/"[^"\r\n]*"|\(|\)|\bAND\b|\bOR\b|\bNOT\b|[^()"\s]+/gi) || [];
  if ((query.match(/"/g) || []).length % 2) throw new SyntaxError("Close the quoted phrase.");
  if (!tokens.length) return null;
  let pos = 0;
  let depth = 0;
  const peek = value => tokens[pos]?.toUpperCase() === value;
  const join = (operator, left, right) => ({ compound: operator === "OR" ? { should: [left, right], minimumShouldMatch: 1 } : { must: [left, right] } });
  function atom() {
    if (++depth > 40) throw new SyntaxError("Boolean query is nested too deeply.");
    let node;
    if (peek("NOT")) { pos++; node = { compound: { mustNot: [atom()] } }; }
    else if (peek("(")) { pos++; node = or(); if (!peek(")")) throw new SyntaxError("Close the Boolean group with )."); pos++; }
    else {
      const term = tokens[pos++];
      if (!term || /^(AND|OR|\))$/i.test(term)) throw new SyntaxError("Enter a skill after each operator.");
      if (term.startsWith('"')) {
        if (term.length <= 2) throw new SyntaxError("Quoted phrases cannot be empty.");
        node = { phrase: { path, query: term.slice(1, -1) } };
      } else node = { text: { path, query: term } };
    }
    depth--;
    return node;
  }
  function and() {
    let node = atom();
    while (pos < tokens.length && !peek("OR") && !peek(")")) {
      if (peek("AND")) pos++;
      node = join("AND", node, atom());
    }
    return node;
  }
  function or() { let node = and(); while (peek("OR")) { pos++; node = join("OR", node, and()); } return node; }
  const result = or();
  if (pos !== tokens.length) throw new SyntaxError("Unexpected closing parenthesis.");
  return result;
}
module.exports = { booleanSearch };
