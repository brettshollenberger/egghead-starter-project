require 'json'
require 'pry'

task :seed do
    5.times do |n|
        puts n
        sleep 1
    end
    File.open(File.expand_path("./db.test.json"), "wb") do |f|
        f.puts({
            todos: []
        }.to_json)
    end
end