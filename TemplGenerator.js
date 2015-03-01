define(function function_name () {
    'use strict';
	function TemplGenerator (foundTokens) {
        this.foundTokens = function () {
            return foundTokens;
        }
        //token
        this.productionToken = function (token) {
            return {
                link: '#rule-'+token,
                classes: 'production',
                item: token,
            };
        };
        this.semanticToken = function (token) {
            return {
                link: '#func-'+token,
                classes: 'semantic',
                item: token,
            };
        };
        this.regexToken = function(token) {
            return {
                classes: 'regex',
                item: token,
            };
        };
        this.terminalToken = function(token) {
            foundTokens[token] = (foundTokens[token]||0)+1;
            return {
                link: '#rule-'+token,
                classes: 'terminal',
                item: token.toUpperCase(),
            };
        };

        //definition
        this.startDefinition = function() {
            return [];
        };
        this.addToken = function (tokens, token) {
            tokens.push(token);
            return tokens;
        };
        this.generateDefinition = function (tokens) {
            return tokens;
        };

        var even = true;
        var ruleName;
        this.startProduction = function(name) {
            ruleName = name;
            return [];
        };
        this.addDefinition = function(definitions, definition) {
            definitions.push({
                ruleName:ruleName,
                even: even,
                newRule: !definitions.length?ruleName:false,
                ruleDef: definition,
                classes: 'production',
            });
            return definitions;
        };
        this.generateProduction = function(definitions) {
            return definitions;
        }

        //Syntax
        this.start = function() {
            return [];
        };
        this.addProduction = function (rules, production) {
            even = !even;
            return rules.concat(production);
        }
        this.addTerminal = function(rules, terminalName, terminalRegex) {
            rules.push({
                ruleName: terminalName.toUpperCase(),
                even: even,
                newRule: terminalName,
                ruleDef: [terminalRegex],
                classes: 'terminal',
            });
            even = !even;
            return rules;
        };
        this.generate = function(rules) {
            return rules;
        }
    };
    return TemplGenerator;
});