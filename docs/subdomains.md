# Example Subdomains

Kliko can link showcase cards to live example sites through environment variables:

```text
EXAMPLE_PRIMERI_URL=https://primeri.proforin.online/
EXAMPLE_PRIMERI_2_URL=https://primeri-2.proforin.online/
```

The current fallback URLs in code point to working GitHub Pages deployments:

- `https://plague40404.github.io/primeri/`
- `https://plague40404.github.io/primeri-2.0/`

## DNS Setup

To make the production subdomains work, add these DNS records for `proforin.online`:

| Host | Type | Target |
| --- | --- | --- |
| `primeri` | `CNAME` | `plague40404.github.io` |
| `primeri-2` | `CNAME` | `plague40404.github.io` |

After DNS resolves, add a `CNAME` file to each example repository:

```text
primeri.proforin.online
```

for `plague40404/primeri`, and:

```text
primeri-2.proforin.online
```

for `plague40404/primeri-2.0`.

Do not add the `CNAME` files before DNS is ready, otherwise the current GitHub Pages URLs may redirect to unresolved subdomains.
