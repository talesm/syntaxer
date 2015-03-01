define(['SyntaxParser', 'DomParser', 'TextGenerator', 'TemplGenerator', 'JsonGenerator', 'text!syntax.html', 'text!edit.html', 'text!model.syntax', 'domReady!'], 
function(syntaxParser,   domParser,   TextGenerator,   TemplGenerator,   JsonGenerator ,  templOutput,        templEdit,        modelSyntax,         doc) {
	'use strict'
    $.Mustache.add('templ-output', templOutput);
    $.Mustache.add('templ-edit', templEdit);
    var foundTokens = {};
    var templGenerator = new TemplGenerator(foundTokens);
    var textGenerator = new TextGenerator(foundTokens);
    
    /**
     * Refresh extra tokens on GUI
     * @return {[type]}
     */
    function refreshExtraTokens(){
        var $extraTokens = $('.extra-tokens').empty();
        for(var token in foundTokens){
            if(document.getElementById('rule-'+token) || foundTokens[token] <= 0){
                continue;
            }
            $extraTokens.append('<span id="rule-'+token+'">'+token+'</span>');
        }
    }

    /**
     * Return the rule's class name.
     * @param  {jQuery}
     * @return {String} The class name.
     */
    function getRuleClass($button){
        return '.' + $button.closest('.rule').attr('id');
    }

    /**
     * Resize the text area to aways fit the content.  
     * @param  {jQuery}
     * @return {undefined}
     */
    function resizeTextArea($textarea){
        var lines = $textarea.val().split('\n');
        var nrows = lines.length;
        var ncols = lines.reduce(function(prev, curr){
            return Math.max(prev, curr.length);
        }, 0);
        $textarea.attr('rows', Math.max(1, nrows-1));
        $textarea.attr('cols', Math.max(ncols, 40));
    }

    $('.jAdd').click(function(){
        var even = true;
        var bruteText = $('#input').val().trim();
        if(!bruteText)
            return;
        var rules = syntaxParser.parse(bruteText, templGenerator);
        $('.buttons').show();
        $('#output').mustache('templ-output', {rules:rules});
        resizeTextArea($('#input').val(''));
        refreshExtraTokens();
    });
    $('.jEditAll').click(function(){
        var spaces = 0;
        $('#output .rule .name').each(function(){
            var length =$(this).text().trim().length;
            if(length >= spaces){
                spaces = length + 1;
            }
        });

        textGenerator.spaces(spaces);
        var input = domParser.parse($('#output'), textGenerator);
        $('.buttons').hide();
        $('#input').val(input);
        $('#output').empty();
        resizeTextArea($('#input'));
    });
    $('.jToogle').click(function(){
        $('.semantic').toggle();
    });
    $('#output').on('click', '.jUp', function(){
        var $currentHead = $(this).closest('.rule');
        var $current = $(getRuleClass($currentHead));
        var $prevHead = $currentHead.prevAll('.head').first();
        var $prev = $(getRuleClass($prevHead));
        $prev.toggleClass('even');
        $current.toggleClass('even');
        $current.each(function(){
            $prevHead.before($(this));
        });
    });

    $('#output').on('click', '.jDown', function(){
        var $currentHead = $(this).closest('.rule');
        var $current = $(getRuleClass($currentHead));
        var $nextHead = $currentHead.nextAll('.head').first();
        var $next = $(getRuleClass($nextHead));
        $next.toggleClass('even');
        $current.toggleClass('even');
        $next.each(function(){
            $currentHead.before($(this));
        });
    });

    $('#output').on('click', '.jEdit', function(){
        var className = getRuleClass($(this));
        var $current = $(className);
        var newVal;

        var isProduction = $current.is('.production');
        if(isProduction){
            var arrayVals = [];
            $current.each(function(){
                arrayVals.push(domParser.parseDefinition($(this), textGenerator));
            });
            newVal = arrayVals.join('\n');
        } else {
            console.log($current)
            console.log($current.closest('.rule'));
            console.log($current.closest('.rule').find('.regex'));
            newVal = domParser.parseToken($current.closest('.rule').find('.regex'), textGenerator);
        }
        
        var $currentHead = $current.first();
        $currentHead.children(':not(.name)').remove();
        $currentHead.mustache('templ-edit', {
            production:isProduction,
            value:newVal
        });
        $currentHead.data('even', $current.hasClass('even'))
                    .data('production', isProduction);
        $current.not($currentHead).remove();

        resizeTextArea($currentHead.find('textarea'));
    });
    $('#output').on('click', '.jDelete', function(){
        var $this = $(getRuleClass($(this)));
        $this.find('.def-item').each(function () {
            domParser.parseToken($(this), textGenerator);
        })
        $this.nextAll().toggleClass('even');
        $this.remove();
        refreshExtraTokens();
    });

    $('#output').on('click', '.jResetEdit', function(){
        var $value = $(this).closest('.rule').find('.value');
        $value.val($value.text());
    });
    $('#output').on('click', '.jOkEdit', function(){
        var $editRule = $(this).closest('.rule');
        var $value = $editRule.find('.value');
        var newVal = $value.val().trim();
        var name = $editRule.find('.name').text().trim();
        var rules;
        if($editRule.data('production')){
            rules = newVal.split('\n').map(function(v){
                return v.trim();
            }).filter(function(cline){
                if(!cline.trim() || cline[0]==='#'){
                    return false;
                }
                return true;
            }).map(function(ruleDef, i){
                return {
                    ruleName: name,
                    ruleId: name,
                    even: $editRule.data('even'),
                    newRule: i==0,
                    ruleDef: syntaxParser.parseDefinition(ruleDef, templGenerator),
                    classes: 'production'
                };
            });
        } else {

            rules = [{
                ruleName: name,
                ruleId: name,
                even: $editRule.data('even'),
                newRule: true,
                ruleDef: [syntaxParser.parseToken(newVal, templGenerator)],
                classes: 'terminal'
            }];
        }
        
        if(rules.length){
            $editRule.before($.Mustache.render('templ-output', {
                rules: rules
            }));
        } else {
            $editRule.nextAll().toggleClass('even');
        }
        $editRule.remove();
        refreshExtraTokens();
    });
    $('body').on('input', 'textarea', function(){
        var $this = $(this);
        resizeTextArea($this);
    });

    $('.export-json').click(function(event) {
        'use strict'
        //event.preventDefault();
        /* Act on the event */
        var result = domParser.parse($(output), new JsonGenerator());
        this.href = 'data:,'+JSON.stringify(result);
        //return false;
    });

    //Dirt trick
    $('#input').val($('#input').val()||modelSyntax);
    $('.jAdd').click();
})