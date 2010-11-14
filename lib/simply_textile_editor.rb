require 'simply_textile_editor_helpers'
require 'simply_textile_editor_settings'

# Helpers will be available in all controllers
ActionController::Base.send :include, SimplyTextileEditor::Helpers
