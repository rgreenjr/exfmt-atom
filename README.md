# exfmt-atom package

An Atom package to format Elixir source code using the
[exfmt](https://github.com/lpil/exfmt) formatter.

## Installation

Add `exfmt` to your `mix.exs` dependencies:

```elixir
def deps do
  [{:exfmt, [github: "lpil/exfmt"]}]
end
```

Fetch and install dependencies:

```
mix deps.get
```

Install `exfmt-atom`:

```
apm install exfmt-atom
```

## Known Issues

`exfmt` is in alpha and doesn't correctly format all Elixir code.

## Maintainers

[Ron Green][rgreenjr]
