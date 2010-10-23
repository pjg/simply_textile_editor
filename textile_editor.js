/*
   textile_editor expects the following markup:

     <p>
       <label>Description:</label>
     </p>

     <p>
       <textarea class="textile_editor"></textarea>
     </p>

   (basically just a textarea tag inside a p tag)

   The textile_editor will insert the UI buttons in a separate paragraph just above the textarea's paragraph.
*/

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
        case 'deleted':
          textarea.replaceSelection(prefix + '-' + text + '-' + suffix)
          break
        case 'italic':
          textarea.replaceSelection(prefix + '_' + text + '_' + suffix)
          break
        case 'underline':
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
      case 'h1':
      case 'h2':
      case 'h3':
        if (text.length > 0) {
          textarea.replaceSelection(style + ". " + text + "\n\n")
        } else {
          textarea.textileEditorInsertContent(style + ". title\n\n")
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
        var paragraph = $('<p class="textile_editor_buttons"></p>')

        var bold = $('<input type="button" value="B" />')
        bold.css('font-weight', 'bold')
        bold.click(function() { textarea.textileEditorApplyStyle('bold') })

        var italic = $('<input type="button" value="I" />')
        italic.css('font-style', 'italic')
        italic.click(function() { textarea.textileEditorApplyStyle('italic') })

        var underline = $('<input type="button" value="U" />')
        underline.css('text-decoration', 'underline')
        underline.click(function() { textarea.textileEditorApplyStyle('underline') })

        var deleted = $('<input type="button" value="D" />')
        deleted.css('text-decoration', 'line-through')
        deleted.click(function() { textarea.textileEditorApplyStyle('deleted') })

        var link = $('<input type="button" value="link" />')
        link.css('color', '#00a').css('text-decoration', 'underline')
        link.click(function() { textarea.textileEditorApplyStyle('link') })

        var h1 = $('<input type="button" value="h1" />')
        h1.css('font-weight', 'bold')
        h1.click(function() { textarea.textileEditorApplyStyle('h1') })

        var h2 = $('<input type="button" value="h2" />')
        h2.css('font-weight', 'bold')
        h2.click(function() { textarea.textileEditorApplyStyle('h2') })

        var h3 = $('<input type="button" value="h3" />')
        h3.css('font-weight', 'bold')
        h3.click(function() { textarea.textileEditorApplyStyle('h3') })

        var blockquote = $('<input type="button" value="”" />')
        blockquote.click(function() { textarea.textileEditorApplyStyle('bq') })

        paragraph.append(bold, italic, underline, deleted, link, h1, h2, h3, blockquote)

        $(this).parent().before(paragraph)

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
              case 68: textarea.textileEditorApplyStyle('deleted') // CTRL + D
                       e.preventDefault()
                       break
              case 85: textarea.textileEditorApplyStyle('underline') // CTRL + U
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
