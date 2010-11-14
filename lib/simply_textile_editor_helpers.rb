module SimplyTextileEditor

  module Helpers

    # render as json all directories which contain pictures (AJAX call)
    def process_pictures_directories_listing
      path = File.join(Rails.root, 'public', SimplyTextileEditor::Settings.pictures_directory)
      Dir.chdir(path)

      out = []

      # include default directory if there are some pictures inside
      out << SimplyTextileEditor::Settings.pictures_directory if Dir.glob(SimplyTextileEditor::Settings.pictures_filenames_pattern).any?

      # fetch all subdirectories; 1 level deep ONLY
      subdirectories = Dir.glob('**').select {|e| File.directory?(File.join(path, e))}

      subdirectories.each do |dir|
        # include each subdirectory with pictures
        out << "#{SimplyTextileEditor::Settings.pictures_directory}/#{dir}" if Dir.glob(File.join('**', dir, SimplyTextileEditor::Settings.pictures_filenames_pattern)).any?
      end

      respond_to do |wants|
        wants.json { render :json => out.to_json }
      end
    end

    # render as json the list of all pictures under a specified directory (params[:directory])
    def process_pictures_listing
      # no directory specified
      raise Exception if params[:directory].blank?

      path = File.join(Rails.root, 'public', params[:directory])

      # directory does not exist
      raise Exception if !File.directory?(path)

      Dir.chdir(path)

      respond_to do |wants|
        wants.json { render :json => {params[:directory] => Dir.glob(SimplyTextileEditor::Settings.pictures_filenames_pattern).sort}.to_json }
      end
    end

  end

end
