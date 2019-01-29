require 'json'
require 'pry'

task :seed do
    File.open(File.expand_path("./db.test.json"), "wb") do |f|
        f.puts({
            todos: []
        }.to_json)
    end
end