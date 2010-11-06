$(document).ready(function() {

  // getSelection by Alex Brem (http://github.com/localhost/jquery-fieldselection)
  $.fn.getSelection = function() {
    var e = (this.jquery) ? this[0] : this;
    return (
      /* mozilla / dom 3.0 */
      ('selectionStart' in e && function() {
        var l = e.selectionEnd - e.selectionStart;
        return { start: e.selectionStart, end: e.selectionEnd, length: l, text: e.value.substr(e.selectionStart, l) };
      }) ||

      /* ie */
      (document.selection && function() {
        e.focus();

        var r = document.selection.createRange();
        if (r === null) {
          return { start: 0, end: e.value.length, length: 0 }
        }

        var re = e.createTextRange();
        var rc = re.duplicate();
        re.moveToBookmark(r.getBookmark());
        rc.setEndPoint('EndToStart', re);

        return { start: rc.text.length, end: rc.text.length + r.text.length, length: r.text.length, text: r.text };
      }) ||

      /* browser not supported */
      function() { return null; }
    )();
  }

  // replaceSelection by Alex Brem (http://github.com/localhost/jquery-fieldselection)
  $.fn.replaceSelection = function() {
    var e = (this.jquery) ? this[0] : this;
    var text = arguments[0] || '';
    return (
      /* mozilla / dom 3.0 */
      ('selectionStart' in e && function() {
        var selectionStart = e.selectionStart;
        var selectionEnd = e.selectionEnd;
        e.value = e.value.substr(0, e.selectionStart) + text + e.value.substr(e.selectionEnd, e.value.length);
        e.selectionStart = selectionStart;
        e.selectionEnd = selectionStart + text.length;
        e.focus()
        return this;
      }) ||

      /* ie */
      (document.selection && function() {
        e.focus();
        document.selection.createRange().text = text;
        return this;
      }) ||

      /* browser not supported */
      function() {
        e.value += text;
        return jQuery(e);
      }
    )();
  }

  $.fn.textileEditorApplyStyle = function(style) {
    var textarea = $(this)
    var text = textarea.getSelection().text // selection text
    var prefix = ''
    var suffix = ''

    // omit leading space
    if (text[0] == ' ') {
      prefix = ' '
      text = text.substr(1, text.length - 1)
    }

    // omit trailing space
    if (text[text.length - 1] == ' ') {
      suffix = ' '
      text = text.substr(0, text.length - 1)
    }

    // stylings which require text to be selected
    if (text.length > 0) {
      switch(style) {
        case 'bold':
          textarea.replaceSelection(prefix + '*' + text + '*' + suffix)
          break
        case 'italic':
          textarea.replaceSelection(prefix + '_' + text + '_' + suffix)
          break
        case 'del':
          textarea.replaceSelection(prefix + '-' + text + '-' + suffix)
          break
        case 'ins':
          textarea.replaceSelection(prefix + '+' + text + '+' + suffix)
          break
      }
    }

    // stylings which do not require text to be selected
    switch(style) {
      case 'link':
        if (link = prompt("Adres docelowy")) {
          if (text.length > 0) {
            textarea.replaceSelection(prefix + '"' + text + '":' + link + suffix)
          } else {
            textarea.textileEditorInsertContent('"link":' + link)
          }
        }
        break
      case 'h1.':
      case 'h2.':
      case 'h3.':
      case 'bq.':
      case '*':
      case '#':
        if (text.length > 0) {
          textarea.replaceSelection(style + " " + text + "\n\n")
        } else {
          textarea.textileEditorInsertContent(style + " text\n\n")
        }
        break
    }
  }

  $.fn.textileEditorInsertContent = function(content) {
    var textarea = $(this)
    textarea.replaceSelection(content)
  }

  $.fn.textileEditorEnable = function() {

    $(this).each(function() {
      // we'll be working exclusively with textareas
      if ($(this)[0].type == 'textarea') {

        var textarea = $(this)

        // add styling buttons
        var span = $('<span class="textile_editor_buttons"></span>')

        var bold = $('<input type="button" value="b" />')
        bold.addClass('bold')
        bold.click(function() { textarea.textileEditorApplyStyle('bold') })

        var italic = $('<input type="button" value="i" />')
        italic.addClass('italic')
        italic.click(function() { textarea.textileEditorApplyStyle('italic') })

        var link = $('<input type="button" value="link" />')
        link.addClass('link')
        link.click(function() { textarea.textileEditorApplyStyle('link') })

        var h1 = $('<input type="button" value="h1" />')
        h1.addClass('header')
        h1.click(function() { textarea.textileEditorApplyStyle('h1.') })

        var h2 = $('<input type="button" value="h2" />')
        h2.addClass('header')
        h2.click(function() { textarea.textileEditorApplyStyle('h2.') })

        var h3 = $('<input type="button" value="h3" />')
        h3.addClass('header')
        h3.click(function() { textarea.textileEditorApplyStyle('h3.') })

        var bq = $('<input type="button" value="”" />')
        bq.addClass('bq')
        bq.click(function() { textarea.textileEditorApplyStyle('bq.') })

        var del = $('<input type="button" value="del" />')
        del.addClass('del')
        del.click(function() { textarea.textileEditorApplyStyle('del') })

        var ins = $('<input type="button" value="ins" />')
        ins.addClass('ins')
        ins.click(function() { textarea.textileEditorApplyStyle('ins') })

        var ul = $('<input type="button" value="ul" />')
        ul.addClass('ul')
        ul.click(function() { textarea.textileEditorApplyStyle('*') })

        var ol = $('<input type="button" value="ol" />')
        ol.addClass('ol')
        ol.click(function() { textarea.textileEditorApplyStyle('#') })

        span.append(bold, italic, link, h1, h2, h3, bq, del, ins, ul, ol)

        // will insert a <span> with all of the editor's buttons just above the textarea
        textarea.before(span)

        // add keyboard mappings
        textarea.keydown(function(e) {
          if (e.ctrlKey && !e.altKey) {
            switch(e.which) {
              case 66: textarea.textileEditorApplyStyle('bold') // CTRL + B
                       e.preventDefault()
                       break
              case 73: textarea.textileEditorApplyStyle('italic') // CTRL + I
                       e.preventDefault()
                       break
              case 68: textarea.textileEditorApplyStyle('del') // CTRL + D
                       e.preventDefault()
                       break
              case 85: textarea.textileEditorApplyStyle('ins') // CTRL + U
                       e.preventDefault()
                       break
              case 76: textarea.textileEditorApplyStyle('link') // CTRL + L
                       e.preventDefault()
                       break
            }
          }
        })
       }
    })
  }

  // Enable the textile editor
  $('.textile_editor').textileEditorEnable()

})
