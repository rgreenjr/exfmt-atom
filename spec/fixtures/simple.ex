defmodule   App     do
  @big_number 12344567
  @short_list = [
    :alpha,         :beta ]
  @long_list = [
:alpha	,
:beta	,
:gamma	,
:delta	,
:eta	,
:theta	,
:iota	,
:kappa	,
:lambda,
:nu,
:xi,
:omnicron,
:pi,
:rho,
:sigma
]

  def one() do
  Enum.map [
    "one",           <<"two">>,
    "three"],
        fn(num)        -> IO.puts   (num)
    end
  end

  # function two comment
  def two(some_string) do
  some_string |> String.downcase() |> String.strip()
  end
end
