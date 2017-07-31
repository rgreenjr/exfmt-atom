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

```sh
mix deps.get
```

Install `exfmt-atom`:

```sh
apm install exfmt-atom
```

## Usage

You can use `exfmt-atom` in two ways:

- Manually via the keyboard shortcut `CTRL + ALT + F` (or by going to
**Packages → Elixir Formatter → Format File**). If there isn't a text
selection, the entire file will be formatted.
- Automatically by enabling **Format on Save** in Settings, which will format
the entire file on save.

## Known Issues

`exfmt` is in alpha and doesn't correctly format all Elixir code.

## Maintainers

[Ron Green](https://github.com/rgreenjr)
