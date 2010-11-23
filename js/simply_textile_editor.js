// AJAX setup
$.ajaxSetup({
  type: 'POST',
  dataType: 'json'
})

// global pictures variable; hold all fetched {directory: pictures} pairs (CACHING SYSTEM)
var pictures = {}

$(document).ready(function() {

  // preload the spinner image
  var spinner = $('<img/>').attr('src', '/images/spinner.gif').attr('alt', 'Chwila, moment...').attr('class', 'loading')

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

  // function applying inline textile style for text
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

  // function to insert content into the textarea (replacing any existing selection)
  $.fn.textileEditorInsertContent = function(content) {
    var textarea = $(this)
    textarea.replaceSelection(content)
  }

  // function adding the styling buttons above all textile enabled textareas
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

        var img = $('<input type="button" value="img" />')
        img.addClass('img')
        img.click(function() { textarea.toggleInsertPictureDialog() })

        span.append(bold, italic, link, h1, h2, h3, bq, del, ins, ul, ol, img)

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

  // Enable the textile editor for certain textareas
  $('textarea.textile_editor').textileEditorEnable()


  // --------------------------------------------------------------- //
  // INSERT PICTURE                                                  //
  // --------------------------------------------------------------- //

  // function to populate <select> element with pictures filenames (as <option> elements)
  $.fn.updatePicturesFilenames = function(directory) {
    var picture_filename = $(this)
    picture_filename.empty()

    var filenames = ''
    for (var i in pictures[directory]) {
      filenames += '<option value="' + pictures[directory][i] + '">' + pictures[directory][i] + "</option>\n"
    }
    picture_filename.append($(filenames))
  }

  // function to select a filename in <select> element
  $.fn.selectFilename = function(filename) {
    $(this).find('option[value="' + filename + '"]').parent().val(filename)
  }

  // function to fetch pictures for the selected directory
  $.fn.fetchPictures = function(opts) {
    // function arguments: first is the directory and the second one [optional] is the filename to select after reloading the list
    var directory = arguments[0]
    var filename_to_select = arguments[1]

    var picture_filename = $(this)
    if (pictures[directory] == undefined) {
      $.ajax({
        url: '/panel/lista-zdjec',
        data: {directory: directory},
        beforeSend: function() {
          picture_filename.hide().after(spinner.clone())
        },
        success: function(json) {
          // add picture filenames to the global pictures variable
          pictures[directory] = json[directory]
          // populate <select> with pictures filenames
          picture_filename.updatePicturesFilenames(directory)
          // show picture filename <select> & hide spinner
          picture_filename.show().parent().find('.loading').remove()

          // select filename if there is one to select
          if (filename_to_select != undefined) {
            picture_filename.selectFilename(filename_to_select)
          }
        }
      })
    } else {
      // populate <select> with pictures filenames
      picture_filename.updatePicturesFilenames(directory)

      // select filename if there is one to select
      if (filename_to_select != undefined) {
        picture_filename.selectFilename(filename_to_select)
      }
    }
  }

  // there is a textile editor enabled textarea on the page
  if ($('textarea.textile_editor').size() > 0) {

    // attach insert picture box to the <body> element if
    var div = $('<div class="insert_picture_box"></div>')
    div.append($('<h2>Wstaw zdjęcie</h2>'))

    // directory select
    div.append($('<p><label for="picture_directory">Katalog:</label> <select id="picture_directory"></select></p>'))

    // picture filename select
    div.append($('<p><label for="picture_filename">Zdjęcie:</label> <select id="picture_filename"></select></p>'))

    // picture alignment
    div.append($('<p>Wyrównaj:<br /><input type="radio" id="picture_alignleft" name="picture_alignment" value="alignleft" /><label for="picture_alignleft">do lewej</label> <input type="radio" id="picture_centered" name="picture_alignment" checked="checked" value="centered" /><label for="picture_centered">do środka</label> <input type="radio" id="picture_alignright" name="picture_alignment" value="alignright" /><label for="picture_alignright">do prawej</label></p>'))

    // picture size (for right and left aligned pictures) (initially hidden)
    div.append($('<p class="picture_sizes" style="display: none">Przybliżona wielkość zdjęcia:<br /><input type="radio" id="picture_small" name="picture_size" value="small" /><label for="picture_small">małe <em>(~200px)</em></label> <input type="radio" id="picture_medium" name="picture_size" checked="checked" value="medium" /><label for="picture_medium">średnie <em>(~250px)</em></label> <input type="radio" id="picture_big" name="picture_size" value="big" /><label for="picture_big">duże <em>(~350px)</em></label></p>'))

    // spacer
    div.append($('<hr />'))

    // picture caption
    div.append($('<p><label for="picture_caption">Opis zdjęcia:</label> <input type="text" id="picture_caption" class="picture_caption" /></p>'))

    // show caption below the picture?
    div.append($('<p><input type="checkbox" id="show_caption"/> <label for="show_caption">wyświetlić opis pod zdjęciem?</label>'))

    // spacer
    div.append($('<hr />'))

    // optional link
    div.append($('<p><label for="picture_link">Link (opcjonalny):</label> <input type="text" id="picture_link" class="picture_link"/></p>'))

    // insert / cancel buttons
    div.append($('<p class="buttons"><input type="button" class="insert" value="Wstaw zdjęcie" /><input type="button" value="Zamknij" class="cancel" /></p>'))

    // attach the box to the body tag
    $('body').prepend(div)


    var picture_directory = $('#picture_directory')
    var picture_filename = $('#picture_filename')

    // fetch pictures directories (on pageload)
    $.ajax({
      url: '/panel/lista-katalogow-ze-zdjeciami',
      success: function(json) {
        // add directories as options to <select>
        for (var i in json) {
          picture_directory.append($('<option value="' + json[i] + '">' + json[i] + "</option>\n"))
        }

        // fetch pictures for the first directory
        var directory = picture_directory.find('option:selected').val()
        if (directory && directory.length > 0) {
          picture_filename.fetchPictures(directory)
        }
      }
    })

    // fetch pictures for the newly selected directory
    picture_directory.change(function() {
      var directory = picture_directory.find('option:selected').val()
      picture_filename.fetchPictures(directory)
    })
  }

  // function: show/hide insert picture box
  $.fn.toggleInsertPictureDialog = function() {
    var button = $(this)

    // button has display: inline style, so offset properties do not work in IE on it, so we use parent element (span), which has display: block
    var buttons = button.parent()
    var buttons_offset = buttons.offset()

    var textarea = button.parent().find('textarea')
    var textarea_offset = textarea.offset()

    var div = $('.insert_picture_box')

    // reposition the box if it's not visible
    if (div.css('display') == 'none') {
      // apply css positioning (give the box a "block: display" style for a split second to correctly read its "offsets")
      div.css('display', 'block')
      div.css('left', buttons_offset.left + textarea[0].offsetWidth - div[0].offsetWidth)
      div.css('top', textarea_offset.top)
      div.css('display', 'none')
    }

    // show/hide box
    div.slideToggle(100)

    // mark the active textarea as 'selected' so later on we can determine which textarea to insert the picture tag to
    if (div.css('display') == 'block') {
      // clear all previously selected states
      $('textarea').attr('data-selected', '')
      // mark current textarea as selected
      textarea.attr('data-selected', 'true')
    }
  }

  // hide insert picture box (cancel button)
  $('.insert_picture_box .cancel').live('click', function() {
    $(this).parent().parent().slideUp(100)
  })

  // show/hide picture size radio buttons (they are only valid for left and right aligned images)
  $('input[type="radio"][name="picture_alignment"]').change(function() {
    var picture_alignment = $(this).val()
    var picture_sizes = $(this).parent().parent().find('.picture_sizes')

    if (picture_alignment == 'centered') {
      picture_sizes.hide()
    } else {
      picture_sizes.show()
    }
  })

  // actually insert picture tag into the textarea
  $('.insert_picture_box input[type="button"].insert').live('click', function() {
    var div = $(this).parent().parent()

    // directory
    var directory = $('#picture_directory option:selected').val()
    if (directory[0] != '/') directory = '/' + directory
    if (directory[directory.length - 1] != '/') directory = directory + '/'

    // filename
    var filename = $('#picture_filename option:selected').val()

    // alignment
    var alignment = $('input[type="radio"][name="picture_alignment"]:checked').val()

    // size
    var size = $('input[type="radio"][name="picture_size"]:checked').val()

    // caption: convert " to ', remove <> and trim whitespace
    var caption = $('#picture_caption').val().replace(/["]/g, "'").replace(/[<>]/g, '').replace(/^\s+|\s+$/g, "")

    // show caption below the picture?
    var show_caption = $('#show_caption:checked').size() > 0 ? 'true' : 'false'

    // link
    var link = $('#picture_link').val()

    // BUILD the textile picture tag
    var tag = 'picture(' + alignment
    if ((alignment == 'alignleft') || (alignment == 'alignright')) tag += ' ' + size
    tag += '). ' + directory + filename + '|' + caption + '|' + show_caption
    if (link.length > 0) tag += '|' + link

    // insert picture tag into the textarea (selected text area will have the 'data-selected' attribute set to 'true')
    var textarea = $('textarea[data-selected="true"]')
    if (textarea.size() > 0) {
      textarea.textileEditorInsertContent("\n" + tag + "\n\n")
    }

    // close insert picture dialog
    $('.insert_picture_box').slideUp(100)
  })

  // function to use in conjunction with the simply_file_upload plugin; it's called whenever there is a new picture uploaded and we want to have it automatically selected
  $.extend({
    selectNewlyUploadedPicture: function(path) {
      arr = path.split('/')

      // first element is empty (root directory)
      arr.shift()

      // select filename and dirname (under public/ without trailing slash) from the path
      filename = arr.pop()
      directory = arr.slice($.inArray('public', arr) + 1, arr.length).join('/')

      // update global 'pictures' variable with the newly uploaded picture filename
      if (pictures[directory] != undefined) {
        pictures[directory].push(filename)
      }

      // make the directory with the uploaded picture selected
      $('#picture_directory').val(directory)

      // update pictures lists for the selected directory and make the uploaded filename selected
      var picture_filename = $('#picture_filename')
      picture_filename.fetchPictures(directory, filename)
    }
  })

})
