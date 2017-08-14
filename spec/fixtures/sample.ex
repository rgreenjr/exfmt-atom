defmodule App do
  @very_long = %{ foo: "bar", baz: "1", bar: "bar", quux: "bar", banana: "bar", apple: "bar", ananas: "bar", morestuff: "bar", katonka: "bar" }

  def one() do
  Enum.map [
    "one",           <<"two">>,
    "three"],
        fn(num)        -> IO.puts   (num)
    end
  end

  # function two comment
  def two(some_string) do
  some_string |> String.downcase |> String.strip
  end
end
