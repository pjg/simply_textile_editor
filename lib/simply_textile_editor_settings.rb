module SimplyTextileEditor
  # Settings for the SimplyTextileEditor plugin. You can override them on the global level
  # by putting the following into "config/initializers/simply_textile_editor.rb":
  #
  #   SimplyTextileEditor::Settings.pictures_directory = 'zdjecia'
  #
  module Settings

    # directory where the pictures are (under public/)
    @@pictures_directory = 'pictures'

    # allowed pitures filenames
    @@pictures_filenames_pattern = '*.{jpg,jpeg,JPG,JPEG,gif,GIF,png,PNG}'

    mattr_accessor :pictures_directory, :pictures_filenames_pattern
  end
end
